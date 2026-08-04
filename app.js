require('dotenv').config()

const express = require('express')
const app = express()

const PORT = proces.env.PORT || 3000

app.use(express.json())



app.listen(PORT , () =>{
    console.log (`Server running on http://localhost:${PORT}`)
})