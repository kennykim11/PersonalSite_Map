
console.log("Running!")
const pins = require('./source/mapData/pins/pins.json')


const express = require("express")
const app = express()

//Checks from top to bottom and returns once one is found
app.use(express.static('dist'))

app.listen(process.env.PORT || 3000)