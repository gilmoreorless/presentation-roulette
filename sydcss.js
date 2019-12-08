/*** CONFIG ***/

const topics = [
	'⚡️ Speaker’s choice ✨',
	'IE was awesome because…',
	'Utility-first CSS',
	'Who needs CSS anyway?',
	'I wish CSS had…',
	'Houdini',
	'⚡️ Audience choice ☠️',
	'3 things you didn’t know about…',
	'CSS in email',
	'Performance and jank',
	'CSS annoys me because…',
	'Units in CSS',
];

const minSpinDuration = 10000;
const spinDurationVariance = 2000;
const constantSpinDuration = topics.length * 1500;

const effectFiles = {
	spin: 'sounds/roulette.mp3',
	'spin-reverse': 'sounds/roulette-reverse.mp3',
	ding: 'sounds/chime.mp3',
	crash: 'sounds/crash.mp3',
	intro: 'sounds/intro.mp3',
};




/*** BASIC SELECTION ***/



let remainingTopics = new Set(topics);
let chosenTopics = [];

function randomIndex(collection) {
	let max = collection.length || collection.size || 0;
	return Math.floor(Math.random() * max);
}

function randomItem(collection) {
	return collection[randomIndex(collection)];
}

function removeRandomItem(set) {
	let index = randomIndex(set);
	let item = [...set][index];
	set.delete(item);
	return item;
}

function selectTopic() {
	if (!remainingTopics.size) {
		console.log('Nothing left to select.');
		return;
	}
	let topic = removeRandomItem(remainingTopics);
	console.log('Topic: %s', topic, remainingTopics);
	chosenTopics.push(topic);
	return topic;
}

function resetTopics() {
	console.log('--RESET TOPICS--');
	remainingTopics = new Set(topics);
	chosenTopics = [];
}




/*** SPINNER ***/



const rotation = (axis, angle) => `rotate${axis.toUpperCase()}(${angle}turn)`;

const spinnerEffects = [
	{
		name: 'normal',
		start: ({ node, axis, start, end, duration, itemCount }) => {
			return {
				animation: node.animate(
					{ transform: [rotation(axis, start), rotation(axis, end)] },
					{ duration, easing: 'cubic-bezier(0.11, 0.69, 0.13, 0.98)', fill: 'forwards' }
				),
				sound: soundEffects.play('spin'),
			};
		},
		end: ({ animation, sound, showArrow }) => {
			sound.stop();
			showArrow();
		},
	},

	{
		name: 'oneBack',
		start: ({ node, axis, start, end, duration, itemCount }) => {
			let itemDistance = 1 / itemCount;
			let overshoot = itemDistance * 0.8;
			let totalDistance = (end - start) + overshoot * 2;
			let overshootTiming = (totalDistance - overshoot) / totalDistance;
			return {
				animation: node.animate(
					[
						{ transform: rotation(axis, start), easing: 'cubic-bezier(0.11, 0.69, 0.13, 0.98)' },
						{ transform: rotation(axis, end + overshoot), offset: overshootTiming },
						{ transform: rotation(axis, end) }
					],
					{ duration, fill: 'forwards' }
				),
				sound: soundEffects.play('spin'),
			};
		},
		end: ({ animation, sound, showArrow }) => {
			sound.stop();
			showArrow();
		},
	},

	{
		name: 'wobble',
		start: ({ node, axis, start, end, duration, itemCount }) => {
			/*
			- Many rotations to item
			- Back to previous item
			- Forward to almost item
			- Back to boundary point
			- Pause on boundary point
			- Snap to item
			*/

			let itemDistance = 1 / itemCount;
			let timeUnit = 0.07; // As percentage of total duration

			let wobbles = [
				{ point: end - itemDistance * 0.1 },
				{ point: end - itemDistance * 1.4, timeUnits: 2 },
				{ point: end - itemDistance * 0.3, timeUnits: 2 },
				{ point: end - itemDistance * 0.7, timeUnits: 1.5 },
				{ point: end - itemDistance * 0.5, timeUnits: 3, easing: 'ease-in-out' },
				{ point: end, timeUnits: 1, easing: 'cubic-bezier(0.69, 0.11, 0.98, 0.13)' },
			];

			let totalTimeUnits = wobbles.reduce((memo, { timeUnits }) => memo + timeUnits || 0, 0);
			let totalWobbleTime = timeUnit * totalTimeUnits;
			let wobbleStartOffset = 1 - totalWobbleTime;
			let keyframes = [
				{ transform: rotation(axis, start), easing: 'cubic-bezier(0.11, 0.69, 0.13, 0.98)' }
			];
			let lastOffset = wobbleStartOffset;
			wobbles.forEach((frame, i) => {
				let nextFrame = wobbles[i + 1];
				let easing = nextFrame && nextFrame.easing || 'cubic-bezier(0.63, 0, 0.37, 1)';
				let offset = lastOffset + timeUnit * (frame.timeUnits || 0);
				let props = {
					transform: rotation(axis, frame.point),
					offset,
					easing,
				};
				keyframes.push(props);
				lastOffset = offset;
			});

			return {
				animation: node.animate(
					keyframes,
					{ duration: duration + duration * totalWobbleTime, fill: 'forwards' }
				),
				sound: soundEffects.play('spin'),
			};
		},
		end: ({ animation, sound, showArrow }) => {
			sound.stop();
			showArrow();
		},
	},

// 	{
// 		name: 'halt',
// 		start: ({ node, axis, start, end, duration, itemCount }) => {
// 			return {
// 				animation: node.animate(
// 					{ transform: [rotation(axis, start), rotation(axis, end)] },
// 					{ duration: 1500, easing: 'cubic-bezier(0, 0, 0.9, 1.15)', fill: 'forwards' }
// 				),
// 				sound: soundEffects.play('spin'),
// 			};
// 		},
// 		end: ({ animation, sound, showArrow }) => {
// 			sound.stop();
// 			showArrow();
// 		},
// 	},

	{
		name: 'halt-crash',
		start: ({ node, axis, start, end, duration, itemCount }) => {
			return {
				animation: node.animate(
					{ transform: [rotation(axis, start), rotation(axis, end)] },
					{ duration: duration, easing: 'cubic-bezier(0.69, 0.11, 0.98, 0.13)', fill: 'forwards' }
				),
				sound: soundEffects.play('spin-reverse'),
			};
		},
		end: ({ animation, sound, showArrow, rootNode, itemNodes }) => {
			sound.stop();
			const crashDuration = 1500;
			rootNode.dataset.hasCrashed = true;
			itemNodes.forEach(node => {
				node.animate(
					{ transform: [
						node.style.transform,
						`${node.style.transform}
						rotateX(${Math.random()}turn)
						rotateY(${Math.random() / 2 - 0.5}turn)
						rotateZ(${Math.random() / 2 - 0.5}turn)
						translateZ(2000px)`
					] },
					{ duration: crashDuration, easing: 'cubic-bezier(0.2, 0.38, 0.85, 1.23)', fill: 'forwards' }
				);
			});

			setTimeout(() => {
				rootNode.style.transform = 'rotateZ(-10deg)';
			}, 1000);
			const crash = soundEffects.play('crash');
			crash.onended = () => {
				setTimeout(showArrow, 1000);
			}
		},
	},
];

class Spinner {
	constructor(selector, items) {
		this.root = document.querySelector(selector);
		this.axis = 'x';
		this.effectIndex = -1;
		this.isConstantlySpinning = false;
		this.setup(items);
	}

	setup(items) {
		let container = document.createElement('div');
		container.className = 'spinner__list-container';

		let listNode = this.listNode = document.createElement('ul');
		listNode.className = 'spinner__list';

		this.setItems(items);

		container.appendChild(listNode);
		this.root.appendChild(container);

		let overlayNode = document.createElement('div');
		overlayNode.className = 'spinner__overlay';
		this.root.appendChild(overlayNode);

		let borderNode = document.createElement('div');
		borderNode.className = 'spinner__border';
		this.root.appendChild(borderNode);

		// Must be called after the elements appear in the DOM, to correctly calculate height
		this.transformItems();
	}

	setItems(items) {
		this.items = Array.from(items);
		this.itemNodes = [];
		this.selectedIndex = 0;
		for (let item of this.items) {
			let itemNode = document.createElement('li');
			itemNode.className = 'spinner__item';
			itemNode.appendChild(document.createTextNode(item));
			this.listNode.appendChild(itemNode);
			this.itemNodes.push(itemNode);
		}
	}

	transformItems() {
		const count = this.itemNodes.length;
		if (!count) {
			return;
		}
		const itemHeight = parseInt(getComputedStyle(this.itemNodes[0]).height, 10);
		const itemAngle = Math.PI * 2 / count;
		const radius = (itemHeight / 2) / Math.tan(itemAngle / 2);
		this.itemNodes.forEach((node, i) => {
			let angle = itemAngle * i;
			node.style.transform = `translateY(-${itemHeight / 2}px) rotateX(-${angle}rad) translateZ(${radius - 1}px)`;
		});
	}

	nextEffect() {
		this.effectIndex = this.effectIndex < spinnerEffects.length - 1
			? this.effectIndex + 1
			: 0;
		return spinnerEffects[this.effectIndex];
	}

	resetEffects() {
		this.effectIndex = -1;
	}

	spinTo(idx) {
		return new Promise(resolve => {
			const oldItemAngle = this.selectedIndex / this.itemNodes.length;
			const newItemAngle = idx / this.itemNodes.length;
			const minRotations = 5;
			let turn = minRotations + newItemAngle;
			if ((turn - oldItemAngle) < minRotations) {
				turn += 1;
			}
			const variance = Math.random() * spinDurationVariance - spinDurationVariance / 2;
			const duration = minSpinDuration + variance;
			
			delete this.root.dataset.hasArrow;
			const effectFn = this.nextEffect();
			let effect = effectFn.start({
				node: this.listNode,
				axis: this.axis,
				start: oldItemAngle,
				end: turn,
				duration,
				itemCount: this.itemNodes.length,
			});
			effect.animation.onfinish = () => {
				effectFn.end({
					animation: effect.animation,
					sound: effect.sound,
					showArrow: this.showArrow.bind(this),
					rootNode: this.root,
					itemNodes: this.itemNodes.filter((_, itemIdx) => itemIdx !== idx),
				});
				resolve(effect);
			}
			this.selectedIndex = idx;
		});
	}

	spinToRandom() {
		let idx = Math.floor(Math.random() * this.itemNodes.length);
		this.spinTo(idx);
	}

	spinConstantly() {
		delete this.root.dataset.hasArrow;
		this.listNode.animate(
			{ transform: [rotation(this.axis, 0), rotation(this.axis, 1)] },
			{ duration: constantSpinDuration, easing: 'linear', iterations: Infinity }
		);
		this.isConstantlySpinning = true;
	}

	stopConstantSpin() {
		this.isConstantlySpinning = false;
		const anims = this.listNode.getAnimations();
		if (anims.length) {
			anims[0].cancel();
		}
	}

	setDisabled(idx) {
		this.itemNodes[idx].classList.add('disabled');
	}

	showArrow() {
		soundEffects.play('ding');
		this.root.dataset.hasArrow = true;
	}

	hideArrow() {
		this.root.dataset.hasArrow = false;
	}
}




/*** SOUND EFFECTS ***/



class SoundEffects {
	constructor(config) {
		this.audioContext = null;
		this.effects = new Map();
		Object.keys(config).forEach(name => {
			this.addEffect(name, config[name])
		});
	}

	context() {
		if (!this.audioContext) {
			this.audioContext = new AudioContext();
		}
		return this.audioContext;
	}

	async addEffect(name, file) {
		const response = await fetch(file);
		const audioData = await response.arrayBuffer();
		const audioBuffer = await this.context().decodeAudioData(audioData);
		this.effects.set(name, audioBuffer);
		return audioBuffer;
	}

	play(name) {
		if (!this.effects.has(name)) {
			return false;
		}
		
		const ctx = this.context();
		const sourceNode = ctx.createBufferSource();
		sourceNode.buffer = this.effects.get(name);
		sourceNode.connect(ctx.destination);
		sourceNode.start();
		return sourceNode;
	}

}

const soundEffects = new SoundEffects(effectFiles);




/*** INTRO SCREEN ***/



const introCanvas = document.getElementById('intro');
let W, H, ctx;

let xyOverflow = 0.4; // percentage of W or H
let totalTrailTime = 4000; // milliseconds
let trailFader = 0.05; // opacity
let title = 'SYDCSS';

function lerp(start, end, perc) {
	return start + (end - start) * perc;
}

function lerpStep(start, end, perc, steps) {
	let percPerStep = 1 / steps;
	let stepNum = Math.floor(perc / percPerStep);
	return lerp(start, end, stepNum * percPerStep);
}

async function wait(time) {
	return new Promise((resolve) => {
		setTimeout(resolve, time);
	});
}

async function showIntroScreen() {
	// Reset everything to the right state
	mainContents.className = 'main hidden';
	introCanvas.className = 'intro-screen';
	introCanvas.style.transform = '';

	W = introCanvas.width = window.innerWidth;
	H = introCanvas.height = window.innerHeight;
	ctx = introCanvas.getContext('2d');
	ctx.font = '7rem Monoton';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#fff';
	ctx.lineWidth = 15;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	// Start the show
	let sound = soundEffects.play('intro');
	await wait(2000);
	let props = await introTextAppear();
	introCleanText(props);
	await wait(2000);
	await introShrinkCanvas();
	introShowContents();
}

async function introTextAppear() {
	return new Promise((resolve) => {
		let duration = totalTrailTime;
		let startAngle = Math.PI; // radians
		let endAngle = 0;
		let startPos = [W * 2.5, 0 - H * xyOverflow];
		let endPos = [W / 2, H / 2];
		let startScale = 0.1;
		let endScale = 1;
		let startHue = 180;
		let endHue = 760;

		let startTime;
		let lastTrailColour;
		let totalTrailFades = 1 / (trailFader / 2);
		let trailFadeCount = 0;
		ctx.save();

		function doFadeOut() {
			ctx.save();
			ctx.shadowBlur = 0;
			ctx.fillStyle = `rgba(0, 0, 0, ${trailFader})`;
			ctx.fillRect(0, 0, W, H);
			ctx.restore();
		}

		function doLoop(time) {
			if (!startTime) startTime = time;

			let rawPerc = (time - startTime) / duration;
			let perc = Math.min(rawPerc, 1);
			let isMoving = rawPerc <= 1;
			let isFading = trailFadeCount < totalTrailFades;
			if (isMoving || isFading) {
				requestAnimationFrame(doLoop);
			} else {
				return resolve({
					colour: lastTrailColour,
				});
			}

			// End-of-movement trail fade-out
			if (!isMoving) {
				// Initiate new positioning
				if (trailFadeCount == 0) {
					ctx.restore();
					ctx.save();
					ctx.shadowColor = lastTrailColour;
					ctx.strokeStyle = lastTrailColour;
					ctx.shadowBlur = 5;
				}
				trailFadeCount++;

				// Fade out previous images
				doFadeOut();

				// Re-add text above the fade-out
				let x = W / 2, y = H / 2;
				ctx.strokeText(title, x, y);
				ctx.fillText(title, x, y);

				if (!isFading) {
					ctx.restore();
				}
				return;
			}

			// Re-add the previous trail to cover the white text
			ctx.strokeText(title, 0, 0);
			ctx.restore();

			// Calculate new position
			let angle = lerp(startAngle, endAngle, perc);
			let x = lerp(startPos[0], endPos[0], perc);
			let y = lerp(startPos[1], endPos[1], perc);
			let scale = lerp(startScale, endScale, perc);
			let hue = lerpStep(startHue, endHue, perc, 6);
			let colour = `hsl(${hue % 360}, 50%, 50%)`;

			// Fade out previous images
			doFadeOut();

			// Move to new location/rotation
			ctx.save();
			ctx.scale(scale, scale);
			ctx.translate(x, y);
			ctx.rotate(angle);

			// Add trail
			lastTrailColour = colour;
			ctx.shadowColor = colour;
			ctx.strokeStyle = colour;
			ctx.shadowBlur = 40;
			ctx.strokeText(title, 0, 0);

			// Add text
			ctx.shadowBlur = 0;
			ctx.fillText(title, 0, 0);
		}

		requestAnimationFrame(doLoop);
	});
}

function introCleanText({ colour }) {
	ctx.clearRect(0, 0, W, H);

	ctx.save();
	ctx.translate(W / 2, H / 2);
	ctx.shadowColor = colour;
	ctx.strokeStyle = colour;
	ctx.shadowBlur = 15;
	ctx.lineWidth = 20;
	ctx.strokeText(title, 0, 0);
	ctx.fillText(title, 0, 0);
	ctx.restore();
}

async function introShrinkCanvas() {
	return new Promise((resolve) => {
		let textSizeCanvas = ctx.measureText(title);
		let textSizeHtml = document.getElementById('title-inner').getBoundingClientRect();
		let scale = textSizeHtml.width / textSizeCanvas.width;

		let yCanvas = H / 2;
		let baseline = textSizeCanvas.fontBoundingBoxAscent / (textSizeCanvas.fontBoundingBoxAscent + textSizeCanvas.fontBoundingBoxDescent);
		let yHtml = textSizeHtml.y + textSizeHtml.height * baseline;
		let translate = yHtml - yCanvas;

		function transformEnd() {
			introCanvas.removeEventListener('transitionend', transformEnd);
			resolve();
		}
		introCanvas.addEventListener('transitionend', transformEnd);
		introCanvas.style.transform = `
			translateY(${translate}px)
			scale(${scale})
			rotateX(1turn)
			`;
	});
}

function introShowContents() {
	introCanvas.classList.add('fade-out');
	mainContents.classList.remove('hidden');
	mainContents.classList.add('fade-in');
}




/*** INTERACTIONS ***/



const spinnerTopic = new Spinner('#spinner-topic', topics);

let lastSelectedIndex;

function spinToRandomTopic() {
	const chooseItem = (spinner, item) => {
		const idx = spinner.items.indexOf(item);
		if (lastSelectedIndex) {
			spinner.setDisabled(lastSelectedIndex);
		}
		
		spinner.spinTo(idx);
		lastSelectedIndex = idx;
	}

	const topic = selectTopic();
	if (topic) {
		chooseItem(spinnerTopic, topic);
	}
}

const mainContents = document.getElementById('main-contents');
const spinButton = document.getElementById('select-topic');
spinButton.addEventListener('click', spinToRandomTopic, false);

const keyActions = {
	' ': 'select',
	F5: 'select',
	Enter: 'select',
	b: 'slowSpin',
	ArrowDown: 'slowSpin',
	i: 'intro',
	PageDown: 'intro',
	r: 'resetTopics',
	PageUp: 'resetTopics',
	s: 'showContent', // debug only
};

/**
PRESENTER REMOTE:
      {Play}
        F5

{Back}      {Forward}
PageUp      PageDown

      {Stop}
        b
*/

document.addEventListener('keydown', (ev) => {
	console.log('[keydown]', ev.keyCode, ev.key, keyActions[ev.key]);
	switch (keyActions[ev.key]) {
		case 'select':
			spinButton.classList.add('is-active');
			setTimeout(() => {
				spinToRandomTopic();
				spinButton.classList.remove('is-active');
			}, 200);
			break;
		case 'slowSpin':
			if (spinnerTopic.isConstantlySpinning) {
				spinnerTopic.stopConstantSpin();
			} else {
				spinnerTopic.spinConstantly();
			}
			break;
		case 'intro':
			showIntroScreen();
			break;
		case 'resetTopics':
			resetTopics();
			spinnerTopic.resetEffects();
			break;
		case 'showContent':
			mainContents.classList.remove('hidden');
			break;
	}
}, false);
