const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
	username: {
		type: String,
	},
	email: {
		type: String,
	},
	password: {
		type: String,
	},
	registered: {
		type: String,
	},
});

const user = mongoose.model("user", userSchema);

module.exports = {
	user,
};
