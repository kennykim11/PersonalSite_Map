
console.log("Running!")
const pins = require('./source/mapData/pins/pins.json')


const express = require("express")
const app = express()

//Checks from top to bottom and returns once one is found
app.use(express.static('dist'))
app.get('*', function(req, res){
  res.status(404).sendFile(__dirname + '/source/pages/404.html')
});

app.listen(process.env.PORT || 3000)