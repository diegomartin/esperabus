// TODO: Ubicación Real: WGS84 to UTM coordinates conversion
// TODO: Añadir mapa de cada parada https://maps.google.es/?q=42.501845+-5.73967

var marquesinas = [];
var stops = [];

$(document).ready(function () {
    loadGPS();
});

// Geolocalization
function loadGPS(){
    if (navigator.geolocation) {
	var timeoutVal = 10 * 1000 * 1000;
	navigator.geolocation.getCurrentPosition(
	    processPosition,
	    displayError,
	    { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
	);
    }
    else {
        $("#information").text("Este navegador no soporta geolocalización.");
    }
}

function displayError(error) {
    var errors = { 
	1: 'Permiso denegado',
	2: 'Posición no disponible',
	3: 'Tiempo máximo excedido'};

    $("#information").text("Error: " + errors[error.code]);
}

function processPosition(position) {
    $("#information").text("Ubicación actual: Lat "+position.coords.latitude+" Lng " + position.coords.longitude);

    // Compute the UTM zone.
    //zone = Math.floor ((position.coords.longitude + 180.0) / 6) + 1;
    //zone = LatLonToUTMXY (DegToRad (position.coords.latitude), DegToRad (position.coords.longitude), zone, xy);

    var url = "/stops/"+position.coords.latitude+"/"+position.coords.longitude;
    $.post(url, {}, processStop);
}

function processStop(data){
    $(data).find("Stop").each(function(){
        var marquesina = $(this).find("IdStop").text();
        var coordX = $(this).find("CoordinateX").text();
	    var coordY = $(this).find("CoordinateY").text();
        marquesinas.push(marquesina);
    });

    loadInfo();
    setInterval(loadInfo, 30000);
}

function loadInfo(){
    stops = [];

    $.each(marquesinas, function(i, l){
        $.post("/times/"+l, {}, processTime);
    });
}

function processTime(data){
    $(data).find("Arrive").each(function(){
        var stop = {'parada':$(this).find("idStop").text(),
                    'linea':$(this).find("idLine").text(),
                    'destino':$(this).find("Destination").text(),
                    'tiempo':$(this).find("TimeLeftBus").text(),
                    'distancia':$(this).find("DistanceBus").text()/1000};
        stops.push(stop);
    });
    loadTable();
}

function loadTable(){
    stops.sort(function(a, b){return a['tiempo'] - b['tiempo']});

    $("#stops").text("Paradas cercanas: " + marquesinas);
    $("#lines").text("");
    $.each(stops, function(i, l){
        var line = "<tr>";
        line += "<td><span class='label'>" + l.parada + "</span></td>";
        line +="<td><span class='badge badge-info'>" + l.linea + "</span></td>";
        line +="<td>"+l.destino+"</td>";

        if(l.tiempo=="999999"){ // Tiempo desconocido
            line += "<td>desconocido</td>";
        }
        else {
            line += "<td>" + parseInt(l.tiempo/60) + " min. " + parseInt(l.tiempo%60) + " s.</td>";
        }

        line +="<td>" + l.distancia + " km.</td>";
        line +="</tr>";
        $("#lines").hide().append(line).show('slow'); //$("#lines").append(line);
    });
}

