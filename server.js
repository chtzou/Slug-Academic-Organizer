const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require('fs');
const historyApiFallback = require('connect-history-api-fallback');
const path = require('path');

// Import JSON data of courses
const schedule = require("./api/data/schedule.json");

// Define a model of data
const Data = require("./server/models/Data");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Connect to MongoDB
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// API routes
require('./server/routes/api/signin.js')(app);

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

    newData.save().then(console.log(`Saving ${i} documents ...`));
  }

  res.send("Done!");
});

// A route that's still in progress ...
app.post("/api/getClasses", (req, res) => {
  console.log(req.body.class);
  //do stuff with the scraper?
  res.send({ express: "I don't know what to put here" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
