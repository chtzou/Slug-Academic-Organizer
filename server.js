const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// JSON
const schedule = require("./lib/data/schedule.json");

// Models
const ClassData = require("./server/models/classData");
const Data = require("./server/models/Data");
const cData = require("./server/models/cData");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Port
const port = process.env.PORT || 5000;

// Connect to MongoDB
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// API routes
require("./server/routes/api/signin.js")(app);

// Base route that's still in progress ...
app.get("/", (req, res) => {
  res.send({ express: "Connected!" });
});

// Push all JSON data into database
app.post("/api", (req, res) => {
  for (let i = 0; i < bsoe.length; i++) {
    // Create new model that'll hold schedule data
    const newData = new Data({
      courseID: schedule[i].courseID,
      courseTitle: schedule[i].courseTitle,
      description: schedule[i].description,
      credits: parseInt(schedule[i].credits),
      terms: schedule[i].terms,
      sections: schedule[i].sections
    });

    // Save to db under collection data(s)
    newData.save().then(console.log(`Saving ${i} documents ...`));
  }

  res.send("Done!");
});

// Posts class form submission to database
app.post("/api/submitClass", (req, res) => {
  console.log(req.body);
  const classData = new ClassData({
    courseID: req.body.class,
    meetingDays: [req.body.M, req.body.Tu, req.body.W, req.body.Th, req.body.F],
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    location: req.body.location,
    section: req.body.section,
    sMeetingDays: [
      req.body.sM,
      req.body.sTu,
      req.body.sW,
      req.body.sTh,
      req.body.sF
    ],
    sStartTime: req.body.sStartTime,
    sEndTime: req.body.sEndTime,
    sLocation: req.body.sLocation
  });
  classData.save().then(console.log(`Saving documents ...`));
  res.send({ express: "done" });
});

// get courses based of chtzhou's GEReq
app.get("/api/GetCourses", (req, res) => {
  cData.find(function(err, cs){
    if(err){
      //error messages
      console.log("error");
      return res.status(500).send({courseError: "Error"});
    }else{
      //array courses
      coursesArray = [];
      //course data
      cs.forEach(function(c){
        const newCourse = {
          courseID: c.courseID,
		  courseTitle: c.courseTitle,
		  description: c.description,
		  credits: c.credits,
        };
        //pushing each courses onto the array
        coursesArray.push(newCourse);
      });
      //send the data to whoever requests it
	  //console.log(coursesArray);
      res.send(coursesArray);
    }
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

