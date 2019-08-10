import Vue from 'vue';
const fs = require('fs')

new Vue({
    el: '#page',
    data: {
      pins=JSON.parse(fs.readFile('./mapData/pins/pins.json', 'utf-8'))
    }
  });