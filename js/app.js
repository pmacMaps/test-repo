﻿"use strict";

// imports
import {showElement, hideElement, prepResultsDisplay} from './functions.js';
import {selectParcelByPin} from './getTaxParcel.js';
import {createMapLegendMS} from './mapLegend.js';
import {processLoadEvent, setPopupMaxWidth, clearLayers} from './mapFunctions.js';

// loading screen element
const backCover = document.getElementById('back-cover');
// element within results panel containing text for results of analysis
const resultsEl = document.getElementById('zoningResults');
// center coordinates for map
const homeCoords = [40.15, -77.25];
// viewport width
const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

// PA State Plane South (ft) projection
const spcPACrs = new L.Proj.CRS('EPSG:2272', '+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs',  {
    origin: [-1.192142E8, 1.461669E8],
    resolutions: [
      260.41666666666663,
      86.80555555555556,
      43.40277777777778,
      20.833333333333332,
      10.416666666666666,
      6.944444444444444,
      4.166666666666666,
      2.083333333333333,
      1.0416666666666665,
      0.5208333333333333
    ]
});

/*** Map Objects ***/
const map = L.map('map', {
    center: homeCoords,
    zoom: 0,
    zoomControl: false,
    crs: spcPACrs,
    minZoom: 0,
    maxZoom: 9
});

/*** Zoom Home Control ***/
const zoomHome = L.Control.zoomHome({
    position: 'topleft',
    zoomHomeTitle: 'Full map extent',
    homeCoordinates: homeCoords,
    homeZoom: 0
}).addTo(map);

// create panes to control layer ordering
// zoning feature layer pane
map.createPane('zoning');
// tax parcels standard
map.createPane('parcels');
// tax parcels from search
map.createPane('parcelsSearch');

// 2020 Imagery - cached map service
const imagery2020 = L.esri.tiledMapLayer({
    url: 'https://gis.ccpa.net/arcgiswebadaptor/rest/services/Imagery/Imagery2020/MapServer',
    maxZoom: 9,
    minZoom: 0,
    continuousWorld: true,
    attribution: 'Cumberland County',
    errorTileUrl: '//downloads2.esri.com/support/TechArticles/blank256.png',
    isLoaded: false
});

// Roads & Municipal Boundaries - cached map service
const roadsMunicipality = L.esri.tiledMapLayer({
    url: 'https://gis.ccpa.net/arcgiswebadaptor/rest/services/Property_Assessment/Roads_Municipal_Boundaries/MapServer',
    maxZoom: 9,
    minZoom: 0,
    continuousWorld: true,
    attribution: 'Cumberland County',
    errorTileUrl: '//downloads2.esri.com/support/TechArticles/blank256.png',
    isLoaded: false
});

// Container for selected parel
const taxParcel =  L.geoJson(null, {pane: 'parcelsSearch'}).addTo(map);

// tax parcels feature layer
const taxParcelsFS = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/1Cfo0re3un0w6a30/ArcGIS/rest/services/Tax_Parcels/FeatureServer/0',
    minZoom: 5,
    isLoaded: false,
    pane: 'parcels'
});

taxParcelsFS.bindPopup(function(layer) {
    let popupContent = '<div class="feat-popup">';
    popupContent += '<ul>';
    popupContent += '<li>Address: {SITUS}</li>';
    popupContent += '<li>Municipality: {MUNI_NAME}</li>';
    popupContent += '<li>PIN: {Link}</li>';
    popupContent += '<li>Owner: {OWNER}</li>';
    popupContent += '</ul>';
    popupContent += '</div>';

    return L.Util.template(popupContent, layer.feature.properties);

 }, {maxWidth: setPopupMaxWidth(windowWidth)});

// run zoning query when parcel is clicked on (popup open)
taxParcelsFS.on('popupopen', function(e) {
    // set-up results panel
    prepResultsDisplay(map);
    // Remove previous tax parcel GeoJSON feature
    clearLayers(taxParcel);
    // call parcel query function
    selectParcelByPin(map, e.layer.feature.properties.Link, resultsEl);
});

// array of map services to run loading function on
const mapServices = [imagery2020, roadsMunicipality, taxParcelsFS];

// call load/error events function on layers
mapServices.forEach(element => processLoadEvent(element));
// add layers to map
mapServices.forEach(element => element.addTo(map));

// Create Map Legend
createMapLegendMS('https://gis.ccpa.net/arcgiswebadaptor/rest/services/Property_Assessment/Roads_Municipal_Boundaries/MapServer', '#map-legend-content');

// call functions within Esri Leaflet Geocoder
const taxParcelsProvider = L.esri.Geocoding.featureLayerProvider({
    url: 'https://services1.arcgis.com/1Cfo0re3un0w6a30/ArcGIS/rest/services/Tax_Parcels/FeatureServer/0',
    maxResults: 8,
    attribution: 'Cumberland County',
    label: 'Tax Parcels',
    searchFields: ['Link', 'SITUS'],
        formatSuggestion: function(feature){
            return feature.properties.Link + ' (' + feature.properties.SITUS + ', ' + feature.properties.MUNI_NAME + ')';
        }
});

const SearchControl = L.esri.Geocoding.geosearch({
    useMapBounds: false,
    providers: [taxParcelsProvider],
    placeholder: 'Enter Property Address or PIN',
    title: 'Enter Street Address or Parcel ID (PIN)',
    expanded: true,
    collapseAfterResult: false,
    zoomToResult: false
}).addTo(map);

/*** Address search results event ***/
SearchControl.on('results', function(data) {
    // set-up results panel display
    prepResultsDisplay(map);

    // case: there are results from geosearch
    if (data.results.length > 0) {
       const resultText = data.results[0].text;
       const pin = resultText.split(" ")[0];

        // Remove previous tax parcel GeoJSON feature
        clearLayers(taxParcel);

        // call parcel query function
        // take PIN from geosearch result and pass that into parcel query
        selectParcelByPin(map, pin, resultsEl, 'search', taxParcel);
    } // no results from geosearch
    else {
        // add message to console
        console.log('No parcel features returned');
        // set content of results element
         resultsEl.innerHTML = 'No matching property was found. Please check the street address or PIN you entered and try again.  If problems persists, contact Cumberland County GIS at (717) 240-7842 or gis@ccpa.net.';
         // hide results waiting
         hideElement('resultsWaiting');
         // show results content
         showElement('zoningResults');
    }
});

/*** Remove loading screen after services loaded ***/
const loadScreenTimer = window.setInterval(function() {
    // loaded states of map services
    let imagery2020Loaded = imagery2020.options.isLoaded;
    let roadsMuniLoaded = roadsMunicipality.options.isLoaded;

    if (imagery2020Loaded && roadsMuniLoaded) {
        // remove loading screen
        window.setTimeout(function() {
            backCover.style.display = 'none';
        }, 500);

        // clear timer
        window.clearInterval(loadScreenTimer);
    } else {
      console.log('layers still loading');
    }
}, 1000);

// Remove loading screen when warning modal is closed
$('#layerErrorModal').on('hide.bs.modal', function(e) {
   // remove loading screen
   backCover.style.display = 'none';
   // clear timer
   window.clearInterval(loadScreenTimer);
});