import { Desktop } from '@wxcc-desktop/sdk';
const logger = Desktop.logger.createLogger('desktop-vis-queue');

class visualQueue extends HTMLElement {

	static get observedAttributes() {
		return ['taskid'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.interactionId = null;
		this.badgeElements = [];
		this.displayedImage = false;
	}
  
	render() {
		this.badgeContainer = document.createElement('div');
		this.badgeContainer.className = 'container';

		this.badgeContainer.innerHTML = `
			<style>
				.container {
					display: flex;
					justify-content: left;
				}
				.badge-display {
					display: flex;
					max-width: 192px;
					max-height: 64px;
				}
				.badge-hide {
					display: none;
					max-width: 0px;
					max-height: 0px;
				}
			</style>
			`;
		this.shadowRoot.appendChild(this.badgeContainer);
	}

	connectedCallback() {
		logger.info("Got connected event! Adding listeners!");
		this.init();
		this.render();
		this.identifyProperties();
	}

	disconnectedCallback() {
		logger.info("Got disconnected event! Removing Listeners!");
		Desktop.agentContact.removeAllEventListeners();
	}

	identifyProperties() {
		try {
			const readVariables = Object.keys(this).filter(properties => properties.startsWith('cadVariable'));
			logger.info(`Variables from layout: ${readVariables}`);
			this.countVariables = readVariables.length;

			for (let i = 0; i < readVariables.length; i++) {
				logger.info(`Read Properties: ${this[`cadVariable${i}`]}, ${this[`badgeUrl${i}`]}`);
			}
		} catch (error) {
			logger.error('Failed to identify properties:', error);
			this.countVariables = 0;
		}
	}

	async init() {
		Desktop.config.init({widgetName: "desktop-vis-queue", widgetProvider: "Aashish (aaberry)"});
	}

	showImage(callData) {
		if (!callData) {
			logger.warn('No call data provided to showImage');
			return;
		}

		try {
			for (let i = 0; i < this.countVariables; i++) {
				const cadVariable = this[`cadVariable${i}`];
				const badgeUrl = this[`badgeUrl${i}`];

				if (!callData[cadVariable]) {
					logger.warn(`CAD variable ${cadVariable} not found in call data`);
					continue;
				}

				const badgeElement = document.createElement('img');
				badgeElement.className = 'badge-display';
				
				const cardType = callData[cadVariable].value;
				logger.info(`Image name from CAD ${i}: ${cardType}`);
				
				const imageUrl = badgeUrl + cardType;
				logger.info(`Image URL ${i}: ${imageUrl}`);
				
				badgeElement.src = imageUrl;
				badgeElement.onerror = () => {
					logger.error(`Failed to load image: ${imageUrl}`);
				};
				
				this.badgeContainer.appendChild(badgeElement);
				this.badgeElements[i] = badgeElement;
			}
			this.displayedImage = true;
		} catch (error) {
			logger.error('Failed to show image:', error);
		}
	}

	hideImage() {
		this.badgeElements.forEach((badgeElement, i) => {
			if (badgeElement) {
				badgeElement.src = '';
				badgeElement.className = 'badge-hide';
				badgeElement.remove();
				logger.info(`Removed badge ${i}`);
			}
		});
		this.badgeElements = [];
		this.displayedImage = false;
	}

	async validateAndSwitchImage(taskId) {
		if (!this.countVariables) {
			this.identifyProperties();
		}

		try {
			const taskMap = await Desktop.actions.getTaskMap();
			let taskMapId = null;
			let cadData = null;

			for (const iterator of taskMap) {
				taskMapId = iterator[1].interactionId;
				cadData = iterator[1].interaction.callAssociatedData;
			}

			if (this.displayedImage || !taskId) {
				logger.info('Hiding Badges');
				this.hideImage();
			}

			if (taskId && taskId === taskMapId && cadData) {
				logger.info(`CAD data for interaction ${taskId}: ${JSON.stringify(cadData)}`);
				this.showImage(cadData);
			}
		} catch (error) {
			logger.error('Failed to validate and switch image:', error);
		}
	}

	attributeChangedCallback(attrName, oldVal, newVal) {
		logger.info(`Attribute ${attrName} has changed, ${oldVal}, ${newVal}`);
		if (attrName === "taskid" && oldVal !== newVal) {
			this.taskId = newVal;
			logger.info(`Task selected: ${this.taskId}`);
			this.validateAndSwitchImage(this.taskId);
		}
	}

}

window.customElements.define("desktop-vis-queue", visualQueue);
