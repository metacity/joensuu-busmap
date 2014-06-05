Kuopio Bus Map
=============

Kuopio bus lines on Google Maps. The package includes a setup script to pull the line data to a database and serve it as JSON, and a jQuery plugin to easily display the map.

## Database and API installation
This repo includes a setup file `setup.php` that downloads bus line, route and stop information from https://bussit.kuopio.fi and dumps them to a database. Before running it (or any other PHP file here), you need to edit the values in the following lines in the `init.php` file to match your database setup:

```
define("DB_DSN", "mysql:dbname=some_database_name;host=localhost");
define("DB_USERNAME", "your_db_username");
define("DB_PASSWORD", "your_db_password");
```

You can also edit the table name constants below the previous lines if you like or need to. After editing, transfer all the PHP files to a location of your choosing (on a PHP capable server ofc) and navigate to `http://url.to.your/server/setup.php` with your browser. The setup script does not execute HTTP requests in parallel, so loading and dumping the data might take a while -- tens of seconds even. When the setup has completed successfully, the backend is ready: `lines.php` and `routeStops.php` will be your two API endpoints answering to HTTP GET requests with JSON. 

## API
The API consists of two endpoints: `lines.php` and `routeStops.php`. Both accept HTTP GET and reply with JSON.

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


## jQuery plugin

A jQuery plugin is also provided. Tested with jQuery v1.11.0, no idea about 2.x branch. Its usage is super-easy:

* Import Google Maps JavaScript API by adding `<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>` before the closing `</body>` tag. Replace YOUR_API_KEY with your Google API key. See more [here](https://developers.google.com/maps/documentation/javascript/tutorial).
* Import the jQuery plugin by adding `<script src="path/to/kuopio-busmap-jquery.js"></script>` below the Google Maps JS import.
* Use the plugin on jQuery Objects [after the DOM has loaded](http://learn.jquery.com/using-jquery-core/document-ready/). For example `$('#bus-map').kuopioBussify();`

### Options
When using `$('#bus-map').kuopioBussify()`, the plugin uses some sensible defaults (and draws a few sample  routes). The plugin can accept an options object, which will also be passed as [Map Options](https://developers.google.com/maps/documentation/javascript/tutorial#MapOptions) for the Google Map. In addition to what Map Options supports, following options can be provided (default value will be used if the field isn't defined in the options object):

| Field            | Type         | Default value                | Note                                                           |
| ---------------- | ------------ | ---------------------------- | -------------------------------------------------------------- |
| `routes`         | array        | `[{id: 18}, {id: 126}]`      | Can be nicely passed with `routes` array from bus line objects | 
| `zoom`           | Number (int) | 12                           | Default map zoom                                               |
| `center`         | `google.maps.LatLng` | Center of Kuopio     |                                                                |
| `markers`        | Boolean      | `true`                       |                                                                |
| `apiEndPoint`    | String       | "routeStops.php"             | If the API resides in the previous directory or so..           |
| `markerIcon`     | String       | `undefined` (default marker) | Path to the icon, e.g. `img/marker.png`                        |

So for example, one could instantiate the map with: 
```javascript
$('#bus-map').kuopioBussify({
   routes: [
      {
         id: 123
      },
      {
         id: 89
      },
      {
         id: 33
      }
   ],
   markerIcon: 'img/bus_marker.png',
   apiEndPoint: 'api/wayPoints.php',
   zoom: 11
});
```

## Demo
A demo site can be found in the folder `demo/` which is also demonstrated at [http://cs.uef.fi/~mikkoks/kuopio-busmap/demo/](http://cs.uef.fi/~mikkoks/kuopio-busmap/demo/).