async function login() {

    const bcrypt = require('bcrypt');
    const { user } = require('./user');

    var usernameid = document.getElementById('usernamemail')
    var passwordid = document.getElementById('psw')

    const findUser = await user.findOne({
        username: usernameid
    })

    const findEmail = await user.findOne({
        email: usernameid
    })

    if (usernameid.includes('@')==true) {
        const validPass = bcrypt.compareSync(passwordid, findEmail.password)
        if (!findEmail) {
            usernameid.value = ""
            usernameid.placeholder = "this email can't be found"
            alert("cant found email")
        }
        if (!validPass) {
            passwordid.value = ""
            passwordid.placeholder = "wrong pass."
            alert("wrong pass")
        }
        return alert("success login")
    } else if (usernameid.includes('@')==false) {
        const validPassUser = bcrypt.compareSync(passwordid, findUser.password)
        if (!findUser) {
            usernameid.value = ""
            usernameid.placeholder = "this user can't be found"
            alert("cant found user")
            window.location.href = '/success'
        }
        if (!validPassUser) {
            passwordid.value = ""
            passwordid.placeholder = "wrong pass."
            alert("wrong pass")
        }
        return alert("success login")
    }
}