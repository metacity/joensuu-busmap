Joensuu Bus Map
=============

Joensuu bus lines on Google Maps. The package includes a setup script to pull the line data to a database and serve it as JSON, and a JavaScript library to easily enhance a Google Map.

## Database and API installation
This repo includes a setup file `setup.php` that downloads bus line, route and stop information from http://bussit.joensuu.fi and dumps them to a database. Before running it (or any other PHP file here), you need to edit the values in the following lines in the `init.php` file to match your database setup:

```
define("DB_DSN", "mysql:dbname=some_database_name;host=localhost");
define("DB_USERNAME", "your_db_username");
define("DB_PASSWORD", "your_db_password");
```

You can also edit the table name constants below the previous lines if you like or need to. After editing, transfer all the PHP files to a location of your choosing (on a PHP capable server ofc) and navigate to `http://url.to.your/server/setup.php` with your browser. The setup script does not execute HTTP requests in parallel, so loading and dumping the data might take a while -- tens of seconds even. When the setup has completed successfully, the backend is ready: `lines.php` and `routeStops.php` will be your two API endpoints answering to HTTP GET requests with JSON. 

## API
The API consists of two endpoints: `lines.php` and `routeStops.php`. Both accept HTTP GET (actually any HTTP verb) and reply with JSON.

### lines.php

`lines.php` gives you a list of available bus lines and their routes, and it is of the most simple kind: a simple HTTP GET request will return a JSON array describing different lines and their possible routes. The response is an array of the following JSON objects (bus lines):

| Field       | Type      | Optional | Example value |
| ----------- | --------- | -------- | ------------- |
| `id`        | String    | no       | "3"           | 
| `line`      | String    | no       | "4"           |
| `name`      | String    | yes      | "4"           |
| `routes`    | array     | yes      | _See example_ |

> Note: Usually `line` and `name` are the same, but this isn't confirmed. Additionally, `routes` is propably never absent, but this isn't 100% sure either.

The `routes` field will be an array of the following JSON objects (routes): 

| Field       | Type      | Optional | Example value                 |
| ----------- | --------- | -------- | ----------------------------- |
| `id`        | String    | no       | "21"                          | 
| `name`      | String    | no       | "Neulamäki-KYS-Tori-Touvitie" |

**The `id` field of a route is crucial** as it will be used in a query parameter when asking `routeStops.php` for a route's way point coordinates. 

#### Example
An example response to an HTTP GET request to `http://server.com/lines.php` could be: 
```
[
   {
      "id":"3",
      "line":"7",
      "name":"7",
      "routes":[
         {
            "id":"46",
            "name":"Rypysuo-Tori-Rauhalahti"
         },
         {
            "id":"47",
            "name":"Rypysuo-Tori"
         },
         {
            "id":"48",
            "name":"Rauhalahti-Tori-Rypysuo"
         },
         {
            "id":"49",
            "name":"Tori-Rauhalahti"
         },
         {
            "id":"50",
            "name":"Tori-Rypysuo"
         },
         {
            "id":"51",
            "name":"Rauhalahti-Tori"
         }
      ]
   },
   {
      "id":"7",
      "line":"22",
      "name":"22",
      "routes":[
         {
            "id":"110",
            "name":"Pirtti-Tori"
         },
         {
            "id":"111",
            "name":"Tori-Pirttiniemi"
         },
         {
            "id":"112",
            "name":"Puijo-Tori"
         },
         {
            "id":"113",
            "name":"Tori-Puijo"
         }
      ]
   }
]
```

### routeStops.php

`routeStops.php` will return an ordered list (array) of way points for a given route ID (emphasized earlier). **The route ID is given as a query parameter `route_id`**. So the HTTP GET request will be made to  `routeStops.php?route_id=113`, for example. The returned JSON array will consist of the following JSON objects (route stops):

| Field            | Type              | Optional | Example value   |
| ---------------- | ----------------- | -------- | --------------- |
| `name`           | String            | no       | "Teatterikulma" | 
| `lat`            | Number (float)    | no       | 62.8925         |
| `lon`            | Number (float)    | no       | 27.6674         |
| `route_order`    | Number (int)      | no       | 2               |

#### Example

An example response to an HTTP GET request to `http://server.com/routeStops.php?route_id=113` could be:

```
[
   {
      "name":"Kuopio Kaupungintalo",
      "lat":62.893,
      "lon":27.6776,
      "route_order":1
   },
   {
      "name":"Puijonkatu 35",
      "lat":62.8952,
      "lon":27.6791,
      "route_order":2
   },
   {
      "name":"Kuopio Linja-autoasema",
      "lat":62.8978,
      "lon":27.6785,
      "route_order":3
   },
   {
      "name":"Puijon torni",
      "lat":62.9093,
      "lon":27.656,
      "route_order":4
   }
]
```


## JavaScript library

A small JS helper library is also provided. Is has no external dependencies, other than Google Maps JavaScript API V3. Its usage is super-easy:

* Import Google Maps JavaScript API V3 and the JS helper library by adding the following just before the closing `</body>` tag: 

    ```javascript
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
    <script src="path/to/joensuu-busmap.js"></script>
    ```
    Of course replace YOUR_API_KEY with your Google API key. See more [here](https://developers.google.com/maps/documentation/javascript/tutorial).
* Acquire a `google.maps.Map` instance by following the steps described [here](https://developers.google.com/maps/documentation/javascript/tutorial#google.maps.Map) (*after the DOM has loaded!*).
* Create a new `JoensuuBusMap` instance by passing your newly acquired `google.maps.Map` instance and an optional options object for the contructor:

    ```javascript
    var joensuuBusMap = new JoensuuBusMap(googleMap);
    ```
* Use the `drawRoutes(routes)` method to draw the actual routes on the map. The `routes` parameter is an array of object with `id` and `name` properties. For example:

    ```javascript
    joensuuBusMap.drawRoutes([
        {
            id: 35, 
            name: "Noljakka-Keskusta"
        },
        {
            id: 38, 
            name: "Askon testi"
        },
        {
            id: 40, 
            name: "Rantakylä-Keskusta-Noljakka"
        },
        {
            id: 45, 
            name: "Keskusta-Rantakylä"
        }
    ]);
    ```
    > **Hint:** As seen before, `lines.php` returns a `routes` array for each bus line, and these arrays can be conveniently passed directly for this method.

### Options
When using `new JoensuuBusMap(googleMap)` constructor, the library uses some sensible defaults. Second constructor argument  takes in an options object in which the following options can be provided (default value will be used if the field isn't defined in the options object):

| Field            | Type         | Default value                | Note                                                  |
| ---------------- | ------------ | ---------------------------- | ----------------------------------------------------- |
| `showMarkers`    | Boolean      | `true`                       | Behind the scenes, markers are still always generated; this only controls if they are drawn |
| `apiEndPoint`    | String       | "routeStops.php"             |                                                       |
| `markerIcon`     | String       | `undefined` (default marker) | Path to the icon, e.g. `img/marker.png`               |
| `routeColor`     | function     | random pastel color function | Will be called with route ID as the first argument; must return an RGB HEX color string, e.g. #A5FB12

So for example, one could instantiate the bus map with: 
```javascript
var joensuuBusMap = new JoensuuBusMap(googleMap, {
    showMarkers: false, 
    markerIcon: "img/marker.png", 
    apiEndPoint: "api/wayPoints.php",
    routeColor: function(routeId) {
        // Make your own color algorithm here!
        return "#12AB" + (routeId % 255).toString(16);
    }
});
```

### Methods
`JoensuuBusMap` objects have two additional methods to control the map after its instantiation: 

| Method             | Return  | Description                              |
| ------------------ | --------| ---------------------------------------- |
| `clear`            | Nothing | Clears all routes and markers on the map | 
| `markers(boolean)` | Nothing | Enables or disables route stop markers   |

```javascript
joensuuBusMap.clear();         // Clears map
joensuuBusMap.markers(true);   // Shows markers
joensuuBusMap.markers(false);  // Hides markers
```

## Demo
A demo site can be found in the folder `demo/` which is also demonstrated at [http://cs.uef.fi/~mikkoks/joensuu-busmap/demo/](http://cs.uef.fi/~mikkoks/joensuu-busmap/demo/). 