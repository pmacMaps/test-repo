"use strict";

// viewport width
var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

/*** Map & Device Size Functions ***/
// Set the initial map zoom level based upon viewport width
function setInitialMapZoom(windowWidth) {
    var mapZoom;    
    if (windowWidth < 500) {
        mapZoom = 9; 
    } else if (windowWidth >= 500 && windowWidth < 1000) {
        mapZoom = 10; 
    } else {
        mapZoom = 11;  
    }
    return mapZoom;
}

// Set max width of pop-up window 
function setPopupMaxWidth(windowWidth) {
    var maxWidth;
    if (windowWidth < 450 ) {
        maxWidth = 240;
    } else {
        maxWidth = 300;
    }
    return maxWidth;
}

// function to populate zoning query results to display element
function populateResults(results, resultsElement, resultsPanel) {
    // element to hold results content;
   var resultsContent = '<div>';
   
   // expecting items in results    
   if (results.length < 1) {
      resultsContent += '<p>An error occured getting the zoning information</p>';   
   } else {
     for (var i = 0; i < results.length; i++) {
         resultsContent += '<ul>';
         resultsContent += '<li>Zoning District: ' + results[i][0] + '</li>';
         resultsContent += '<li>Zoning Code: ' + results[i][1] + '</li>';
         resultsContent += '<li>Zoning Category: ' + results[i][2] + '</li>';
         resultsContent += '</ul>';    
     }     
   }
   
   // close div element
   resultsContent += '</div>';
   
   // set content of resultsEl
   resultsElement.innerHTML = resultsContent;
   // show panel
   resultsPanel.style.opacity = 1;  
}

// function to get zoning service for spatial query
function selectZoningService(pin) {
   // base zoning url
   var baseUrl = '//gis.ccpa.net/arcgiswebadaptor/rest/services/Zoning/MapServer';
   // first two digits of parcel (municipal code)
   var muniCode = pin.split("-")[0];
   // zoning URL for municipality
   var zoningUrl;
   
   // set URL based upon muni code
   switch(muniCode) {
         // Camp Hill         
         case '01':
            zoningUrl = baseUrl + '/5';
            break;
         // Carlisle
         case '02':
            zoningUrl = baseUrl + '/6';
            break;
         case '03':
            zoningUrl = baseUrl + '/6';
            break;
          case '04':
            zoningUrl = baseUrl + '/6';
            break;
         case '05':
            zoningUrl = baseUrl + '/6';
            break;
         case '06':
            zoningUrl = baseUrl + '/6';
            break;
         case '49':
            zoningUrl = baseUrl + '/6';
            break;
         case '50':
            zoningUrl = baseUrl + '/6';
            break;
         case '51':
            zoningUrl = baseUrl + '/6';
            break;
         // Cooke
         case '07':
            zoningUrl = baseUrl + '/7';
            break;
         // Dickinson
         case '08':
            zoningUrl = baseUrl + '/8';
            break;
         // East Pennsboro
         case '09':
            zoningUrl = baseUrl + '/9';
            break;
          case '45':
            zoningUrl = baseUrl + '/9';
            break;
          // Hampden
          case '10':
            zoningUrl = baseUrl + '/10';
            break;
          // Hopewell
          case '11':
            zoningUrl = baseUrl + '/11';
            break;
          // Lemoyne
          case '12':
            zoningUrl = baseUrl + '/12';
            break;
          // Lower Allen
          case '13':
            zoningUrl = baseUrl + '/13';
            break;
          // Lower Frankford
          case '14':
            zoningUrl = baseUrl + '/14';
            break;
          // Lower Mifflin
          case '15':
            zoningUrl = baseUrl + '/15';
            break;
          // Mecchanicsburg
          case '16':
            zoningUrl = baseUrl + '/16';
            break;
         case '17':
            zoningUrl = baseUrl + '/16';
            break;
         case '18':
            zoningUrl = baseUrl + '/16';
            break;
         case '19':
            zoningUrl = baseUrl + '/16';
            break;
         case '20':
            zoningUrl = baseUrl + '/16';
            break;
         // Middlesex
         case '21':
            zoningUrl = baseUrl + '/17';
            break;
         // Monroe
         case '22':
            zoningUrl = baseUrl + '/18';
            break;
         // MT. Holly Springs
         case '23':
            zoningUrl = baseUrl + '/19';
            break;
         // Newburg
         case '24':
            zoningUrl = baseUrl + '/21';
            break;
         // New Cumberland
         case '25':
            zoningUrl = baseUrl + '/20';
            break;
         case '26':
            zoningUrl = baseUrl + '/20';
            break;
         // Newville
         case '27':
            zoningUrl = baseUrl + '/22';
            break;
         case '28':
            zoningUrl = baseUrl + '/22';
            break;
         // North Middleton
         case '29':
            zoningUrl = baseUrl + '/24';
            break;
         // North Newton
         case '30':
            zoningUrl = baseUrl + '/23';
            break;
         // Penn
         case '31':
            zoningUrl = baseUrl + '/25';
            break;
         // Shippensburg Boro
         case '32':
            zoningUrl = baseUrl + '/26';
            break;
         case '33':
            zoningUrl = baseUrl + '/26';
            break;
         case '34':
            zoningUrl = baseUrl + '/26';
            break;
         case '35':
            zoningUrl = baseUrl + '/26';
            break;
         // Shippensburg Township
         case '36':
            zoningUrl = baseUrl + '/27';
            break;
         // Shiremanstown
         case '37':
            zoningUrl = baseUrl + '/29';
            break;
         case '48':
            zoningUrl = baseUrl + '/29';
            break;
         // Silver Spring
         case '38':
            zoningUrl = baseUrl + '/28';
            break;
         // Southampton
         case '39':
            zoningUrl = baseUrl + '/30';
            break;
         // South Middleton
         case '40':
            zoningUrl = baseUrl + '/32';
            break;
         // South Newton
         case '41':
            zoningUrl = baseUrl + '/31';
            break;
         // Upper Allen
         case '42':
            zoningUrl = baseUrl + '/33';
            break;
         // Upper Frankford
         case '43':
            zoningUrl = baseUrl + '/34';
            break;
         // Upper Mifflin
         case '44':
            zoningUrl = baseUrl + '/35';
            break;
         // West Pennsboro
         case '46':
            zoningUrl = baseUrl + '/36';
            break;
         // Wormleysburg
         case '47':
            zoningUrl = baseUrl + '/37';
            break;
         // other municipalities
         default:
            zoningUrl = '';
            break;
   }    
   return zoningUrl;
}

// function to get zoning district for parcel
// use intersects method (query) to catch cases where multiple zones are within a parcel
function getParcelZoningDistrict(parcel,zoningURL,resultsElement, resultsPanel) {
    L.esri.query({url: zoningURL}).intersects(parcel).run(function(error,response) {
      if (error) {
         // add message to console
         console.warn('An error with zoning service request has occured');
         console.warn('Code: ' + error.code + '; Message: ' + error.message);
         // set content of results element
         resultsElement.innerHTML = 'An error getting the zoning district has occured.  Please try again or contact the website manager.';
         // show panel
         resultsPanel.style.opacity = 1;  
      } else if (response.features < 1) {
         // add message to console
         console.warn('No zoning district features returned or an error occured');
         // set content of results element
         resultsElement.innerHTML = 'No zoning district features returned or an error occured. Please try again or contact the website manager.';
         // show panel
         resultsPanel.style.opacity = 1; 
      } 
        else {
          // array to hold all zoning information
          var zoningInfo = [];
          
          // loop through all zoning districts intersecting parcels
          for (var i = 0; i < response.features.length; i++) {
             // fields from service
            var zoningDistrictName = response.features[i].properties.ZoneName;
            var zoningDistrictCode = response.features[i].properties.ZoneCode; 
            var zoningDistrictCategory = response.features[i].properties.ZoneType;
            
            // array to hold results for each zoning district  
            var resultsArray = [];
            resultsArray[0] = zoningDistrictName;
            resultsArray[1] = zoningDistrictCode;
            resultsArray[2] = zoningDistrictCategory;
            
            // add array for each zoning district to master array            
            zoningInfo.push(resultsArray);
          }         

         // call populate results function
         populateResults(zoningInfo, resultsElement, resultsPanel);  
      }       
    });
}

// function to select parcel based upon pin
function selectParcelByPin(pin, taxParcelLayer, resultsElement, resultsPanel) {
   // attribute query expression
   var queryString = "PIN = '" + pin + "'";
   // tax parcel service
   // if tps1 keeps producing errors, use tps2 or tps3
   var tps1 = '//gis.ccpa.net/arcgiswebadaptor/rest/services/Tax_Assessment/Parcels/MapServer/42';
   var tps2 = 'https://services1.arcgis.com/1Cfo0re3un0w6a30/ArcGIS/rest/services/TaxParcelsBackup/FeatureServer/0';
   var tps3 = '//gis.ccpa.net/arcgiswebadaptor/rest/services/Parcels/MapServer/42';
     
   // query request - where method
   L.esri.query({url: tps3}).where(queryString).run(function(error,response) {
      if (error) {
         // add message to console
         console.warn('An error with the parcels service request has occured');
         console.warn('Code: ' + error.code + '; Message: ' + error.message);
         // set content of results element
         resultsElement.innerHTML = 'An error getting the parcel has occured. Please try again or contact the website manager.';
         // show panel
         resultsPanel.style.opacity = 1;        
      } else if (response.features < 1) {        
         // add message to console
         console.log('No parcel features returned');
         // set content of results element
         resultsElement.innerHTML = 'No parcel features were found. Please check the parcel ID you entered and try again.  If problems persists, contact the website manager.';
         // show panel
         resultsPanel.style.opacity = 1; 
      } else {
        // add data to geojson object
        taxParcelLayer.addData(response);
        // style feature
        taxParcelLayer.setStyle(function() {
           return {
               fillOpacity: 0,
               color: '#000',
               opacity: 1,
               weight: 3 
           }                    
        });      
        // bind popup
        taxParcelLayer.bindPopup(function(layer) {
           var popupContent = '<div class="feat-popup">';
           popupContent += '<h3>Parcel: {PIN}</h3>';
           popupContent += '<ul>';
           popupContent += '<li>Address: {SITUS}</li>';
           popupContent += '<li>Municipality: {MUNI_NAME}</li>';
           popupContent += '<li>Owner: {OWNER }</li>';
           popupContent += '</ul>';
           popupContent += '</div>';
           
           return L.Util.template(popupContent, layer.feature.properties);
           
        }, {maxWidth: setPopupMaxWidth(windowWidth)});
        
        // set map around selected parcel
        map.fitBounds(taxParcelLayer.getBounds());
      
        // call zoning query function
        getParcelZoningDistrict(taxParcelLayer,selectZoningService(pin), resultsElement, resultsPanel);   
       } 
    });
  }

$(document).ready(function() {
    // Basemap changed
	$("#selectStandardBasemap").on("change", function(e) {
        setBasemap($(this).val());
    });
    
    $('#panelResults a.panel-close').click(function() {
       $('#panelResults').css('opacity', 0); 
    });
});