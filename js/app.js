/**Model Data**/
//Create array of locations
var locations = [
  {name: 'Tampa Bay History Center',
  address: '801 Old Water Street, Tampa, FL 33602',
  website: 'http://tampabayhistorycenter.org/',
  latitude: 27.9422083,
  longitude: -82.4497876,
  marker: '',
  },
  {name: 'Florida Aquarium',
  address: '701 Channelside Dr, Tampa, FL 33602',
  website: 'http://www.flaquarium.org',
  latitude: 27.9442871,
  longitude: -82.4451338,
  marker: ''
  },
  {name: 'Henry B. Plant Museum',
  address: '401 West Kennedy Boulevard, Tampa, FL 33602',
  website: 'http://www.ut.edu/plantmuseum',
  latitude: 27.946538,
  longitude: -82.464194,
  marker: ''
  },
  {name: 'Busch Gardens Tampa',
  address: ' 6600 North Ashley Drive, Tampa, FL 33602',
  website: 'https://seaworldparks.com/en/buschgardens-tampa',
  latitude: 28.0338742,
  longitude: -82.4209517,
  marker: ''
  },
  {name: 'Florida Museum of Photographic Arts',
  address: '400 N Ashley Drive, Cube 200, Tampa, FL 33602',
  website: 'http://fmopa.org/',
  latitude: 27.9472534,
  longitude: -82.4601495,
  marker: ''
  }
];
//Place constructor uses ko.observable so data is updated in real time when changed
var Place = function (data) {
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.website = ko.observable(data.website);
  this.latitude = ko.observable(data.latitude);
  this.longitude = ko.observable(data.longitude);
  this.marker = '';
};

/**View Model**/
//Create callback function for Google map async load
function initMap () {

var viewModel = function () {

  //Self alias provides lexical scope
  var self = this;

  //Center map on Tampa, FL
  var mapOptions = {
    zoom: 12,
    center: {lat: 27.960291, lng: -82.454174}
  };

  map = new google.maps.Map(document.getElementById("map"),
    mapOptions);

  //Resize map when window is resized
  google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
  });

  //Create observable array for markers
  self.markerArray = ko.observableArray(locations);
  //Set flag
  var openedInfoWindow = null;
  //Create markers for each location
  self.markerArray().forEach(function(placeItem) {
    contentString = ' ';
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(placeItem.latitude, placeItem.longitude),
      map: map,
      title: placeItem.name,
      link: placeItem.website,
      animation: google.maps.Animation.DROP
    });

    placeItem.marker = marker;

    //Add bounce animation to markers when clicked or selected from list
    placeItem.marker.addListener('click', toggleBounce);

    function toggleBounce() {
      if (placeItem.marker.getAnimation() !== null) {
        placeItem.marker.setAnimation(null);
      } else {
        placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){ placeItem.marker.setAnimation(null); }, 2100);
      }
    }

    //Create variables for use in infoWindow contentString
    var windowNames = placeItem.name;
    var windowWebsite = placeItem.website;
    var windowAddresses = placeItem.address;

    //Create new infowindow
    var infoWindow = new google.maps.InfoWindow({content: contentString});

    //Open infoWindow when marker is clicked
    google.maps.event.addListener(placeItem.marker, 'click', function() {

      //Use encodeURI method to replace symbols and spaces with UTF-8 encoding of character
      var formatName = encodeURI(placeItem.name);

      //Wikipedia API request URL
      var wikiUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + formatName + "&limit=1&redirects=return&format=json";

      //Make AJAX request to Wikipedia API
      $.ajax ({
        url: wikiUrl,
        dataType: "jsonp",
        success: function ( response ){
          var articleList = response[1];
          //If an article is found, populate infowindow with content string
          if (articleList.length > 0) {
            for (var i=0; i<articleList.length; i++) {
              articleStr = articleList[i];
              // Populate infoWindow with location's website
              var url = windowWebsite;
              contentString = '<div id="content">' + windowNames + '<p>' + windowAddresses + '</p>' + '<p>' + response[2] + '</p>' + '<a href=" ' + url + '">' + url + '</a>' + '</div>';
              infoWindow.setContent(contentString);
              }
              //No article found, provide link to location's website and tell user no Wikipedia articles found
              } else {
                var url = windowWebsite;
                contentString = '<div id="content">' + windowNames + '<p>' + windowAddresses + '</p>' +  '<p>' + 'No articles found on Wikipedia'+ '</p>' + '</div>';
                infoWindow.setContent(contentString);
              }
            }
          //Tell user Wikipedia API is not available
          }).error(function(e){
            contentString = '<div id="content">' + windowNames + '<p>' + windowAddresses + '</p>' + '<p>' + 'Failed to reach Wikipedia'+ '</p>' + '</div>';
            infoWindow.setContent(contentString);
          });
      //If infoWindow already open close it before opening for current location. After opening infoWindow set flag.
      if (openedInfoWindow != null) openedInfoWindow.close();
      infoWindow.open(map, this);
      openedInfoWindow = infoWindow;
      google.maps.event.addListener(infoWindow, 'closeclick', function() {
      openedInfoWindow = null;
      });
    });
  });

  //Connect marker to list selection
  self.markerConnect = function(marker) {
    google.maps.event.trigger(this.marker, 'click');
  };

  //Create observable for information typed into the search bar
  self.query= ko.observable('');

  //Create a ko.computed to filter the list and markers
  self.filteredPlaces = ko.computed(function(placeItem) {
    var filter = self.query().toLowerCase();
    //If searchbox empty return the full list and set all markers visible
    if (!filter) {
      self.markerArray().forEach(function(placeItem) {
          placeItem.marker.setVisible(true);
        });
      return self.markerArray();
    //Else use startsWith to compare search term to list
    } else {
        return ko.utils.arrayFilter(self.markerArray(), function(placeItem) {
          searchTerm = strStartsWith(placeItem.name.toLowerCase(), filter);
          //Show markers that match the search term. Return list items that match the search term.
          if (searchTerm) {
            placeItem.marker.setVisible(true);
            return searchTerm;
          }
          //Hide markers that don't match the search term.
          else {
            placeItem.marker.setVisible(false);
          }
        });
      }
  }, self);
  //Called to filter list by comparing search term to places on list
  var strStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length) {
      return false;
    }
    return string.substring(0, startsWith.length) === startsWith;
  };
};

//Call the viewModel function
ko.applyBindings(new viewModel());
}