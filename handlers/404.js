const path = require('path')

module.exports = function(req, res){
    res.status(404).sendFile(path.join(__dirname, '../static/404/index.html'))
}