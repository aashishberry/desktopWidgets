import { Desktop } from '@wxcc-desktop/sdk';
//import "@momentum-ui/web-components";
const logger = Desktop.logger.createLogger('desktop-update-variable');

class desktopUpdateVariable extends HTMLElement {
  // Get Attributes
  static get observedAttributes() {
		return ['taskid', 'darkmode', 'tasktype'];
	}
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isDarkMode = this.getAttribute('darkmode') === 'true';
    this.menus = [];
    this.headers = [];
    this.taskType = null;
  }

  createCadVariableSection(index, cadVariable, variableList) {
    const section = document.createDocumentFragment();

    // Label
    const header = document.createElement('md-label');
    header.setAttribute('label', `Variable ${cadVariable}:`);
    header.style.marginBottom = '10px';
    section.appendChild(header);

    // Combobox
    const menu = document.createElement('md-combobox');
    menu.style.marginBottom = '20px';
    menu.setAttribute('id', `menu${index}`);
    menu.setAttribute('placeholder', `Select ${cadVariable} values here...`);
    menu.setAttribute('newMomentum', true);
    menu.setAttribute('options', JSON.stringify(variableList));
    menu.setAttribute('is-multi', true);
    menu.setAttribute('show-selected-count', true);
    menu.setAttribute('allow-select-all', true);
    menu.addEventListener('change-selected', (e) => this.comboBoxChangedEvent(e, index));
    section.appendChild(menu);

    // Store references for later use
    this.headers[index] = header;
    this.menus[index] = menu;

    return section;
  }

  render() {
    // Create main container
    const widgetContainer = document.createElement('div');
		widgetContainer.className = 'container';
    const backgroundColor = this.isDarkMode ? '#1C1C1C' : 'white';
    widgetContainer.innerHTML = `
      <style>
        .container {
          width: 300px;
          top: 70px;
          background-color: ${backgroundColor};
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          display: none;
          flex-direction: column;
          align-items: flex-start;
          position: absolute;
        }
      </style>
    `;

    const header = document.createElement('md-label');
		header.setAttribute('label', 'Update CAD Variable!');
    header.setAttribute('active', true);
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '18px';

		widgetContainer.appendChild(header);

    // Dynamic Menu
    this.dynamicMenu = document.createElement('div');
    this.dynamicMenu.style.width = '300px';
    this.dynamicMenu.style.display = 'grid';
    
    widgetContainer.appendChild(this.dynamicMenu);

    // Update Cad Button
    const updateButton = document.createElement('md-button');
		updateButton.textContent = 'Update';
    updateButton.setAttribute('variant', 'primary');
    updateButton.setAttribute('role', 'button');
		updateButton.addEventListener('click', () => this.updateCad());

    widgetContainer.appendChild(updateButton);


    // Header Icon
    this.widgetButton = document.createElement('md-button');
    this.widgetButton.id = 'widget-button';
    this.widgetButton.setAttribute('circle', true);
    this.widgetButton.setAttribute('variant', 'ghost');
    this.widgetButton.setAttribute('size', '32');

		const iconElement = document.createElement('md-icon');
    iconElement.setAttribute('name', 'filter-circle-bold');
    iconElement.setAttribute('size', '20');
    iconElement.setAttribute('iconset', 'momentumDesign');

    this.widgetButton.appendChild(iconElement);
    
    this.widgetButton.addEventListener('click', () => {
      widgetContainer.style.display = (widgetContainer.style.display === 'none' || widgetContainer.style.display === '') ? 'flex' : 'none';
    });

    document.addEventListener('click', (event) => {
      if (!event.composedPath().includes(this)) {
        widgetContainer.style.display = 'none';
      }
    });

    const tooltip = document.createElement('md-tooltip');
    tooltip.setAttribute('message', 'Update Interaction Variables');
    tooltip.setAttribute('placement', 'bottom');
    tooltip.appendChild(this.widgetButton);

    this.shadowRoot.appendChild(tooltip);
    this.shadowRoot.appendChild(widgetContainer);
  }

  connectedCallback() {
    logger.info("Got connected event! Adding listeners!");
    this.init();
    this.identifyProperties();
    this.updateCadVariableContainer();
  }

  disconnectedCallback() {
    logger.info("Got disconnected event! Removing Listeners!");
  }

  async init() {
    Desktop.config.init({widgetName: "desktop-update-variable", widgetProvider: "Aashish (aaberry)"});
    this.render();
    this.payLoad = {};
    
    // Apply tasktype visibility if it was set before render
    this.updateButtonVisibility();
  }

  identifyProperties() {
		try {
			const readVariables = Object.keys(this).filter(properties => properties.startsWith('cadVariable'));
			logger.info(`Variables from layout: ${readVariables}`);
			this.countVariables = readVariables.length;

			for (let i = 0; i < readVariables.length; i++) {
				logger.info(`Read Properties: ${this[`cadVariable${i}`]}, ${this[`variableList${i}`]}`);
			}
		} catch (error) {
			logger.error('Failed to identify properties:', error);
			this.countVariables = 0;
		}
	}

  updateCadVariableContainer() {
    if (!this.dynamicMenu) {
      logger.error('Dynamic menu container not found');
      return;
    }

    try {
      for (let i = 0; i < this.countVariables; i++) {
        const cadVariable = this[`cadVariable${i}`];
        const variableList = this[`variableList${i}`];
        
        const section = this.createCadVariableSection(i, cadVariable, variableList);
        this.dynamicMenu.appendChild(section);
      }
    } catch (error) {
      logger.error('Failed to create CAD variable containers:', error);
    }
  }

  updateButtonVisibility() {
    if (this.widgetButton && this.taskType !== null) {
      this.widgetButton.style.display = this.taskType === "true" ? 'flex' : 'none';
      logger.info(`Setting button visibility - tasktype: ${this.taskType}, display: ${this.widgetButton.style.display}`);
    } else {
      logger.info(`Cannot update visibility - widgetButton: ${!!this.widgetButton}, taskType: ${this.taskType}`);
    }
  }

  comboBoxChangedEvent(e, i) {
    const cadValues = e.detail.selected;
    const cadVariable = this[`cadVariable${i}`];
    logger.info(`Changed values ${cadValues} for ${cadVariable}`);
    this.preparePayload(cadVariable, cadValues);
  }

  preparePayload(cadVariable, cadValues) {
    this.payLoad[cadVariable] = cadValues ? cadValues.join(', ') : "";
    logger.info(`Payload: ${JSON.stringify(this.payLoad)}`);
  }

  async updateCad() {
    if (!this.taskId) {
      logger.warn('No task ID available for CAD update');
      return;
    }

    try {
      logger.info(`Updating CAD variables for task ${this.taskId}`);
      await Desktop.dialer.updateCadVariables({
        interactionId: this.taskId,
        data: {
          attributes: this.payLoad
        }
      });
      logger.info('CAD variables updated successfully');
    } catch (error) {
      logger.error('Failed to update CAD variables:', error);
    }
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
		logger.info(`Attribute ${attrName} has changed, ${oldVal}, ${newVal}, ${typeof newVal}`);
		
		if (attrName === "taskid" && oldVal !== newVal) {
			this.taskId = newVal;
      logger.info(`Task id from attribute: ${this.taskId}`);
      
      if (!this.taskId) {
        this.menus.forEach((menu, i) => {
          if (menu) {
            menu.dispatchEvent(new Event('remove-all-selected'));
            logger.info(`No active task, cleared menu${i}`);
          }
        });
        this.payLoad = {};
      }
		}

    if (attrName === "tasktype" && oldVal !== newVal) {
      this.taskType = newVal;
      this.updateButtonVisibility();
    }

    if (attrName === "darkmode") {
			this.isDarkMode = newVal === "true";
      const widgetContainer = this.shadowRoot.querySelector(".container");
      if (widgetContainer) {
        widgetContainer.style.backgroundColor = this.isDarkMode ? "#1C1C1C" : "#FFFFFF";
      }
		}
	}
}

customElements.define('desktop-update-variable', desktopUpdateVariable);
