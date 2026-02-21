const users = require("../models/userschema");
async function handleuserssign(req, res) {
    const { name, email, password } = req.body;
    const userr = await users.create({
        name, email, password
    })

    res.render("login/login", { error: null });
}

module.exports = {
    handleuserssign
}