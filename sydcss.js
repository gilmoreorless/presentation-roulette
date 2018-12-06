/*** CONFIG ***/

const topics = [
	'Accessibility',
	'IE was awesome because…',
	'Custom Properties',
	'⚡️ Speaker’s choice ✨',
	'3 things you didn’t know about…',
	'Stacking Context',
	'Who needs CSS anyway?',
	'I wish CSS had…',
	'Houdini',
	'CSS in email',
	'Performance',
];

const minSpinDuration = 10000;
const spinDurationVariance = 2000;
const constantSpinDuration = topics.length * 1500;

const effectFiles = {
	spin: 'sounds/roulette.mp3',
	'spin-reverse': 'sounds/roulette-reverse.mp3',
	ding: 'sounds/chime.mp3',
	crash: 'sounds/crash.mp3',
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

const spinButton = document.getElementById('select-topic');
spinButton.addEventListener('click', spinToRandomTopic, false);

const keyActions = {
	' ': 'select',
	F5: 'select',
	Enter: 'select',
	b: 'slowSpin',
	ArrowDown: 'slowSpin',
};

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
			spinnerTopic.spinConstantly();
			break;
	}
}, false);
