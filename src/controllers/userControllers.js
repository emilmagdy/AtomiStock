const bcrypt = require('bcrypt')


const userRegistration = (req, res) => {
    return res.json({ "message": "This is the registration route" })
}

const userLogin = (req, res) => {
    return res.json({ "message": "This is the login route" })
}

const userLogout = (req, res) => {
    return res.json({ "message": "This is the logout route" })
}

module.exports = { userRegistration, userLogin, userLogout }