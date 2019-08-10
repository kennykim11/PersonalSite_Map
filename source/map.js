
// === IMPORTS ===
import Vue from 'vue'
import anime from 'animejs'
import searchList from './components/searchList.vue'
import pins from './mapData/pins/pins.json'

// === SETTINGS ===
const svgSize = [1920, 1080]

// === FIELDS ===
const zones = {
    'Suburban': {
        quadrant: 0,
        displayName: 'Projects'},
    'Urban': {
        quadrant: 1,
        displayName: 'My Blog'},
    'Rural': {
        quadrant: 2,
        displayName: 'Art Adventures'},
    'Industrial': {
        quadrant: 3,
        displayName: 'About me'}
}
const halfDimensions = [svgSize[0]/2, svgSize[1]/2]
var mapSvg
var currentZone = null
var listViewExpanded = false
var pinsToShow = pins
var searchWords = ''

console.log('Starting')


// === FUNCTIONS ===

// =MAP=
/*
The viewbox is an attribute in the SVG element that specifies where to zoom to.
This function returns the specific values to zoom to depending on the quadrant.
A sample output: 960 540 1920 1080
*/
function getZoneViewBox(index){
    var concl = []
    const verticalHemisphere = index % 2
    const horizontalHemisphere = Math.floor(index/2)
    concl.push(verticalHemisphere * halfDimensions[0])
    concl.push(horizontalHemisphere * halfDimensions[1])
    concl.push(halfDimensions[0])
    concl.push(halfDimensions[1])
    return concl
}

/*
Handle the zoom
*/
function zoomTransition(newVals){
    anime({
        targets: mapSvg.getElementsByTagName('svg')[0],
        viewBox: newVals.join(' '),
        easing: 'easeInOutQuad'
    })
}

/*
Given the map svg and zone, this function zooms to that zone and sets up the neccesary items including the:
    - Zoom out button
    - Pins
    - List window
*/
function zoomToQuadrant(zone){
    currentZone = zone
    filterPins()
    document.getElementById('zoomOutButton').style.visibility = 'visible'
    zoomTransition(zone.viewBox)
}

/*
Zooms out of the map
*/
function zoomOutToMap(){
    currentZone = null
    filterPins()
    document.getElementById('zoomOutButton').style.visibility = 'hidden'
    zoomTransition([0, 0, svgSize[0], svgSize[1]])
}

// =SEARCH BAR=
/*
Gets called whenever any key is entered in the search bar
*/
window.search = function(element){
    if(event.key == 'Enter') {
        searchWords = element.value
        filterPins()
        searchWords == '' ? hideListView() : showListView()
    }
}

/*
Gets called whenever clear search text is clicked
*/
window.clearSearch = function(){
    document.getElementById('searchField').value = ''
    hideListView()
}

/*
Filter things to show in search bar based on search terms and current zone
*/
window.filterPins = function(){
    pinsToShow = pins
    if (currentZone) pinsToShow.filter(pin => pin.zone == currentZone.name)
    if (searchWords){
        searchWords.split(' ').forEach(function(word){
            pinsToShow.filter(pin => pin.title.includes(word) || pin.shortDescrip.includes(word) || pin.description.includes(word))
        })
    }
    console.log('CURRENT ZONE', currentZone.name, 'SEARCH WORDS', searchWords, 'PINS TO SHOW', pinsToShow)
}

/*
Decide to show or hide view
*/
window.showOrHideListView = function(){
    filterPins()
    listViewExpanded ? hideListView() : showListView()
}

/*
Show the list view
*/
function showListView(){
    document.getElementById('sideArea').className = 'show'
    document.getElementById('sideMinButtonText').innerHTML = ' &#8592'
    listViewExpanded = true
}

/*
Hide the list view
*/
function hideListView(){
    document.getElementById('sideArea').className = 'hide'
    document.getElementById('sideMinButtonText').innerHTML = ' &#8594'
    listViewExpanded = false
}

/*
Create the Vue sidebar component
*/
function makeSidebar(){
    new (Vue.extend(searchList))({
        propsData: {
            pins: pinsToShow
        },
        el: '#searchList'
    });
}

// =WINDOW=
/*
Gets called when the window finishes loading. Sets up the zone viewBox and click action
*/
window.loaded = function(){
    mapSvg = document.getElementById('mapObject').contentDocument
    document.getElementById('zoomOutButton').addEventListener('mousedown', zoomOutToMap)
    for (const zoneName in zones){
        const zone = zones[zoneName]
        zone.viewBox = getZoneViewBox(zone.quadrant)
        zone.name = zoneName
        mapSvg.getElementById(zoneName).addEventListener('mousedown', function(){
            zoomToQuadrant(zone)
        })
        console.log(zone)
    }
    makeSidebar()
}

