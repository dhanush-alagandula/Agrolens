
let password2 = document.getElementById("password2");
let eyeopen2 = document.getElementById("eye-open2");
let eyeclose2 = document.getElementById("eye-close2");
let submit2 = document.getElementById("submit");
eyeopen2.onclick = () => {
    if (password2.type === "password") {
        password2.type = "text";
        document.getElementById("eye-open2").style.display = "none";
        document.getElementById("eye-close2").style.display = "block";
        eyeopen2 = eyeclose2;

    }
};
eyeclose2.onclick = () => {
    if (password2.type === "text") {
        password2.type = "password";
        document.getElementById("eye-close2").style.display = "none";
        document.getElementById("eye-open2").style.display = "block";
        eyeclose2 = eyeopen2;
    }
};

submit.addEventListener("click", () => {
    if (password.value != password2.value) {

        document.getElementById("message2").innerText = "Password not matched";
        document.getElementById("message2").style.color = "red";
        submit2.type = "button";
    } else {
        document.getElementById("message2").innerText = " ";
        submit2.type = "submit";
    }
});