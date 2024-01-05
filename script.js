'use strict';

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
	#map;
	#mapClickEvent;

	constructor() {
		this._getPosition();
		inputType.addEventListener('change', this._toggleWorkoutType);
	}

	_getPosition() {
		// notice this._loadMap.bind(this)
		// getCurrentPosition (gCP) will call the loadMap fn as a regular fn call
		// not as a method call, so the regular fn call will have this set to undefined

		// WRONG: // navigator.geolocation.getCurrentPosition(this._loadMap, function () {
		// CORRECT:
		// navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
		// 	alert('Could not get your location coordinates!');
		// 	throw new Error('App quit because location could not be found');
		// });

		const position = { coords: { latitude: 19.2793888, longitude: 72.860704 } };
		this._loadMap(position);
	}

	_loadMap(position) {
		const { latitude, longitude } = position.coords;
		const coords = [latitude, longitude];

		this.#map = L.map('map').setView(coords, 13);

		L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap',
		}).addTo(this.#map); // notice this.#map

		this.#map.on('click', this._showForm.bind(this));
	}

	_showForm(mapEvt) {
		this.#mapClickEvent = mapEvt;
		form.classList.remove('hidden');
		inputDistance.focus();
	}

	_toggleWorkoutType() {
		inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
		inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
	}

	_newWorkout() {}
}

const app = new App();

// =====================================================================
// OLD CODE

/*

// click event on map, notice that we are using leaflet for this and
// not addEventListener (because then we don't have any way of knowing the coords of click)
map.on('click', function (mapEvent) {
	// console.log(mapEvent);

	// getting the latitude and longitude of click
	const { lat: clickLat, lng: clickLng } = mapEvent.latlng;
	// console.log(clickLat, clickLng);

	// create marker and popup on the clicked location
	// marker: the pin on map, popup: the msg box
	L.marker([clickLat, clickLng])
		.addTo(map)
		.bindPopup(
			L.popup({
				maxWidth: 150,
				minWidth: 75,
				closeButton: false,
				autoClose: false,
				closeOnClick: false,
				closeOnEscapeKey: false,
				className: 'running-popup',
			})
		)
		.setPopupContent('Workout')
		.openPopup();
});

*/
