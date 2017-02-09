/* Magic Mirror
 * Node Helper: MMM-TransantiagoCL-Paraderos
 *
 * By Rodrigo Ramìrez Norambuena https://rodrigoramirez.com
 * MIT Licensed.
 */

var express = require("express");
var NodeHelper = require("node_helper");
var request = require("request");
var url = require("url");
var async = require("async");


module.exports = NodeHelper.create({
	// Override start method.
	start: function() {
		var self = this;
		console.log("Starting node helper for: " + this.name);
		this.setConfig();
		this.extraRoutes();

	},

	setConfig: function() {
		this.config = {};
		this.apiUrlBase = "http://paraderos.cl/paraderos/paradero";
	},

	// Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {

	},

	// create routes for module manager.
	// recive request and send response
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-TransantiagoCL-Paraderos/data", function(req, res) {
			self.getData(req, res);
		});
	},

	// return data about paraderos in JSON format.
	getData: function(req, res) {
		var self = this;
		busStops = req.query["busStop"];
		if (typeof busStops === "undefined")  {
			res.send({});
			return false;
		}

		var urlBusStopInformation = busStops.map(function (bustop) {
			return self.apiUrlBase + ":" + bustop + ".json";
		});

		var dataInfo = async.map(urlBusStopInformation, this.httpGet, function (err, r) {
			if (err) {
				return console.log(err);
			}
			res.send(r);
		});
	},


	httpGet: function(url, callback) {
	    // include NodeJs and Magicmirror Version. Url of MagicMirror project
		nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
		headers = {"User-Agent": "Mozilla/5.0 (Node.js "+ nodeVersion + ") MagicMirror/"  + global.version +  " (https://github.com/MichMich/MagicMirror/)"}

		const options = {
			url: url,
			json: true,
			headers: headers
		};
		request(options,
			function(err, res, body) {
				callback(err, body);
			}
		);
	},

});
