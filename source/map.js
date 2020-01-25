
// === IMPORTS ===
import anime from 'animejs'
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
var mouseoverZone = null
var currentlyZooming = false
var listViewExpanded = false
var pinsToShow = pins
var searchWords = ''
var zoneTitleWrapper = null
var pinCanvas = null
var fullscreenWrapper = null


// === FUNCTIONS ===

// =MAP=

/*
Make the intro screen disappear
*/
function makeWhiteoutDisappear(){
    anime({
        targets: '#topText',
        opacity: 0,
        delay: 1500,
        duration: 1000,
        easing: 'easeInOutQuad'
    });
    anime({
        targets: '#bottomText',
        opacity: 0,
        delay: 2000,
        duration: 2000,
        easing: 'easeInOutQuad'
    });
    anime({
        targets: '.whiteout',
        opacity: 0,
        delay: 2500,
        duration: 3000,
        easing: 'linear',
        complete: function(anim){
            console.log(anim)
            anim.animatables[0].target.remove()
        }
    });
}

/*
The viewbox is an attribute in the SVG element that specifies where to zoom to.
This function returns the specific values to zoom to depending on the quadrant in the form x0 y0 x1 y1.
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

/* Messy I know, but this returns an array in [x, y] of the percent of the screen to put the zone title element */
function getZonePercent(index){
    const verticalHemisphere = index % 2
    const horizontalHemisphere = Math.floor(index/2)
    return [String(25 + (verticalHemisphere * 50))+'%', String(25 + (horizontalHemisphere * 50))+'%']
}

/*
Handle the zoom
*/
function zoomTransition(newVals, complete){
    currentlyZooming = true
    anime({
        targets: mapSvg.getElementsByTagName('svg')[0],
        viewBox: newVals.join(' '),
        easing: 'easeInOutQuad',
        complete: function(){
            if (complete) {
                currentlyZooming = false
                complete()
            }
        }
    })
}

/*
Given the map svg and zone, this function zooms to that zone and sets up the neccesary items including the:
    - Zoom out button
    - Pins
    - List window
*/
function zoomToQuadrant(zone){
    if (zone == currentZone) return
    currentZone = zone
    zoneTitleWrapper.style.display = 'none'
    pinCanvas.innerHTML = ''
    zoomTransition(zone.viewBox, function(){
        if (currentZone == zone) filterPins()
        document.getElementById('zoomOutButton').style.display = ''
    })
}

/*
Zooms out of the map
*/
function zoomOutToMap(){
    currentZone = null
    document.getElementById('zoomOutButton').style.display = 'none'
    pinCanvas.innerHTML = ''
    zoomTransition([0, 0, svgSize[0], svgSize[1]], function(){
        if (currentZone == null) {
            zoneTitleWrapper.style.display = ''
            filterPins()
        }
    })
}

/*
Clear the screen and put in new pins
*/
function populatePins(){
    pinCanvas.innerHTML = ''
    pinsToShow.forEach(pinObject => {
        // =Pin Icon-
        var pinIcon = document.createElement('div')
        pinIcon.className = 'pinNat' //CSS edits any div with this class name to be a pin shap
        pinIcon.id = 'pinIcon_' + pinObject.id

        var xCoord = pinObject.xCoord
        var yCoord = pinObject.yCoord
        if (currentZone == null){
            xCoord = (pinObject.xCoord / 2) + (50 * (zones[pinObject.zone].quadrant % 2))
            yCoord = (pinObject.yCoord / 2) + (50 * Math.floor(zones[pinObject.zone].quadrant / 2))
        }

        // =Pin Text=
        const pinTitle = document.createElement('p')
        pinTitle.className = 'pinTitle'
        pinTitle.textContent = pinObject.title

        const pinDesc = document.createElement('p')
        pinDesc.className = 'pinDesc'
        pinDesc.textContent = pinObject.shortDescrip

        const pinText = document.createElement('div')
        pinText.className = 'pinText'
        pinText.id = 'pinText_' + pinObject.id
        pinText.appendChild(pinTitle)
        pinText.appendChild(pinDesc)

        // =Pin Block=
        const pinBlock = document.createElement('div')
        pinBlock.appendChild(pinIcon)
        pinBlock.appendChild(pinText)
        pinBlock.className = 'pinBlock'
        pinBlock.style.top = yCoord + '%'
        pinBlock.style.left = xCoord + '%'
        pinBlock.addEventListener('click', detailWindow.bind(null, pinObject))
        pinCanvas.appendChild(pinBlock)
    })
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
        populatePins()
    }
}

/*
Gets called whenever clear search text is clicked
*/
window.clearSearch = function(){
    document.getElementById('searchField').value = ''
    searchWords = ''
    hideListView()
    filterPins()
}

/*
Filter things to show in search bar based on search terms and current zone
*/
window.filterPins = function(){
    pinsToShow = pins
    if (!currentZone && !searchWords) pinsToShow = []
    if (currentZone) {
        pinsToShow = pinsToShow.filter(pin => pin.zone == currentZone.name)
    }
    else{
        zoneTitleWrapper.style.display = searchWords == '' ? '' : 'none'
    }
    if (searchWords){
        searchWords.split(' ').forEach(function(word){
            word = word.toLowerCase()
            pinsToShow = pinsToShow.filter(pin => pin.title.toLowerCase().includes(word) || pin.shortDescrip.toLowerCase().includes(word) || pin.description.toLowerCase().includes(word))
        })
    }
    makeSidebar()
    populatePins()
    console.log('CURRENT ZONE', currentZone, 'SEARCH WORDS', searchWords, 'PINS TO SHOW', pinsToShow)
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
Create the sidebar component
*/
function makeSidebar(){
    var sideBar = document.getElementById('sideBar')
    sideBar.innerHTML = ''
    pinsToShow.forEach(pin => {
        var listItem = document.createElement('div')
        listItem.className = 'listItem'
        listItem.id = 'listItem_' + pin.id
        listItem.onclick = detailWindow.bind(null, pin)
        listItem.innerHTML = `
            <img src=${pin.image}></img>
            <p class=title>${pin.title}</p>
            <p class=shortDescrip>${pin.shortDescrip}</p>`
        sideBar.appendChild(listItem)
    })
}

// =DETAIL=
/*
Loads the pin page in an iframe
*/
function detailWindow(pinObject){
    console.log("1234")
    fullscreenWrapper.style.display = ''
    document.getElementById('fullscreenIframe').src = pinObject.link
    const a = history.pushState({}, 'Kenneth Kim: ' + pinObject.title, pinObject.id)
    console.log("asdf", a)
}

window.closeDetailWindow = function(){
    fullscreenWrapper.style.display = 'none'
    history.back()
}

// =WINDOW=
/*
Gets called when the window finishes loading. Sets up the zone viewBox and click action
*/
window.loaded = function(){
    mapSvg = document.getElementById('mapObject').contentDocument
    const zoomOutButton = document.getElementById('zoomOutButton')
    zoomOutButton.addEventListener('mousedown', zoomOutToMap)
    zoomOutButton.style.display = 'none'
    
    //Finding and setting constant element references
    zoneTitleWrapper = document.getElementById('zoneTitleWrapper')
    pinCanvas = document.getElementById('pinCanvas')
    fullscreenWrapper = document.getElementById('fullscreenWrapper')

    for (const zoneName in zones){
        //Setting zone zoom/click coordinates
        const zone = zones[zoneName]
        zone.viewBox = getZoneViewBox(zone.quadrant)
        mapSvg.getElementById(zoneName).addEventListener('mousedown', function(){
            zoomToQuadrant(zone)
        })
        mapSvg.getElementById(zoneName).addEventListener('mouseover', function(){
            mouseoverZone = zone
        })

        //Making zones name elements
        zone.name = zoneName
        zone.nameElement = document.createElement('div')
        zone.nameElement.textContent = zone.displayName
        var percents = getZonePercent(zone.quadrant)
        zone.nameElement.style.left = percents[0]
        zone.nameElement.style.top = percents[1]
        zoneTitleWrapper.appendChild(zone.nameElement)

        console.log(zone)
    }

    makeSidebar()
    makeWhiteoutDisappear()
    
    mapSvg.onmousewheel = function(e){
        //console.log("ZOOM DETECTED", event.deltaY, currentZone, mouseoverZone)
        if (currentZone == null && !currentlyZooming && event.deltaY < 0){ //Scrolling up
            zoomToQuadrant(mouseoverZone)
        }
        if (currentZone != null && !currentlyZooming && event.deltaY > 0){
            zoomOutToMap()
    }}

    if(pageId = storage.getItem('detailedPage')){
        detailWindow(pins.find(pin => pin.id == pageId))
    }
    storage.setItem('detailedPage', '')
}