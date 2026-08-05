const express = require('express')
const router = express.Router()
const { userRegistration, userLogin, userLogout } = require('../controllers/userControllers')

router.post("/register", userRegistration)
router.post("/login", userLogin)
router.post("/logout", userLogout)

module.exports = router