let password = document.getElementById("password");
let eyeopen = document.getElementById("eye-open1");
let eyeclose = document.getElementById("eye-close1");
let submit = document.getElementById("submit");
eyeopen.onclick = () => {
    if (password.type === "password") {
        password.type = "text";
        document.getElementById("eye-open1").style.display = "none";
        document.getElementById("eye-close1").style.display = "block";
        eyeopen = eyeclose;
    }
};
eyeclose.onclick = () => {
    if (password.type === "text") {
        password.type = "password";
        document.getElementById("eye-close1").style.display = "none";
        document.getElementById("eye-open1").style.display = "block";

        eyeclose = eyeopen
    }
};

