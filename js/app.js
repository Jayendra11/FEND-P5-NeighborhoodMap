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

  //Create markers for each location
  self.markerArray().forEach(function(placeItem) {

    marker = new google.maps.Marker({
      position: new google.maps.LatLng(placeItem.latitude, placeItem.longitude),
      map: map,
      title: placeItem.name,
      link: placeItem.website,
      animation: google.maps.Animation.DROP
    });

    placeItem.marker = marker;
  });
};

//Call the viewModel function
ko.applyBindings(new viewModel());
}