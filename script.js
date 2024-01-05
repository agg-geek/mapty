'use strict';

class Workout {
	date = new Date(); // to show date on the workout popup
	id = String(Date.now()).slice(-10); // use the last 10 digits of Date.now() as ID

	constructor(coords, distance, duration) {
		this.coords = coords; // [lat, lng]
		this.distance = distance; // km
		this.duration = duration; // mins
	}

	_setDescription() {
		const convertTitleCase = str => `${str[0].toUpperCase()}${str.slice(1)}`;

		// prettier-ignore
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		this.description = `${convertTitleCase(this.workoutType)} on ${
			months[this.date.getMonth()]
		} ${this.date.getDate()}`;
	}
}

class Running extends Workout {
	workoutType = 'running';
	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration);
		this.cadence = cadence;
		this.calcPace();
		// call here as this.workoutType exists only here and not in Workout class
		this._setDescription();
	}

	calcPace() {
		this.pace = Math.round(this.duration / this.distance); // mins/km
		return this.pace;
	}
}

class Cycling extends Workout {
	workoutType = 'cycling';
	constructor(coords, distance, duration, elevationGain) {
		super(coords, distance, duration);
		this.elevationGain = elevationGain;
		this.calcSpeed();
		// call here as this.workoutType exists only here and not in Workout class
		this._setDescription();
	}

	calcSpeed() {
		this.speed = Math.round(this.distance / (this.duration / 60)); // km/hr
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
	#mapZoomLevel = 13;
	#mapClickEvent;
	#workouts = [];

	constructor() {
		this._getPosition();
		inputType.addEventListener('change', this._toggleWorkoutType);
		form.addEventListener('submit', this._newWorkout.bind(this));
		containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));

		// call this in the constructor so that previous workouts are immediately loaded
		this._getWorkouts();
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

		this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

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

	_hideForm() {
		inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

		form.classList.add('hidden');
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

		this._renderWorkout(workout);
		this._renderWorkoutMarker(workout); // notice no requirement of call or bind

		this._hideForm();

		this._storeWorkouts();
	}

	_renderWorkoutMarker(workout) {
		const popupOptions = {
			maxWidth: 150,
			minWidth: 75,
			autoClose: false,
			closeOnClick: false,
			className: `${workout.workoutType}-popup`,
		};

		L.marker(workout.coords) // workout.coords is [lat, lng] as reqd by leaflet
			.addTo(this.#map)
			.bindPopup(L.popup(popupOptions))
			.setPopupContent(`${workout.workoutType === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
			.openPopup();
	}

	_renderWorkout(workout) {
		// prettier-ignore
		const html = 
        `<li class="workout workout--${workout.workoutType}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workout.workoutType === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">kms</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">mins</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.workoutType === 'running' ? workout.pace : workout.speed}</span>
                <span class="workout__unit">${workout.workoutType === 'running' ? 'mins/km' : 'km/hr'}</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">${workout.workoutType === 'running' ? '🦶🏼' : '⛰'}</span>
                <span class="workout__value">${workout.workoutType === 'running' ? workout.cadence : workout.elevationGain}</span>
                <span class="workout__unit">${workout.workoutType === 'running' ? 'spm' : 'm'}</span>
            </div>
        </li>`;

		form.insertAdjacentHTML('afterend', html);
	}

	// click on a workout in sidebar and move to it's location in the map
	// use Event delegation
	_moveToPopup(evt) {
		const workoutElem = evt.target.closest('.workout');
		if (!workoutElem) return;

		const workout = this.#workouts.find(workout => workout.id === workoutElem.dataset.id);
		// console.log(workout);

		this.#map.setView(workout.coords, this.#mapZoomLevel, {
			animate: true,
			pan: { duration: 1 },
		});
	}

	_storeWorkouts() {
		localStorage.setItem('workouts', JSON.stringify(this.#workouts));
	}

	_getWorkouts() {
		const workouts = JSON.parse(localStorage.getItem('workouts'));
		if (!workouts) return;

		this.#workouts = workouts;
		this.#workouts.forEach(workout => this._renderWorkout(workout));
	}
}

const app = new App();
