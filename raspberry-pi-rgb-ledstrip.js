#!/usr/bin/env node

var configKey = "random";

// Je kunt het volgende stuk optioneel verwijderen
// =============================================================================

const fs = require('fs');
var crypto = require('crypto');
const configFilePath = "./config.json";

if (fs.existsSync(configFilePath)) {
    // als het bestand aanwezig is gebruik de volgende key voor de url
    try {
        configKey = JSON.parse(fs.readFileSync(configFilePath));
		var configKey = configKey.configKey;
    }
    catch (e) {
        console.error("There is an error with the key file. Log: " + e.message);
        process.exit(-1);
    }
}
else {
	// als het bestand config.json niet aanwezig > maak er dan één
	function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert naar base64 format
        .slice(0, len)        // return required aantal characters
        .replace(/\+/g, '0')  // vervang '+' with '0'
        .replace(/\//g, '0'); // vervang '/' with '0'
	}
	configKey = { configKey: randomValueBase64(18).toLowerCase()};
    fs.writeFileSync(configFilePath, JSON.stringify(configKey));
	var configKey = configKey.configKey;

    console.log("No key file found. One was generated. Here is the public key: " + configKey);


}
// =============================================================================
// einde random generator


// we gebruiken localtunnel om een webadres aan te maken
var localtunnel = require('localtunnel');
// express is de webserver
var express = require('express')
// hier wordt express aangemaakt
var app = express();
// bodyParser is de middleware, om de ontvangen berichten te ontcijferen
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Als je naar http://localhost:5037/ zie je dit
app.get('/', function (req, res) {
  res.send('Hello World!')
})

// Als je naar http://localhost:5037/webhook zie je dit
app.get('/webhook', function (req, res) {
  res.send('Hello World!')
})

// Een mode waarbij veel kleuren worden afgewisseld. Redelijk Random
var discomodet = setInterval(DiscoMode, 500);
var discomodeEnabled = false;

function DiscoMode() {
	if (discomodeEnabled) {
		rgb(Math.random(),Math.random(),Math.random());
	}
}

// Als er een POST-request naar webhook wordt gedaan:
app.post('/webhook', function (req, res) {
	if (req.body.channel_name !== undefined) {

		console.log(req.body);
		discomodeEnabled = false;

		switch(req.body.text) {
			case "groen":
				res.send("Groen is geactiveerd!");
				rgb(0,1,0);
			break;
			case "wit":
				res.send("Wit is geactiveerd!");
				rgb(1,1,1);
			break;
			case "zwart":
				res.send("Zwart is geactiveerd!");
				rgb(0,0,0);
			break;
			case "creme":
				res.send("Creme is geactiveerd!");
				rgb(0.9,0.9,0.9);
			break;
			case "geel":
				res.send("Geel is geactiveerd!");
				rgb(0.98,0.94,0.46);
			break;
			case "rose":
				res.send("Rose is geactiveerd!");
				rgb(0.94,0.81,0.76);
			break;
			case "zalm":
				res.send("Zalm is geactiveerd!");
				rgb(0.91,0.57,0.5);
			break;
			case "roze":
				res.send("Roze is geactiveerd!");
				rgb(0.91,0.32,0.5);
			break;

			case "blauw":
				res.send("Blauw is geactiveerd!");
				rgb(0,0,1);
			break;

			case "rood":
				res.send("Rood is geactiveerd!");
				rgb(1,0,0);
			break;
			case "disco":
				res.send("Disco-mode is geactiveerd!");
				discomodeEnabled = true;
				rgb(0,0,0);
			break;

			default:
				res.send("Gebruik het command /kleur rood eens");
		}

	}
	if (req.body.channel_name === undefined) {
		res.send('Sorry deze kleur is niet beschikbaar!');
	}

})

app.listen(5037, function () {
  console.log('App is gestart op http://localhost:5037')
})

var opt = {
    host: "http://localtunnel.me",
    port: 5037,
    local_host: "localhost",
    subdomain: configKey || "abcdefghijkklmnopq",
};

// request > is om externe urls binnen te halen
var request = require('request');


var tunnel = localtunnel(5037, opt, function(err, tunnel) {
    if (err) {
	    console.log(err);
    }

	console.log(tunnel.url + "/webhook");

	// Om de 3 seconde controleren of de url werkt
	setInterval(function(){
		request(tunnel.url, function (error, response, body) {
			if (response.statusCode === 502) {
				console.log('statusCode:', response && response.statusCode); // // print a error code
				console.log('body:', body); // statusCode: 502 body: no active client for 'mhvr00pcowwqobneq2'.
				process.exit(1);

			}
			if (error !== null) {
				console.log('error:', error); // Print the error if one occurred
			}
		});
	}, 3000);
});

tunnel.on('close', function() {
    // tunnels are closed
	process.exit(1);
});


// i2cbus node package
var i2cBus = require("i2c-bus");
// driver voor het PWM pca9685 bord
var Pca9685Driver = require("pca9685").Pca9685Driver;

var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: false
};


function rgb(r,g,b) {
	// rgb (value tussen 0 en 1)
	if (!isNaN(r) || !isNaN(g) || !isNaN(b)) {
		pwm = new Pca9685Driver(options, function(err) {
		    if (err) {
		        console.error("Error initializing PCA9685");
		        process.exit(-1);
		    }

			// 1,0,0 == red
			// 0,1,0 == green
			// 0,0,1 == blue
			pwm.setDutyCycle(0, r);
			pwm.setDutyCycle(1, g);
			pwm.setDutyCycle(2, b);
		});
	}
	if (isNaN(r) || isNaN(g) || isNaN(b)) {
		console.log("error")
	}
}

// start met blauw
rgb(0,1,1)
