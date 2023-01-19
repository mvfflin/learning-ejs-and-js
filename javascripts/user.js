const mongoose = require('mongoose')

const schema = new mongoose.Schema

const userSchema = new schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
});

const user = mongoose.model("user", userSchema)

module.exports = {
    user
}