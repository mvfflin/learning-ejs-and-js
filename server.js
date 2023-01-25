const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("./env");
const app = express();
const bcrypt = require("bcryptjs");
const { user } = require("./public/javascripts/user");
const mongoose = require("mongoose");
const Cookies = require("cookies");

// database connect

mongoose.connect(
	env.uri,
	{
		dbName: "maindb",
	},
	() => console.log("connected db")
);
// end of database connect

port = 9046;

app.listen(port, () => {
	console.log("serverny nyala, port - " + port);
});

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(expressLayouts);
app.set("view engine", "ejs");

// posts

app.post("/admin/loading/login", async (req, res) => {
	const usernamemail = await req.body.usernamemail;
	const password = await req.body.psw;

	// validations
	const findUser = await user.findOne({
		username: usernamemail,
	});
	const checkPass = bcrypt.compareSync(password, findUser.password);

	// start
	if (!findUser) {
		// if the username isn't registered
		res.redirect("/error/usernotfound");
	} else if (findUser) {
		// if the username is registered
		if (checkPass != true) {
			// if password is wrong
			res.redirect("/error/wrongpassword");
		} else if (checkPass == true) {
			// if password is correct
			res.redirect("/success/loggedin");
		}
	}
});

app.post("/admin/loading/register", async (req, res) => {
	const username = await req.body.username;
	const email = await req.body.email;
	const password = await req.body.psw;

	// validations
	const findUser = await user.findOne({
		username: username,
	});
	const findEmail = await user.findOne({
		email: email,
	});

	// hash password
	let salt = bcrypt.genSaltSync(10);
	let hashPass = bcrypt.hashSync(password, salt);

	// other variables
	var date = new Date().toString();

	if (findUser) {
		res.redirect("/error/usernametaken");
	} else if (findEmail) {
		res.redirect("/error/emailused");
	} else {
		await user.create({
			username: username,
			email: email,
			password: hashPass,
			registered: date,
		});
		console.log("new user has been created:");
		console.log("username : " + username);
		console.log("email : " + email);
		console.log("password : " + hashPass);
		console.log("created at: " + date);
		res.redirect("/success/registered");
	}
});

app.get("/users", async (req, res) => {
	const listusers = await user.find({}, { _id: 0, username: 1 });
	const stringify = JSON.stringify(listusers);
	const accounts = JSON.parse(stringify);

	res.render("list", {
		layout: "layouts/mainlayout",
		title: "user list",
		accounts,
	});
});

// pages
app.get("/", (req, res) => {
	res.render("home", {
		layout: "layouts/mainlayout",
		title: "hi!",
	});
});

app.get("/registerloading", (req, res) => {
	res.render("registloading", {
		layout: "layouts/mainlayout",
		title: "loading...",
	});
});
app.get("/register", (req, res) => {
	res.render("register", {
		layout: "layouts/mainlayout",
		title: "register page",
	});
});

app.get("/login", (req, res) => {
	res.render("login", {
		layout: "layouts/mainlayout",
		title: "login page",
	});
});

app.get("/home", (req, res) => {
	res.redirect("/");
});

// errors
app.get("/error/wrongpassword", (req, res) => {
	res.render("error/wrongpassword", {
		layout: "layouts/mainlayout",
		title: "error!",
	});
});

app.get("/error/usernotfound", (req, res) => {
	res.render("error/usernotfound", {
		layout: "layouts/mainlayout",
		title: "error!",
	});
});

app.get("/error/usernametaken", (req, res) => {
	res.render("error/usernametaken", {
		layout: "layouts/mainlayout",
		title: "error!",
	});
});

app.get("/error/emailused", (req, res) => {
	res.render("error/emailused", {
		layout: "layouts/mainlayout",
		title: "error!",
	});
});

app.get("/error/emailnotavailable", (req, res) => {
	res.render("error/emailnotavailable", {
		layout: "layouts/mainlayout",
		title: "error!",
	});
});

// end of errors

// successes
app.get("/success/registered", (req, res) => {
	res.render("success/registered", {
		layout: "layouts/mainlayout",
		title: "successfully registered!",
	});
});

app.use(function (req, res) {
	res.status(404).render("404", {
		layout: "layouts/mainlayout",
		title: "page not found.",
	});
});
