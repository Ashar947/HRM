const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const leaveSchema = new mongoose.Schema({
    empId: {
        type:String,
        required: true
    },
    empName: {
        type: String,
        required: true
    },
    Reason:{
        type: String,
        required : true
    },
    leaveType: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        required: true
    },
    
});


const registerLeave = new mongoose.model("Leave Applications", leaveSchema);
module.exports = registerLeave