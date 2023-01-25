function validation() {
	var email = document.getElementById("email");
	var emailvalidator = document.getElementById("emailvalidator");
	var btn = document.getElementById("registerbtn");
	var pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

	if (email.value.match(pattern)) {
		emailvalidator.style.display = "none";
		btn.style.visibility = "visible";
	} else if (email.value.length == 0 || email.value == "") {
		emailvalidator.style.display = "none";
		btn.style.visibility = "visible";
	} else {
		emailvalidator.style.display = "block";
		btn.style.visibility = "hidden";
	}
}
