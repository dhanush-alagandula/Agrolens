const mailusers = require("../models/mailschema")

async function handleusersmail(req, res) {
    const user = await mailusers.create({
        username: profile.displayName,
        googleId: profile.id,
        email: email
    })
}

module.exports = {
    handleusersmail
}