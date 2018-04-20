declare var L: any
declare var Circles: any;

let map;
let highways: OsmWayElement[];
let highwayLayer;
let highwayNodes = {};
let milestones: OsmNodeElement[];
let milestoneLayer;

window.onload = () => {
    initMap();
    getData();
};

function initMap() {
    map = L.map("map", { zoomControl: false }).setView([46.822, 8.224], 8);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 19,
    }).addTo(map);

    highwayLayer = L.featureGroup();
    highwayLayer.addTo(map);
    milestoneLayer = L.featureGroup();
    milestoneLayer.addTo(map);
}

function getData() {
    //let url = "testdata2.json";
    let url = "http://overpass-api.de/api/interpreter?data=[out:json];(node(area:3600051701)[highway=milestone];way(area:3600051701)[highway=motorway]);out%20geom;";
    fetch(url).then(response => response.json()).then(onRequestHighwaysSuccess);
}

function onRequestHighwaysSuccess(x) {
    let overpassController = new OverpassController(x);

    highways = overpassController.Ways;

    detectHighwayNodes();

    milestones = overpassController.Nodes.filter(n => n.id in highwayNodes);

    processData();
}

function detectHighwayNodes() {
    for (let i = 0; i < highways.length; i++) {
        let highway = highways[i];
        for (let j = 0; j < highway.nodes.length; j++) {
            highwayNodes[highway.nodes[j].toString()] = true;
        }
    }
}

function processData() {
    highwayLayer.clearLayers();

    let totalLength = 0;

    for (let i = 0; i < highways.length; i++) {
        let highway = highways[i];

        let highwayLine = L.polyline(highway.geometry.map(latLon2LatLng), {
            color: "#d50202"
        });
        highwayLine.addTo(highwayLayer);

        let length = polylineLength(highway.geometry);
        totalLength += length;
    }
    console.log("Total length: " + Math.floor(totalLength) + " km");

    document.getElementById("total").innerHTML = "<span class='total-val'>" + Math.floor(totalLength) + "</span><span class='total-unit'>km</span><br><span class='total-label'>Gesamtlänge</span>";

    showProgress(milestones.length, Math.floor(totalLength));

    addMilestonesToMap();
}

function addMilestonesToMap() {
    milestoneLayer.clearLayers();
    for (let i = 0; i < milestones.length; i++) {
        let milestoneMarker = L.circleMarker(latLon2LatLng(milestones[i]), {
            radius: 3,
            weight: 2,
            fillOpacity: 1.0,
            color: "#d50202",
            fillColor: "white"
        });
        milestoneMarker.bindPopup(milestones[i].tags["distance"]);
        milestoneMarker.addTo(milestoneLayer);
    }
}

function showProgress(val, max) {
    var myCircle = Circles.create({
        id: 'progress',
        radius: 120,
        value: val,
        maxValue: max,
        width: 10,
        text: x => `<span class='val'>${x}</span><span class='label'>Kilometersteine</label>`,
        colors: ['#dedede', '#d50202'],
        duration: 400,
        wrpClass: 'circles-wrp',
        textClass: 'circles-text',
        valueStrokeClass: 'circles-valueStroke',
        maxValueStrokeClass: 'circles-maxValueStroke',
        styleWrapper: true,
        styleText: true
    });
}

function polylineLength(coordinates: Coordinate[]): number {
    let sum = 0;
    if (coordinates.length < 2) return 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        sum += haversineDistance(latLon2Array(coordinates[i]), latLon2Array(coordinates[i + 1]));
    }
    return sum;
}

function latLon2LatLng(latLon) {
    return { "lat": latLon.lat, "lng": latLon.lon };
}

function latLon2Array(latLon) {
    return [latLon.lat, latLon.lon];
}

function haversineDistance(coords1, coords2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    var lon1 = coords1[0];
    var lat1 = coords1[1];

    var lon2 = coords2[0];
    var lat2 = coords2[1];

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
}