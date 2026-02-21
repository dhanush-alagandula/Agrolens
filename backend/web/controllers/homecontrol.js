async function homeget(req, res) {
    console.log("Current user:", req.user);
    res.render("homepage", { user: req.user })
}

module.exports = {
    homeget,
}