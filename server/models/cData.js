const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create data schema that'll hold schedule info
const cDataSchema = new Schema({
  courseID: {
    type: String,
  },
  courseTitle: {
    type: String,
  },
  description: {
    type: String,
  },
  credits: {
    type: Number,
  },
});

module.exports = cData = mongoose.model("cData", cDataSchema, "userClasses");