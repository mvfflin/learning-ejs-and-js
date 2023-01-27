const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const bcrypt = require("bcryptjs");
const { user } = require("./public/javascripts/user");
const mongoose = require("mongoose");
const Cookies = require("cookies");

let onehour = new Date().setHours() + 1;

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

// edit description
app.post("/account/:username/:password(*)/logout", async (req, res) => {
	let userparam = req.params.username;
	let passparam = req.params.password;
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let onesec = new Date().setTime() + 1;

	cookies.set("username", 0, { expires: onesec });
	cookies.set("password", 0, { expires: onesec });
	res.redirect("/success/loggedout");
});

app.post(
	"/account/editdescription/:username/:password(*)",
	async (req, res) => {
		let descinput = req.body.desc;
		let userparam = req.params.username;
		let passparam = req.params.password;
		let cookies = new Cookies(req, res);
		let usernamecookie = cookies.get("username");
		let passwordcookie = cookies.get("password");

		let findUser = await user.findOne({
			username: userparam,
			password: passparam,
		});

		if (findUser) {
			await findUser.updateOne({
				desc: descinput,
			});
			res.redirect("/success/descedited");
		}
	}
);

// get the cookie status
app.post("/deletecookies", async (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let onesec = new Date().setTime() + 1;

	cookies.set("username", 0, { expires: onesec });
	cookies.set("password", 0, { expires: onesec });
	res.redirect("/success/cookiereset");
});

app.post("/loading/login", async (req, res) => {
	const usernamemail = await req.body.usernamemail;
	const password = await req.body.psw;

	// validations
	const findUser = await user.findOne({
		username: usernamemail,
	});
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");

	// start
	if (!findUser) {
		// if the username isn't registered
		res.redirect("/error/usernotfound");
	} else if (findUser) {
		// if the username is registered
		if (bcrypt.compareSync(password, findUser.password) != true) {
			// if password is wrong
			res.redirect("/error/wrongpassword");
		} else if (bcrypt.compareSync(password, findUser.password) == true) {
			// if password is correct
			if (!usernamecookie && !passwordcookie) {
				cookies.set("username", findUser.username, { expires: onehour });
				cookies.set("password", findUser.password, { expires: onehour });
			} else if (usernamecookie && passwordcookie) {
				cookies.set("username", findUser.username, { expires: onehour });
				cookies.set("password", findUser.password, { expires: onehour });
			}
			res.redirect("/success/loggedin");
		}
	}
});

app.post("/loading/register", async (req, res) => {
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

	let cookies = new Cookies(req, res, { maxAge: 360000 });

	// hash password
	let salt = bcrypt.genSaltSync(5);
	let hashPass = bcrypt.hashSync(password, salt);

	// other variables
	var date = new Date().toDateString();

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
			desc: "",
		});
		console.log("new user has been created:");
		console.log("username : " + username);
		console.log("email : " + email);
		console.log("password : " + hashPass);
		console.log("created at: " + date);
		cookies.set("username", username, { expires: onehour });
		cookies.set("password", hashPass, { expires: onehour });
		res.redirect("/success/registered");
	}
});

app.get("/users", async (req, res) => {
	const listusers = await user.find({}, { _id: 0, username: 1 });
	const stringify = JSON.stringify(listusers);
	const accounts = JSON.parse(stringify);

	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}

	res.render("list", {
		layout: "layouts/mainlayout",
		title: "user list",
		accounts,
		accountlink,
	});
});

// pages
app.get("/account/:username/admin=:password(*)", async (req, res) => {
	const userparam = req.params.username;
	const passparam = req.params.password;
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");

	let findUser = await user.findOne({
		username: usernamecookie,
		password: passwordcookie,
	});

	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	if (!findUser) {
		res.redirect("usernotfound");
	}
	if (usernamecookie != userparam && passwordcookie !== passparam) {
		res.redirect("/error/noturaccount");
	} else if (usernamecookie == userparam && passwordcookie == passparam) {
		let username = usernamecookie;
		let password = passwordcookie;
		let userdesc = findUser.desc;
		if (userdesc.length == 0) {
			userdesc = "you haven't set ur description yet.";
		}
		res.render("adminaccount", {
			layout: "layouts/mainlayout",
			title: "ur account page",
			username,
			password,
			accountlink,
			userdesc,
		});
	}
});

app.get("/account/users/:username", async (req, res) => {
	const userparam = req.params.username;
	const useracc = await user.findOne({
		username: userparam,
	});
	const username = useracc.username;
	const registeredsince = useracc.registered;
	const description = useracc.desc;
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}

	res.render("account.ejs", {
		layout: "layouts/mainlayout",
		title: username + "page",
		username,
		registeredsince,
		description,
		accountlink,
	});
});

app.get("/", async (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");

	let findUser = await user.findOne({
		username: usernamecookie,
		password: passwordcookie,
	});
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}

	if (!findUser && usernamecookie && passwordcookie) {
		res.redirect("/error/cookieerror");
	} else if (findUser && usernamecookie && passwordcookie) {
		const registeredsince = findUser.registered;
		const username = usernamecookie;
		const password = passwordcookie;
		res.render("homevisited", {
			layout: "layouts/mainlayout",
			title: "welcome back!",
			username,
			password,
			registeredsince,
			accountlink,
		});
	} else {
		res.render("home", {
			layout: "layouts/mainlayout",
			title: "hi!",
			accountlink,
		});
	}
});

app.get("/registerloading", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("registloading", {
		layout: "layouts/mainlayout",
		title: "loading...",
		accountlink,
	});
});
app.get("/register", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("register", {
		layout: "layouts/mainlayout",
		title: "register page",
		accountlink,
	});
});

app.get("/login", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("login", {
		layout: "layouts/mainlayout",
		title: "login page",
		accountlink,
	});
});

app.get("/home", (req, res) => {
	res.redirect("/");
});

// errors
app.get("/error/cookieerror", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("error/cookieerror", {
		layout: "layouts/mainlayout",
		title: "error!",
		accountlink,
	});
});

app.get("/error/noturaccount", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("error/noturaccount", {
		layout: "layouts/mainlayout",
		title: "error!",
		accountlink,
	});
});

app.get("/error/wrongpassword", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("error/wrongpassword", {
		layout: "layouts/mainlayout",
		title: "error!",
		accountlink,
	});
});

app.get("/error/usernotfound", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("error/usernotfound", {
		layout: "layouts/mainlayout",
		title: "error!",
		subtitle:
			"if u got this error but u dont know what's wrong, try to reset all cookies in this website",
		accountlink,
	});
});

app.get("/error/usernametaken", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("error/usernametaken", {
		layout: "layouts/mainlayout",
		title: "error!",
		accountlink,
	});
});

app.get("/error/emailused", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("error/emailused", {
		layout: "layouts/mainlayout",
		title: "error!",
		accountlink,
	});
});

app.get("/error/emailnotavailable", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("error/emailnotavailable", {
		layout: "layouts/mainlayout",
		title: "error!",
		accountlink,
	});
});

app.get("/error/mustlogin", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("error/mustlogin", {
		layout: "layouts/mainlayout",
		title: "error!",
		accountlink,
	});
});

// end of errors

// successes
app.get("/success/loggedout", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}

	res.render("success/loggedout", {
		layout: "layouts/mainlayout",
		title: "successfully logged out!",
		usernamecookie,
		passwordcookie,
		accountlink,
	});
});

app.get("/success/descedited", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}

	res.render("success/descedited", {
		layout: "layouts/mainlayout",
		title: "successfully logged in!",
		usernamecookie,
		passwordcookie,
		accountlink,
	});
});

app.get("/success/cookiereset", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("success/cookiereset", {
		layout: "layouts/mainlayout",
		title: "successfully reset cookies!",
		accountlink,
	});
});
app.get("/success/registered", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.render("success/registered", {
		layout: "layouts/mainlayout",
		title: "successfully registered!",
		accountlink,
	});
});

app.get("/success/loggedin", (req, res) => {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}

	res.render("success/loggedin", {
		layout: "layouts/mainlayout",
		title: "successfully logged in!",
		usernamecookie,
		passwordcookie,
		accountlink,
	});
});

app.use(function (req, res) {
	let cookies = new Cookies(req, res);
	let usernamecookie = cookies.get("username");
	let passwordcookie = cookies.get("password");
	let accountlink;

	if (!usernamecookie && !passwordcookie) {
		accountlink = "/error/mustlogin";
	} else if (usernamecookie && passwordcookie) {
		accountlink = "/account/" + usernamecookie + "/admin=" + passwordcookie;
	}
	res.status(404).render("404", {
		layout: "layouts/mainlayout",
		title: "page not found.",
		accountlink,
	});
});
