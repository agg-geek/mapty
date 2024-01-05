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

// this does not work through a proxy
navigator.geolocation.getCurrentPosition(
	// success callback
	function (position) {
		// console.log(position);
		const { latitude, longitude } = position.coords;
		console.log(latitude, longitude);
	},
	// failure callback
	function () {
		alert('Could not get your location coordinates!');
		throw new Error('App quit because location could not be found');
	}
);
