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

class Workout {
	date = new Date(); // to show date on the workout popup
	id = String(Date.now()).slice(-10); // use the last 10 digits of Date.now() as ID

	constructor(coords, distance, duration) {
		this.coords = coords; // [lat, lng]
		this.distance = distance; // km
		this.duration = duration; // mins
	}
}

class Running extends Workout {
	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration);
		this.cadence = cadence;
		this.calcPace();
	}

	calcPace() {
		this.pace = this.duration / this.distance; // mins/km
		return this.pace;
	}
}

class Cycling extends Workout {
	constructor(coords, distance, duration, elevationGain) {
		super(coords, distance, duration);
		this.elevationGain = elevationGain;
		this.calcSpeed();
	}

	calcSpeed() {
		this.speed = this.distance / (this.duration / 60); // km/hr
		return this.speed;
	}
}

// =====================================================================

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
	#workouts = [];

	constructor() {
		this._getPosition();
		inputType.addEventListener('change', this._toggleWorkoutType);
		// newWorkout called as a callback by addEventListener will have
		// this set to form element
		form.addEventListener('submit', this._newWorkout.bind(this));
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

	_newWorkout(formEvt) {
		formEvt.preventDefault();

		const isNumber = (...input) => input.every(i => Number.isFinite(i));
		const isPositive = (...input) => input.every(i => i > 0);

		const { lat: clickLat, lng: clickLng } = this.#mapClickEvent.latlng;

		let workout;

		const workoutType = inputType.value;
		const distance = Number(inputDistance.value);
		const duration = Number(inputDuration.value);

		if (workoutType === 'running') {
			const cadence = Number(inputCadence.value);

			if (!isNumber(distance, duration, cadence) || !isPositive(distance, duration, cadence)) {
				return alert('Input data is not valid. Enter positive numerical values.');
			}

			workout = new Running([clickLat, clickLng], distance, duration, cadence);
		}

		if (workoutType === 'cycling') {
			const elevationGain = Number(inputElevation.value);

			// elevationGain can be -ve as well
			if (!isNumber(distance, duration, elevationGain) || !isPositive(distance, duration)) {
				return alert('Input data is not valid. Enter positive numerical values.');
			}

			workout = new Cycling([clickLat, clickLng], distance, duration, elevationGain);
		}

		this.#workouts.push(workout);
		console.log(workout);
		console.log(this.#workouts);

		this._renderWorkoutMarker(workout); // notice no requirement of call or bind
	}

	_renderWorkoutMarker(workout) {
		const popupOptions = {
			maxWidth: 150,
			minWidth: 75,
			autoClose: false,
			closeOnClick: false,
			// className: `${inputType}-popup`, // FIX
		};

		L.marker(workout.coords) // workout.coords is [lat, lng] as reqd by leaflet
			.addTo(this.#map)
			.bindPopup(L.popup(popupOptions))
			.setPopupContent('Workout')
			.openPopup();
	}
}

const app = new App();
