import express from 'express'
const router = express.Router()
import { userRegistration, userLogin, userLogout } from '../controllers/userControllers.js'

router.post("/register", userRegistration)
router.post("/login", userLogin)
router.post("/logout", userLogout)

export default router