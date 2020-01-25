var fs = require('fs')
fs.readFile('source/mapData/pins/pins.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  
  while(data.includes("50")){
    data = data.replace("50", (Math.floor(Math.random() * 80) + 5).toString())
    console.log(data.indexOf("50"))
  }

  fs.writeFile('source/mapData/pins/pins.json', data, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});