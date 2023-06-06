const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8000;
const hbs = require("hbs");
const jwt = require("jsonwebtoken");
require("./db/conn");
const Register = require("./models/register");
const reminderRegister = require("./models/reminder");
const leaveApplication = require("./models/leave");
const async = require("hbs/lib/async");
const auth = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { cookie, redirect } = require("express/lib/response");
const { ObjectId } = require("mongodb");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
const templatepath = path.join(__dirname, "../templates/views");
// const staticPath = path.join(__dirname,"../public");
const partialspath = path.join(__dirname, "../templates/partials");
// const staticPath = path.join(__dirname,)
app.set("view engine", "hbs");
app.set("views", templatepath);
hbs.registerPartials(partialspath);
app.use(express.static('public'));

let Storage = multer.diskStorage({
    destination:'public/files/',
    filename : (req,file,cb)=>{
        cb(null , Date.now()+ "--" + file.originalname);
    },

});

let upload = multer({
    storage:Storage,
})


app.get("/main", auth, async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        let total = 0;
        let sum = 0;
        const emp = await Register.find();
        const leave = await leaveApplication.find();
        for (y in leave) {
            sum = sum + 1;
        };
        for (x in emp) {
            total = total + 1;
        };
        const rem = await reminderRegister.find();
        let firstName = user.firstName;
        let lasttName = user.lastName;
        let des = user.Designation;
        console.log(des);
        res.render('index', {Designation:des,totalEmp: total, reminder: rem, date: Date(), f: firstName, l: lasttName, sumLeaves: sum });
    } catch (error) {
        res.send("Need to be logged in ");
    }

});
app.get("/hirenew", auth, async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        let Designation = user.Designation;
        if (Designation == 'HR') {
            res.render('signup');
        }
        else {
            res.send("Employees cannot Access this page");

        }
        // console.log(user.Designation);
    } catch (error) {
        res.send(`Needs to be logged in  Error : ${error}`);
    }
});
app.get("/profile", auth, async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        let firstName = user.firstName;
        let lastName = user.lastName;
        let email = user.email;
        let contactNumber = user.contactNumber;
        let age = user.age;
        let Designation = user.Designation;
        let address = user.address;
        let cnicnum = user.citizenNumber;
        let Salary = user.Salary;
        console.log(user.profilePicture);
        res.render("profile", { f: firstName, l: lastName, e: email, cn: contactNumber, des: Designation, add: address, age: age, cnicnum: cnicnum, salary: Salary , pic:user.profilePicture, letter : user.offerLetter , cnic:user.CNIC });
    } catch (error) {
        res.send(`Error is :: ${error}`);
    }
});
const cpUpload = upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'cnic', maxCount: 1 } , {name:'letter',maxCount:1}])
app.post("/hirenew",cpUpload, async (req, res) => {
    try {
        const registerEmployee = new Register({
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            age: req.body.age,
            password: req.body.password,
            Designation: req.body.designation,
            address: req.body.Address,
            Salary: req.body.salary,
            citizenNumber: req.body.citizenNum,
            profilePicture : req.files['profile'][0].filename,
            CNIC : req.files['cnic'][0].filename,
            offerLetter : req.files['letter'][0].filename,
        })
        const token = await registerEmployee.generateAuthToken();
        const register = await registerEmployee.save();
        res.status(201).redirect('/main');
    } catch (err) {
        res.send(`error is ${err}`);
    }
});

app.get("/reminder", auth, async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        let Designation = user.Designation;
        if (Designation == 'HR') {
            res.render('reminder');
        }
        else {
            res.send("Employee cant access this page");
        };
    } catch (error) {
        res.send("Employee can't access this page");
    }
});

app.post("/reminder", auth, async (req, res) => {
    try {
        const heading = req.body.heading;
        const registerReminder = new reminderRegister({
            Heading: heading,
            Date: Date(),
        });
        const registerRem = await registerReminder.save();
        res.redirect("/main");
    } catch (error) {
        res.send(error);
    }
});
app.get("/", (req, res) => {
    res.render("signin");
});
app.post("/", async (req, res) => {

    const email = req.body.email;
    const pass = req.body.password;
    console.log(email)
    console.log(pass)
    try {
        const user_email = await Register.findOne({ email: email });
        const token = await user_email.generateAuthToken();
        const getpass = user_email.password;
        res.cookie("jwt", token, {
            // expires:new Date(Date.now()+60000),
            httpOnly: true
        });
        // console.log(req.cookies.jwt);
        if (getpass === pass) {
            res.redirect("/main");
        }
        else {
            res.send('invalid pass')
        }
    } catch (error) {
        res.send(error);
    }
})
app.get("/logout/", auth, async (req, res) => {
    try {
        res.clearCookie("jwt");
        console.log("Logged Out");
        await req.user.save();
        res.redirect('/');
    } catch (error) {
        res.send(error);
    }
});
app.get("/employees/", auth, async (req, res) => {
    try {
        const emp = await Register.find();
        res.render('employee', { data: emp });
    } catch (error) {
        res.send(error);
    }
});
app.get("/empremove", auth, async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        let Designation = user.Designation;
        if (Designation == 'HR') {
            const empr = await Register.find({ Designation: "Employee" });
            res.render("remove", { data: empr });
        }
        else {
            res.send("Employ arenot allowed on this page :)");
        }
    }
    catch (error) {
        res.send(error);
    }
});
app.get('/remove/:id', auth, async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        let Designation = user.Designation;
        if (Designation == 'HR') {
            let id = req.params.id;
            const del = await Register.deleteOne({ _id: id });
            console.log(del)
            res.redirect('/empremove');
        }
        else {
            res.send("Employ arenot allowed on this page :)");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

app.get("/delleave/:id", auth, async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        let Designation = user.Designation;
        if (Designation == 'HR') {
            let id = req.params.id;
            const del = await leaveApplication.deleteOne({_id:id});
            console.log(del)
            res.redirect('/leave');
        }
        else {
            res.send("Employ arenot allowed on this page :)");
        }

    } catch (error) {
        res.send(error);
    }
});
// app.get("/viewdoc/:fileid", auth, async (req, res) => {
//     console.log(req.params.fileid);
//     res.render('doc',{file:req.params.fileid});
// });
app.get("/updateleave/:id", auth, async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        let Designation = user.Designation;
        if (Designation == 'HR') {
            let id = req.params.id;
            const del = await leaveApplication.updateOne({_id:id},{
                $set : {
                    Status : "Approved"
                }
            });
            console.log(del)
            res.redirect('/leave');
        }
        else {
            res.send("Employ arenot allowed on this page :)");
        }

    } catch (error) {
        res.send(error);
    }
});


app.get("/payroll/", auth, async (req, res) => {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
    const user = await Register.findOne({ _id: verifyUser._id });
    let Designation = user.Designation;
    if (Designation == 'HR') {
        const emp = await Register.find();
        res.render('payroll', { cal: false, data: emp });
    }
    else {
        const emp = await Register.find({ email: user.email });
        res.render('payroll', { cal: false, data: emp });
    }

});
app.post("/payroll/", auth, async (req, res) => {
    try {
        data = await Register.find();
        const salary = req.body.Salary;
        const emp = await Register.findOne({ email: salary })
        const sal = emp.Salary;
        // console.log(sal);
        const monthDays = req.body.monthDays;
        const daysWorked = req.body.workedDays;
        let calSalary = ((sal / monthDays) * daysWorked).toFixed(2);
        // res.send(`Calculated Salary for this month is : ${calSalary}`);
        res.render('payroll', { cal: true, Salary: calSalary, data: data });
    } catch (error) {
        res.send(error);
    }
});



app.get("/leave", auth, async (req, res) => {
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        if (user.Designation==="HR"){
            const leaves = await leaveApplication.find();
            res.render('leave', { data: leaves});
        }
        else{
            HR = false;
            id= user.id.toString();
            console.log(id)
            const leaves = await leaveApplication.find({empId:id});
            if (leaves==[]){
                res.render('leave');
            }
            else{
                res.render('leave', { data: leaves});
            }

        }
        
    } catch(error) {
        res.send(error);
    }
})
app.post("/leave",auth,async(req, res) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, "Lorem ipsum dolor, sit amet consectetur adipisicing elit.");
        const user = await Register.findOne({ _id: verifyUser._id });
        const id = user.id;
        const type = req.body.ltype;
        // const reason = req.body.reason;
        const name = user.firstName + user.lastName;
        const from = req.body.from;
        const to = req.body.to;
        const application = new leaveApplication({
            empId:id,
            empName:name,
            leaveType: type,
            from: from,
            to: to,
            Status:"Pending",
            Reason:req.body.reason,
        });
        console.log(application);
        const saveinfo = await application.save();
        console.log(saveinfo);
        res.redirect('/leave');
    } catch(error){
        console.log(`error is ${error}`);
        res.send("Error is idk");
    }
})
app.get("/settings", (req, res) => {
    res.render('settings');
})
app.get("/manage", (req, res) => {
    res.render('manage');
});


app.listen(port, () => {
    console.log(`Server Running at port ${port}`);
});