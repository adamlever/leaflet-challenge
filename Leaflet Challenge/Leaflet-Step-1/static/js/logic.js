// Create initial map object and set the longitude, latitude, and the starting zoom level of the map
var myMap = L.map("map").setView([20, -60], 3);

// Add tile layer to the map
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
})
.addTo(myMap);

// Set URL of past 7 days of earthquakes from USGS in geoJSON format
var quakesurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform an API call to the URL to retrieve data then create markers and legend
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
            return "#eecc00";
        case magnitude > 1:
            return "#d4ee00";
        default:
            return "#98ee00";
        }
    }

    // Define function to set marker style using previously defined markerSize and selectColor functions
    function setStyle (feature) {
        return {
            color: "#000000",
            fillColor: selectColor(feature.properties.mag),
            opacity: 0.6,
            fillOpacity: 1,
            radius: markerSize(feature.properties.mag),
            weight: 0.3
        };
    }

    // Create a GeoJSON layer and create markers with popups using previously defined setStyle function, then add to myMap
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: setStyle,
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        },  
    }).addTo(myMap); 


    // Create marker legend and add to map
    var legend = L.control({position: "bottomright"});
       
    legend.onAdd = function() {  
        var div = L.DomUtil.create('div', 'legend');
        labels = ['<strong>Earthquake<br>Magnitude</strong>'],
        categories = ['< 1.0', '1.0 - 2.0', '2.0 - 3.0', '3.0 - 4.0', '4.0 - 5.0',  '> 5.0'],
        colors = ["#98ee00", "#d4ee00", "#eecc00", "#eecc00", "#ea822c", "#Ee0000"]

        for (var i = 0; i < categories.length; i++) {
            div.innerHTML += labels[0]  + '<hr>'
            for (var i = 0; i < categories.length; i++) {
                div.innerHTML += '<i class="leg" style="background:' + colors[i] + '"></i>' + categories[i] + "<br>";
            }
        return div;
        };
    };
    legend.addTo(myMap);
});
