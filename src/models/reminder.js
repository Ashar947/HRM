const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const reminderSchema = new mongoose.Schema({
    Heading: {
        type: String,
        required: true
    },
    Date:{
        type:String,
        required:true
    }                      
});
const registerReminder = new mongoose.model("Reminder",reminderSchema);
module.exports = registerReminder