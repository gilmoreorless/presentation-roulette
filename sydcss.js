/*** CONFIG ***/

const topics = [
	'Grid', 'Utility CSS', 'Animations', 'Custom Properties',
	'Theming', 'Gradients', 'CSS-in-JS', 'Speaker’s choice',
	'SVG', 'Houdini', 'I wish CSS had…',
];

const minSpinDuration = 10000;
const spinDurationVariance = 2000;
const constantSpinDuration = topics.length * 1500;


/*** BASIC SELECTION ***/

let remainingTopics = new Set(topics);

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
	return topic;
}


/*** SPINNER ***/

const rotation = (axis, angle) => `rotate${axis.toUpperCase()}(${angle}turn)`;

const spinnerAnimations = [
	function normal({ node, axis, start, end, duration, itemCount }) {
		return node.animate(
			{ transform: [rotation(axis, start), rotation(axis, end)] },
			{ duration, easing: 'cubic-bezier(0.11, 0.69, 0.13, 0.98)', fill: 'forwards' }
		);
	},

	function halt({ node, axis, start, end, duration, itemCount }) {
		return node.animate(
			{ transform: [rotation(axis, start), rotation(axis, end)] },
			{ duration: 1500, easing: 'cubic-bezier(0, 0, 0.9, 1.15)', fill: 'forwards' }
		)
	},

	function oneBack({ node, axis, start, end, duration, itemCount }) {
		let itemDistance = 1 / itemCount;
		let overshoot = itemDistance * 0.8;
		let totalDistance = (end - start) + overshoot * 2;
		let overshootTiming = (totalDistance - overshoot) / totalDistance;
		return node.animate(
			[
				{ transform: rotation(axis, start), easing: 'cubic-bezier(0.11, 0.69, 0.13, 0.98)' },
				{ transform: rotation(axis, end + overshoot), offset: overshootTiming },
				{ transform: rotation(axis, end) }
			],
			{ duration, fill: 'forwards' }
		)
	},
];

class Spinner {
	constructor(selector, items) {
		this.root = document.querySelector(selector);
		this.axis = 'x';
		this.animationIndex = -1;
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

	nextAnimation() {
		this.animationIndex = this.animationIndex < spinnerAnimations.length - 1
			? this.animationIndex + 1
			: 0;
		return spinnerAnimations[this.animationIndex];
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
			const animFn = this.nextAnimation();
			let anim = animFn({
				node: this.listNode,
				axis: this.axis,
				start: oldItemAngle,
				end: turn,
				duration,
				itemCount: this.itemNodes.length,
			});
			anim.onfinish = () => {
				this.root.dataset.hasArrow = true;
				resolve(anim);
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
}


/*** INTERACTIONS ***/

const spinnerTopic = new Spinner('#spinner-topic', topics);

let lastSelectedIndex;

document.getElementById('select-topic').addEventListener('click', () => {
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
}, false);
