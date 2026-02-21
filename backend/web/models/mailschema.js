const mongoose = require("mongoose");
const mailschema = new mongoose.Schema({
    username: {
        type: String,
    },
    googleId: {
        type: String,
    },
    email: {
        type: String,
    }

})

const mailusers = mongoose.model("mailusers", mailschema);
module.exports = mailusers;