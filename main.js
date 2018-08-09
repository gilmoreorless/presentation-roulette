/*** BASIC SELECTION ***/

const speakers = ['Person A', 'Person B', 'Person C', 'Person D', 'Person E', 'Person F'];
const topics = ['Grid', 'Flexbox', 'Utility CSS', 'Animations', 'Custom Properties', 'Theming', 'Gradients', 'STUFF1', 'STUFF2'];

let remainingSpeakers = new Set(speakers);
let remainingTopics = new Set(topics);

function removeRandomItem(set) {
	let index = Math.floor(Math.random() * set.size);
	let item = [...set][index];
	set.delete(item);
	return item;
}

function selectPair() {
	if (!remainingSpeakers.size || !remainingTopics.size) {
		console.log('Nothing left to select.');
		return {};
	}
	let speaker = removeRandomItem(remainingSpeakers);
	let topic = removeRandomItem(remainingTopics);
	console.log('Speaker: %s; Topic: %s', speaker, topic, remainingSpeakers, remainingTopics);
	return { speaker, topic };
}

// document.getElementById('select-pair').addEventListener('click', selectPair, false);


/*** SPINNER ***/

class Spinner {
	constructor(selector, items) {
		this.root = document.querySelector(selector);
		this.setup(items);
	}

	setup(items) {
		let container = document.createElement('div');
		container.className = 'spinner-list-container';

		let listNode = this.listNode = document.createElement('ul');
		listNode.className = 'spinner-list';

		this.setItems(items);

		container.appendChild(listNode);
		this.root.appendChild(container);

		// Must be called after the elements appear in the DOM, to correctly calculate height
		this.transformItems();
	}

	setItems(items) {
		this.items = Array.from(items);
		this.itemNodes = [];
		this.selectedIndex = 0;
		for (let item of this.items) {
			let itemNode = document.createElement('li');
			itemNode.className = 'spinner-item';
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
			node.style.transform = `translateY(-${itemHeight / 2}px) rotateX(-${angle}rad) translateZ(${radius}px)`;
		});
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
			const prop = angle => `rotateX(${angle}turn)`;
			const duration = 5000 + Math.random() * 2000 - 1000;
			
	// 		this.listNode.style.setProperty('--rotation', `${minRotations + itemAngle}turn`);
			let anim = this.listNode.animate(
				{ 'transform': [prop(oldItemAngle), prop(turn)] },
				{ duration, easing: 'ease-out', fill: 'forwards' }
			);
			anim.onfinish = () => resolve(anim);
			this.selectedIndex = idx;
		});
	}

	spinToRandom() {
		let idx = Math.floor(Math.random() * this.itemNodes.length);
		this.spinTo(idx);
	}

	setDisabled(idx) {
		this.itemNodes[idx].classList.add('disabled');
	}
}

const spinnerSpeaker = new Spinner('#spinner-speaker', speakers);
const spinnerTopic = new Spinner('#spinner-topic', topics);

document.getElementById('spin-random').addEventListener('click', () => spinnerTopic.spinToRandom(), false);

document.getElementById('select-pair').addEventListener('click', () => {
	const chooseItem = (spinner, item) => {
		const idx = spinner.items.indexOf(item);
		spinner.spinTo(idx).then(anim => {
			spinner.setDisabled(idx);
		});
	}

	const { speaker, topic } = selectPair();
	if (speaker && topic) {
		chooseItem(spinnerSpeaker, speaker);
		chooseItem(spinnerTopic, topic);
	}
}, false);
