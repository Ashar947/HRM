const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const employeeSchema = new mongoose.Schema({
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        contactNumber: {
            type: Number,
            required: true,
            unique: true
        },
        age: {
            type: Number,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        Designation: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        Salary : {
            type:Number,
            required:true
        },
        citizenNumber: {
            type: String,
            required: true,
            unique: true,
        },
        profilePicture:{
            type: String,
            required: true,
        },
        CNIC:{
            type: String,
            required: true,
        },
        offerLetter:{
            type: String,
            required: true,
        },
        tokens:[{
        token:{
            type: String,
            required: true,
            unique: true, 
        }                                                                       
}]                    
    });

    employeeSchema.methods.generateAuthToken = async function(){
        try{
            const token = jwt.sign({_id:this._id.toString()},"Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
            this.tokens=this.tokens.concat({token:token})
            console.log(token)
            await this.save();
            return token;

        } catch (error){
            console.log(`Error is "${error}"`);
        }
    }



const registerEmployee = new mongoose.model("Register",employeeSchema);

module.exports = registerEmployee