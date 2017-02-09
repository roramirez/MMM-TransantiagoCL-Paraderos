/* global Module */

/* Magic Mirror
 * Module: MMM-TransantiagoCL-Paraderos
 *
 * By Rodrigo Ramírez Norambuena https://rodrigoramirez.com
 * MIT Licensed.
 */

Module.register("MMM-TransantiagoCL-Paraderos",{
	defaults: {
		busStop: [],
		updateInterval: 60000,
		retryDelay: 2500
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		this.busStopInformation = [];
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);

	},

	/*
	 * getData
	 * Requests new data from api url helper
	 *
	 */
	getData: function() {
		var urlApiHelper = "/MMM-TransantiagoCL-Paraderos/data";
		var self = this;
		var retry = true;

		// parameters
		var params = new Array();
		for (idx in self.config.busStop) {
			params.push("busStop[]=" + self.config.busStop[idx]);
		}
		urlApi = urlApiHelper + "?" + params.join("&");


		var dataRequest = new XMLHttpRequest();

		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.getInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;
		var wrapper = document.createElement("div");
		wrapper.className = "small";

		for (idx in this.busStopInformation) {
			busStop =  this.busStopInformation[idx];

			var table = document.createElement("table");
			var header = document.createElement("header");

			header.innerHTML = busStop.paradero + ": " + busStop.nomett;
			wrapper.appendChild(header);

			var services = busStop.servicios.item;
			if (services.length > 0 ) {

				for (i in services) {
					var service = services[i];
					if (service.codigorespuesta == "00") {

						var serviceWrapper = document.createElement("tr");


						var symbolWrapper = document.createElement("td");
						symbolWrapper.className = "symbol";
						var symbol = document.createElement("span");
						symbol.className = "fa fa-bus";
						symbolWrapper.appendChild(symbol);
						serviceWrapper.appendChild(symbolWrapper);

						var busWrapper = document.createElement("td");
						busWrapper.innerHTML = service.servicio;
						busWrapper.className = "title bright";

						var timeWrapper = document.createElement("td");
						timeWrapper.innerHTML = service.horaprediccionbus1;

						var distanceWrapper = document.createElement("td");
						distanceWrapper.innerHTML = service.distanciabus1 + " mts.";

						serviceWrapper.appendChild(busWrapper);
						serviceWrapper.appendChild(timeWrapper);
						serviceWrapper.appendChild(distanceWrapper);
						table.appendChild(serviceWrapper);
					}
				}
			}
			wrapper.appendChild(table);
		}
		return wrapper;
	},

	getScripts: function() {
		return ["MMM-TransantiagoCL-Paraderos.css", "font-awesome.css"];
	},

	processData: function(data) {
		var self = this;
		this.busStopInformation = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;
	},

});
