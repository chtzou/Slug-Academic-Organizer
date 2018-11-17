const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require('axios');

const app = express();

// JSON
const schedule = require("./lib/data/schedule.json");
const geSchedule = require("./lib/data/ge.json")

// Models
const ClassData = require("./server/models/classData");
const Data = require("./server/models/Data");
const GEData = require("./server/models/geData");
const Courses = require("./server/models/Courses");

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

// Sorts User Class data into dictionary: {year: [fall classes], [summer classes], [spring classes], [winter classes]}
function sortByQuarter(userClasses) {
	var sorted = {};
	for (i = 0; i < userClasses.length; i++) {
		if (!(userClasses[i].year in sorted)) { // If not in dictionary
			sorted[userClasses[i].year] = [[], [], [], []];
			sorted[userClasses[i].year][userClasses[i].quarter].push(
				{ courseID: userClasses[i].courseID, _id: userClasses[i]._id });
		} else {
			sorted[userClasses[i].year][userClasses[i].quarter].push(
				{ courseID: userClasses[i].courseID, _id: userClasses[i]._id });
		}
	}
	return sorted;
}

// Gets all user classes from the database and returns in a sorted manner
app.post("/api/userClasses", (req, res) => {
	var userClasses = [];
	var sorted = {};
	// Find all the user classes
	ClassData.find({ 'userToken': req.body.userID }, function (err, classes) {
		if (err) {
			console.log(err);
			return res.status(500).send({ message: 'Failed to load user classes' });
		} else {
			classes.forEach(function (userClass) {
				const newClass = {
					courseID: userClass.courseID, year: userClass.year,
					quarter: userClass.quarter, _id: userClass._id
				};

				userClasses.push(newClass);
			});
			sorted = sortByQuarter(userClasses); // Sort all the data so we can display it easily
			res.send(sorted);
		}
	}).then(console.log(`Getting user classes ...`));
});

// Gets user claasses for the major requirments page
app.post("/api/majorClasses", (req, res) => {
	var userClasses = [];
	ClassData.find({ 'userToken': req.body.userID }, function (err, classes) {
		if (err) {
			console.log(err);
			return res.status(500).send({ message: 'Failed to load user classes' });
		} else {
			classes.forEach(function (userClass) {
				const newClass = { courseID: userClass.courseID };
				userClasses.push(newClass);
			});
			res.send(userClasses);
		}
	}).then(console.log(`Getting user classes ...`));
});

// Push all JSON data into database
app.post("/api", (req, res) => {
	for (let i = 0; i < schedule.length; i++) {
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

//ge post request
app.post("/api/ge", (req, res) => {
	for (let i = 0; i < geSchedule.length; i++) {
		// Create new model that'll hold schedule data
		const geData = new GEData({
			geID: geSchedule[i].geID,
			desc: geSchedule[i].desc,
			credits: parseInt(geSchedule[i].credits),
		});
		geData.save().then(console.log(`Saving ${i} documents ...`));
	}
	res.send("GE Done!");
});


//ge get request
app.get("/api/GERequirements", (req, res) => {
	GEData.find(function (err, ge) {
		if (err) {
			//error messages
			console.log("error");
			return res.status(500).send({ geError: "Error" });
		} else {
			//array requirements
			requirements = [];
			//for each GE, put each category in the right place
			ge.forEach(function (GE) {
				const NewGE = {
					geID: GE.geID,
					desc: GE.desc,
					credits: GE.credits,
				};
				//pushing each GE onto the array
				requirements.push(NewGE);
			});
			//send the array to GERequirements.js
			res.send(requirements);
		}
	});
});

function parseYear(year) {
	year = year.toString();
	if (year.length === 4){
		return year.slice(2);
	}
	return year;
}

function quarterNumberToString(quarter){
	if(quarter === 0){
		quarter = 'Fall';
	}else if(quarter === 1){
		quarter = 'Summer';
	}else if(quarter === 2){
		quarter = 'Spring';
	}else if(quarter === 3){
		quarter = 'Winter';
	}
	return quarter;
}

// Posts class form submission to database
app.post("/api/submitClass", (req, res) => {
	console.log(req.body);
	let schema = quarterNumberToString(req.body.quarter)+parseYear(req.body.year);
	console.log(schema);
	if(Courses[schema] === undefined){
		const classData = new ClassData({
			courseID: req.body.class,
			userToken: req.body.userID,
			quarter: req.body.quarter,
			year: req.body.year
		});
		classData.save(function (err, newClass) {
			res.send({ express: "done", _id: newClass._id });
		});
	}else{
		Courses[schema].find({courseID: req.body.class}, function(err, classData){
			if(err){
				console.log(err);
				return res.status(500).send({ message: 'Failed to find submitted class' });
			}else{
				classData.forEach(function (data) {
					const userClass = new ClassData({
						courseID: data.courseID,
						userToken: req.body.userID,
						quarter: req.body.quarter,
						year: req.body.year,
						GE: data.meta.general_education
					});
					userClass.save(function (err, newClass) {
						res.send({ express: "done", _id: newClass._id });
					});
				});
			}
		})
	}
});

// Deletes class from the database
app.post("/api/deleteClass", (req, res) => {
	ClassData.findByIdAndRemove(req.body._id, function (err, classes) {
		if (err) {
			console.log(err);
			return res.status(500).send({ message: 'Failed to load user classes' });
		} else {
			res.send({ express: "done" });
		}
	});
});

// Gets course datas from requested classes
app.post("/api/getMajorClassData", async (req, res) => {
	/*const quarterNames = Object.keys(Courses);
	let quarterData = [];
	for(let quarter = 0; quarter<quarterNames.length; quarter++){
		quarterData.push(quarterNames[quarter] = axios.post('api/getEachQuarter', 
			{
				classes: req.body.classes,
				quarter: quarterNames[quarter]
			}
		));
	}
	console.log(quarterData);
	let returnData = await Promise.all(quarterData);
	console.log(returnData);*/
});

function getQuarter (quarter, classes) {
	return (axios.post('api/getEachQuarter',
		{
			classes: classes,
			quarter: quarter
		}
	));
}

app.post("/api/getEachQuarter", (req,res) => {
	console.log(req.body.classes);
	const classes = Object.keys(req.body.classes);
	let classDatas = {}, find = [];
	for (let i = 0; i < classes.length; i++) {
		find.push({ courseID: classes[i] });
	}

	Courses[req.body.quarter].find({ $or: find }, function (err, classData) {
		if (err) {
			console.log("error");
			return res.status(500).send({ geError: "Error" });
		} else {
			classData.forEach(function (data) {
				const courseTitle = data.courseTitle.slice(data.courseID.length + 9);
				classDatas[data.courseID] = {
					description: data.description,
					prereqs: data.prereqs,
					courseTitle: courseTitle
				};
			});
			res.send(classDatas);
		}
	});
});

app.listen(port, () => console.log(`Listening on port ${port}`));
