function hidepw() {
    var pass = document.getElementById("psw")
    if (pass.type == "password") {
        pass.type = "text"
    } else {
        pass.type = "password"
    }
}