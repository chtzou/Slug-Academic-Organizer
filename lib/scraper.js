"use strict";

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const classes = require("./data/courses.json");
const info = require("./data/info.json");

const dirPath = path.join(__dirname, "/data/depo");

/* Use of scraper documentation can be found here:
 * https://www.npmjs.com/package/cheerio
 * https://www.npmjs.com/package/axios
 * https://nodejs.org/api/fs.html
 * 
 * These functions scrape data off various BSOE
 * url's, and if they were to be ran again, JSON might
 * be overwritten. Use with caution.
*/

// Return all BSOE departments in JSON
const getDepartments = () => {
  axios
    .get("https://courses.soe.ucsc.edu/")
    .then(res => {
      if (res.status === 200) {
        const html = res.data;
        const $ = cheerio.load(html);
        let departments = [];
        // Grab elements and store as object
        $("h2").map((i, elem) => {
          departments[i] = {
            title: $(elem)
              .text()
              .trim()
          };
        });
        // Create JSON from departments
        fs.writeFile(
          "data/departments.json",
          JSON.stringify(departments, null, 4),
          err => {
            console.log("File successfully written");
          }
        );
      }
    })
    .catch(e => console.log(e));
};

// Return all BSOE courses in JSON
const getCourses = () => {
  axios
    .get("https://courses.soe.ucsc.edu/")
    .then(res => {
      if (res.status === 200) {
        const html = res.data;
        const $ = cheerio.load(html);
        let courses = [];
        // Grab elements and store as object
        $("li").map((i, elem) => {
          let str = $(elem)
            .text()
            .split(":");
          courses[i] = {
            courseID: str[0].trim(),
            courseTitle: str[1].trim()
          };
        });
        // Create JSON from courses
        fs.writeFile(
          "data/courses.json",
          JSON.stringify(courses, null, 4),
          err => {
            console.log("File successfully written");
          }
        );
      }
    })
    .catch(e => console.log(e));
};

// Return all BSOE course schedules in JSON
const getSchedule = () => {
  for (let i = 0; i < branches.length; i++) {
    axios.get(branches[i].url).then(res => {
      if (res.status === 200) {
        const html = res.data;
        const $ = cheerio.load(html);
        let schedule = [];
        $(".course-name").map((i, elem) => {
          // Get course ID
          const courses = $(elem)
            .children("a")
            .text()
            .split(":")
            .map(tag => tag.trim());

          // Get quarters offered
          let season = $(elem)
            .parent()
            .next()
            .children(".class")
            .find("li")
            .children("a")
            .map((i, elem) => {
              return $(elem).attr("href");
            })
            .get();

          // Break apart the href into an array
          season = season.map((i, elem) => {
            return i
              .split("/")
              .map(tag => tag.trim())
              .filter(function(n) {
                return n != "";
              });
          });

          // Get section data of course
          const section = $(elem)
            .parent()
            .next()
            .children(".class")
            .find("li")
            .contents()
            .text()
            .split("\n")
            .map(tag => tag.trim())
            .filter(function(n) {
              return n != "";
            });

          // If the course is offered, return data
          if (season.length > 0 && section.length > 0) {
            const available = season.map((i, el) => {
              return i[2];
            });

            schedule[i] = {
              courseID: courses[0],
              quarters: [...new Set(available)],
              sections: section
            };
          }
          // If the course is not offered, return blank data
          else {
            schedule[i] = {
              courseID: courses[0],
              quarters: [],
              sections: []
            };
          }
        });

        // Send data to a file in JSON
        fs.writeFile(
          `data/depo/${branches[i].depoID}.json`,
          JSON.stringify(schedule, null, 4),
          err => {
            console.log("File successfully written");
          }
        );
      }
    });
  }
};

// Return all BSOE course info in JSON
const getCourseInfo = async () => {
  let data = [];
  // Loop through each course offered
  for (let i = 0; i < classes.length; i++) {
    try {
      // Get the page of the course using its id
      const response = await axios.get(
        `https://courses.soe.ucsc.edu/courses/${classes[i].courseID}`
      );

      // Check if page is valid
      if (response.status === 200) {
        // Get the data (html) of the page, load scraper
        const html = await response.data;
        const $ = cheerio.load(html);

        // Get 1st paragraph below the <div> -- description
        const desc = $(".soe-classes-department-notes")
          .next()
          .text()
          .trim();

        // Get 2nd paragraph below the <div> -- credits
        const credit = $(".soe-classes-department-notes")
          .next()
          .next()
          .text()
          .trim();

        // Push the acquired info into an array as an object
        data.push({
          courseID: classes[i].courseID,
          description: desc,
          credits: credit
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  // // Write data to JSON
  fs.writeFile(`data/info.json`, JSON.stringify(data, null, 4), err => {
    console.log("File successfully written");
  });
};

// Merge all course data into one JSON file
const mergeData = () => {
  const allSchedules = [];
  let curr = 0;
  // Read directory based off directory path
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return console.log(`Unable to scan directory ${err}`);
    }

    // Loop through each file
    files.forEach(file => {
      // Take the contents of each file
      const data = require(`./data/depo/${file}`);
      for (let i = 0; i < classes.length; i++) {
        if (data[curr] !== undefined) {
          // If course exists & matches, push the object
          if (classes[i].courseID === data[curr].courseID) {
            allSchedules.push({
              courseID: classes[i].courseID,
              courseTitle: classes[i].courseTitle.trim(),
              description: info[i].description,
              credits: info[i].credits,
              terms: data[curr].quarters,
              sections: data[curr].sections
            });
            curr++;
          }
        }
      }
      curr = 0;
    });

    // Write file to JSON
    fs.writeFile(
      `data/schedule.json`,
      JSON.stringify(allSchedules, null, 4),
      err => {
        console.log("File successfully written");
      }
    );
  });
};
