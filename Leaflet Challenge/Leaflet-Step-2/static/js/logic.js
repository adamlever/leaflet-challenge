// Set URL of geoJSON format data describing the past 30 days of earthquakes from the USGS
var quakesurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// Set URL of co-ordinate data in geoJSON format of the Earths tectonic plate boundaries
var faulturl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


// Create Earthquake Markers
// ===========================
// Perform an API call to the quakesurl to retrieve earthquake data
d3.json(quakesurl).then(function(data) {
    console.log(data.features);
    
// Define function that will give each marker a pixel radius based on the magnitude of earthquake multiplied by 2.5
function markerSize(magnitude) {
    if (magnitude === 0) {
        return 1;
    }
    return magnitude * 2.5;
}

// Define function for selecting marker color depending on magnitude of earthquake
function selectColor(magnitude) {
    switch (true) {
    case magnitude > 5:
        return "#Ee0000";
    case magnitude > 4:
        return "#ea822c";
    case magnitude > 3:
        return "#eecc00";
    case magnitude > 2:
        return "#d4ee00";
    case magnitude > 1:
        return "#98ee00";
    case magnitude < 1:
        return "#00ee18";
    default:
        return "#00ee18";
    }
}

// Define function to set marker style and use previously defined markerSize and selectColor functions
function setmarkerStyle (feature) {
    return {
        color: "#000000",
        fillColor: selectColor(feature.properties.mag),
        opacity: 0.6,
        fillOpacity: 1,
        radius: markerSize(feature.properties.mag),
        weight: 0.3
    };
}

// Define a function to convert UNIX time stamps
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

// Define a function to create a pop up with description of time, magnitude and location of each earthquake   
function onEachFeature(feature, layer) {
    layer.bindPopup(`Date and Time: ${timeConverter(feature.properties.time)} 
                    <hr>Magnitude: ${feature.properties.mag}
                    <br>Location: ${feature.properties.place}`)
}


// Define a function to set markers with latitude and longitude co-ordinates
function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng);
}
    
// Create a layer for the map with the previously defined markers, their style and popups
var earthquakes = L.geoJSON(data, {
    pointToLayer: pointToLayer,
    style: setmarkerStyle,
    onEachFeature: onEachFeature    
})


// Create Fault Lines
// ===========================
// Define function to set style of the fault lines
function setfaultStyle (feature) {
    return {
        color: "#f6a001",
        fillOpacity: 0,
        weight: 1
    };
} 

// Create a layer for the map for the fault lines with their previously defined style
var faultlines = L.geoJSON(null, {
    style: setfaultStyle
})
    
// Perform an API call to the faulturl to retrieve data, create the fault lines polygon and add to the map
d3.json(faulturl).then(function(data) {
    console.log(data.features);
    faultlines.addData(data).addTo(myMap)
})


// Create Map
// ===========================
// Define satellite, lightmap and outdoorsmap layers for map
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
    })

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
    })

var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
    })


// Define a baseMaps object to hold the base layers for the map
var baseMaps = {
    "Grayscale": lightmap,
    "Satellite": satellitemap,
    "Outdoors": outdoorsmap
};

// // Create overlay object to hold the earthquake markers and fault line data sets for the map
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultlines
};

// Create initial map object and set the starting longitude, latitude, zoom level and layers of the map
var myMap = L.map("map", {
    center: [
        20, -100
    ],
    zoom: 3,
    layers: [lightmap, earthquakes, faultlines]
});

// Create a layer control, pass in the baseMaps and overlayMaps then add to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);


// Create Legend
// ===========================
// Create marker legend and add to map
var legend = L.control({position: "bottomright"});
    
legend.onAdd = function() {  
    var div = L.DomUtil.create('div', 'legend');
    labels = ['<strong>Earthquake<br>Magnitude</strong>'],
    categories = ['0.0 - 1.0', '1.0 - 2.0', '2.0 - 3.0', '3.0 - 4.0', '4.0 - 5.0',  '> 5.0'],
    colors = ["#00ee18", "#98ee00", "#d4ee00", "#eecc00", "#ea822c", "#Ee0000"]

    for (var i = 0; i < categories.length; i++) {
        div.innerHTML += labels[0]  + '<hr>'
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML += '<i class="leg" style="background:' + colors[i] + '"></i>' + categories[i] + "<br>";
        }
    return div;
    };
};
legend.addTo(myMap);

})