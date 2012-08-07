import urllib2
import urllib
from flask import Flask, render_template

app = Flask(__name__)
app.debug=True

@app.route("/")
def index():
    return render_template('index.html');

@app.route("/times/<int:stop>", methods=['GET', 'POST'])
def times(stop):
    url = 'https://servicios.emtmadrid.es:8443/geo/servicegeo.asmx/getArriveStop'
    params = {"idClient":"WEB.PORTALMOVIL.OTROS",
              "passKey":"0810DDE4-02FC-4C0E-A440-1BD171B397C8",
              "idStop":stop,
              "statistics":"",
              "cultureInfo":"es"}
    
    return urllib2.urlopen(url=url, data=urllib.urlencode(params)).read()

@app.route("/stops/<coordX>/<coordY>", methods=['GET', 'POST'])
def stops(coordX, coordY):
    url = 'https://servicios.emtmadrid.es:8443/geo/servicegeo.asmx/getStopsFromXY'
    
    x = float(coordX)
    y = float(coordY)

    x = 445245.2451749799
    y = 4477442.770661578

    params = {"idClient":"WEB.PORTALMOVIL.OTROS",
	       "passKey":"0810DDE4-02FC-4C0E-A440-1BD171B397C8",
           "coordinateX":x,
           "coordinateY":y,
           "Radius":300, # metros
           "statistics":"",
           "cultureInfo":"es"}

    return urllib2.urlopen(url=url, data=urllib.urlencode(params)).read()

if __name__ == "__main__":
    app.run()

