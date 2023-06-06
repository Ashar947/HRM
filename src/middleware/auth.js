const jwt = require("jsonwebtoken");
const Register = require("../models/register");
const async = require("hbs/lib/async");

const auth = async(req,res,next) =>{
    try{
        const  token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,"Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        // console.log(verifyUser);
        const user = await Register.findOne({_id:verifyUser._id});
        // console.log(user);
        req.token = token;
        req.user = user;
        next();
    } catch(error){
        res.status(401).send(error);
    }
}

module.exports = auth;