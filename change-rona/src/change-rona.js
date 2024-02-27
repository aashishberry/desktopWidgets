import { Desktop } from '@wxcc-desktop/sdk';

const logger = Desktop.logger.createLogger('change-rona');

class changeRona extends HTMLElement {

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}
	
	connectedCallback() {
		this.init();
	}

	disconnectedCallback() {
		Desktop.agentContact.removeAllEventListeners();
		Desktop.agentStateInfo.removeAllEventListeners();
	}

	sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

	async init() {
		await this.sleep (5000);
		await Desktop.config.init({widgetName: "change-rona", widgetProvider: "Aashish (aaberry)"}); 
		if (this.delaySeconds) {
			logger.info(`Delay read from layout: ${this.delaySeconds} seconds.`);
			this.delaySeconds = this.delaySeconds * 1000;
		}
		else {
			this.delaySeconds = 10000;
			logger.info(`Delay unavailable in layout. Default 10 seconds.`);
		}
		this.agentInteractionEvents();
	}

	async agentInteractionEvents() {
		Desktop.agentContact.addEventListener("eAgentOfferContactRona", (e => {
			logger.info(`RONA triggered!`)
			this.triggerChange();
		}));
	}

	async triggerChange () {
		await this.sleep(this.delaySeconds);
		try {
			await Desktop.agentStateInfo.stateChange({
				state: 'Available',
				auxCodeIdArray: '0',
			});
			logger.info(`State changed to Available!`);
		}
		catch (error) {
			logger.error(error);
		}
	}

}

window.customElements.define("change-rona", changeRona);
