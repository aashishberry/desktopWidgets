import { Desktop } from '@wxcc-desktop/sdk';
//import "@momentum-ui/web-components";
const logger = Desktop.logger.createLogger('desktop-agent-announcement');

class desktopAgentAnnouncement extends HTMLElement {
  // Get Attributes
  static get observedAttributes() {
		return ['darkmode'];
	}
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isDarkMode = this.getAttribute('darkmode') === 'true';
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
		header.setAttribute('label', 'New Interaction Announcement');
    header.setAttribute('active', true);
    header.style.fontWeight = 'bold';
    header.style.paddingBottom = '18px';

		widgetContainer.appendChild(header);

    // Voice Interactions

    /*this.voiceSelection = {
      "voice": ""
    }*/

    //Object.values(this.audioSelection)[0];

    // Create combobox, slider and buttons
    // -----------------------------------

    const voiceLabel = document.createElement('md-label');
    voiceLabel.setAttribute('label', 'Available Voices...');
    voiceLabel.setAttribute('active', true);
    voiceLabel.style.paddingBottom = '6px';

    widgetContainer.appendChild(voiceLabel);


    const voiceMain = document.createElement('md-combobox');
    voiceMain.id = `list-voices`;
    voiceMain.style.width = '300px';
    voiceMain.setAttribute('placeholder', 'Select a local voice...');
    voiceMain.setAttribute('newMomentum', true);
    voiceMain.setAttribute('no-clear-icon', true);
    voiceMain.style.paddingBottom = '18px';
    voiceMain.addEventListener('change-selected', (e) => this.changeVoiceSelection(e));

    widgetContainer.appendChild(voiceMain);

    // Volume Slider & Buttons
    // -----------------------

    const volumeContainer = document.createElement('div');
    volumeContainer.style.display = 'flex';

    const volumeSlider = document.createElement('md-slider');
    volumeSlider.setAttribute('id', `notification-volume`);
    volumeSlider.setAttribute('min', '0');
    volumeSlider.setAttribute('max', '100');
    volumeSlider.setAttribute('hide-value', true);
    volumeSlider.setAttribute('text', '0');
    volumeSlider.setAttribute('label', 'volume-slider');
    volumeSlider.style.width = '270px';
    volumeSlider.style.marginTop = '-20px';
    volumeSlider.addEventListener('slider-change', (e) => this.changeVolume(e));

    const speakerButton = document.createElement('md-button');
    speakerButton.setAttribute('id', `speaker-button`);
    speakerButton.style.marginLeft = '10px';
    speakerButton.setAttribute('circle', true);
    speakerButton.setAttribute('color', 'color-none');
    speakerButton.setAttribute('size', '20');
    speakerButton.addEventListener('click', () => this.muteVolume());

    const speakerIcon = document.createElement('md-icon');
    speakerIcon.setAttribute('id', `speaker-icon`);
    speakerIcon.setAttribute('name', 'icon-speaker_16');
    speakerIcon.setAttribute('size', '16');

    speakerButton.appendChild(speakerIcon);
    volumeContainer.appendChild(volumeSlider);
    volumeContainer.appendChild(speakerButton);


    // Input button for text to be read
    // --------------------------------

    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';

    const inputField = document.createElement('md-input');
    inputField.style.width = '270px';
    inputField.setAttribute('id', 'input-field');
    inputField.setAttribute('containerSize', 'small-12');
    inputField.setAttribute('newMomentum', true);
    inputField.setAttribute('type', 'text');
    inputField.setAttribute('messageType', '0');
    inputField.setAttribute('placeholder', 'Enter Text');
    inputField.setAttribute('clear', true);
    inputField.addEventListener('input-change', (e) => this.inputTextChanged(e));


    const playButton = document.createElement('md-button');
    playButton.setAttribute('id', `play-button`);
    playButton.style.marginLeft = '10px';
    playButton.style.marginTop = '8px';
    playButton.setAttribute('circle', true);
    playButton.setAttribute('color', 'color-none');
    playButton.setAttribute('size', '20');
    playButton.addEventListener('click', () => this.playButton());

    const playIcon = document.createElement('md-icon');
    playIcon.setAttribute('id', `play-icon`);
    playIcon.setAttribute('name', 'icon-play_16');
    playIcon.setAttribute('size', '16');

    playButton.appendChild(playIcon);

    inputContainer.appendChild(inputField);
    inputContainer.appendChild(playButton);

    widgetContainer.appendChild(inputContainer);
    widgetContainer.appendChild(volumeContainer);

    
    // Pre select value if preferences are retrieved
    //voiceMain.setAttribute('selectedOptions', JSON.stringify(["Reflections"]));



    // Devices List
    // ------------
    const deviceLabel = document.createElement('md-label');
    deviceLabel.setAttribute('label', 'Output Device...');
    deviceLabel.setAttribute('active', true);
    deviceLabel.style.paddingBottom = '6px';

    widgetContainer.appendChild(deviceLabel);

    this.deviceListBox = document.createElement('md-combobox');
    this.deviceListBox.style.width = '300px';
    this.deviceListBox.setAttribute('placeholder', 'Audio Output Device...');
    this.deviceListBox.setAttribute('newMomentum', true);
    this.deviceListBox.setAttribute('no-clear-icon', true);
    this.deviceListBox.addEventListener('change-selected', (e) => this.changeDevice(e));

    widgetContainer.appendChild(this.deviceListBox);

    // Header icon
    // -----------
    const widgetButton = document.createElement('md-button');
    widgetButton.id = 'widget-button';
    widgetButton.setAttribute('circle', true);
    widgetButton.setAttribute('variant', 'ghost');
    widgetButton.setAttribute('size', '32');

		const iconElement = document.createElement('md-icon');
    iconElement.setAttribute('name', 'audio-broadcast-bold');
    iconElement.setAttribute('size', '20');
    iconElement.setAttribute('iconset', 'momentumDesign');

    widgetButton.appendChild(iconElement);

    
    widgetButton.addEventListener('click', () => {
      widgetContainer.style.display = (widgetContainer.style.display === 'none' || widgetContainer.style.display === '') ? 'flex' : 'none';
    });

    document.addEventListener('click', (event) => {
      if (!event.composedPath().includes(this)) {
        widgetContainer.style.display = 'none';
      }
    });

    const tooltip = document.createElement('md-tooltip');
    tooltip.setAttribute('message', 'Interaction Announcement');
    tooltip.setAttribute('placement', 'bottom');
    tooltip.appendChild(widgetButton);

    this.shadowRoot.appendChild(tooltip);
    this.shadowRoot.appendChild(widgetContainer);
  }

  async init() {
    Desktop.config.init({widgetName: "desktop-agent-announcement", widgetProvider: "Aashish (aaberry)"});
    this.render();
  }

  connectedCallback() {
    logger.info('Connected listener.');
    this.init();
    this.retrievePreferences();
    this.listAudioDevices();
    this.listVoices();
    navigator.mediaDevices.addEventListener('devicechange', (e) => this.updateAudioDevices(e));
    window.speechSynthesis.addEventListener('voiceschanged', (e) => this.updateVoices(e));
    this.agentInteractionEvents();
  }

  disconnectedCallback() {
    navigator.mediaDevices.removeEventListener('devicechange', (e) => this.updateAudioDevices(e));
    window.speechSynthesis.removeEventListener('voiceschanged', (e) => this.updateVoices(e));
    Desktop.agentContact.removeAllEventListeners();
    this.stopText();
  }

  updateVoices(event) {
    if (event.type === 'voiceschanged') {
      logger.info("List of available voices updated");
      this.listVoices();
    }
  }

  async listVoices() {
    const voices = window.speechSynthesis.getVoices().filter(voice => voice.localService === false);
    const useVoices = voices.map(voice => voice.name);
    logger.info(`Available voices: ${useVoices}`);
    
    const voiceMain = this.shadowRoot.getElementById(`list-voices`);
    if (voiceMain) {
      voiceMain.setAttribute('options', JSON.stringify(useVoices));
      
      const selectedVoice = voices.find(voice => voice.name === this.voiceSelection);
      if (selectedVoice) {
        voiceMain.setAttribute('value', JSON.stringify([selectedVoice.name]));
        logger.info(`Restored voice selection: ${selectedVoice.name}`);
      }
    }
  }

  updateAudioDevices(event) {
    if (event.type === 'devicechange') {
      logger.info("List of audio devices updated");
      this.listAudioDevices();
    }
  }

  async listAudioDevices() {
    logger.info(`Found audio devices list!`);
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audiooutput');
    const deviceList = audioDevices.map(device => {
      logger.info(`Name: ${device.label}, ID: ${device.deviceId}`);
      return device.label;
    });
    this.deviceListBox.setAttribute('options', JSON.stringify(deviceList));
    
    let selectedDevice = audioDevices.find(device => device.deviceId === this.selectedDeviceId);
    if (!selectedDevice) {
      selectedDevice = audioDevices.find(device => device.deviceId === "default");
      this.selectedDeviceId = selectedDevice?.deviceId;
      logger.info(`Selecting default audio output device: ${selectedDevice?.label}`);
    } else {
      logger.info(`Restored audio device selection: ${selectedDevice.label}`);
    }
    
    if (selectedDevice) {
      this.deviceListBox.setAttribute('value', JSON.stringify([selectedDevice.label]));
    }
  }


  async changeDevice(e) {
    logger.info(`Audio device selection change event: ${e.detail.selected}`);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audiooutput');
      const mediaDeviceInfo = audioDevices.find(deviceObject => deviceObject.label === String(e.detail.selected));
      
      if (mediaDeviceInfo) {
        this.selectedDeviceId = mediaDeviceInfo.deviceId;
        logger.info(`Selected audio device Id: ${this.selectedDeviceId}`);
        this.stopText();
        this.savePreferences();
      } else {
        logger.warn(`Device not found: ${e.detail.selected}`);
      }
    } catch (error) {
      logger.error('Failed to change device:', error);
    }
  }

  changeVoiceSelection(e) {
    this.voiceSelection = String(e.detail.selected);
    logger.info(`Voice selection updated: ${this.voiceSelection}`);

    const voices = window.speechSynthesis.getVoices().filter(voice => voice.localService === false);
    this.useVoice = voices.find(voice => voice.name === this.voiceSelection);
    
    if (this.useVoice) {
      logger.info(`Selecting voice: ${this.useVoice.name}`);
    } else {
      logger.warn(`Voice not found: ${this.voiceSelection}`);
    }
    
    this.stopText();
    this.savePreferences();
  }

  changeVolume(e) {
    logger.info(`Volume selection updated: ${e.detail.value}`);
    this.volumeSelection = e.detail.value;
    this.savePreferences();
	}

  muteVolume() {
    this.muteSelection = !this.muteSelection;
    logger.info(`Mute option updated: ${this.muteSelection}`);

    const volumeSlider = this.shadowRoot.getElementById(`notification-volume`);
    const speakerIcon = this.shadowRoot.getElementById(`speaker-icon`);
    
    if (volumeSlider) {
      this.muteSelection ? volumeSlider.setAttribute('disabled', true) : volumeSlider.removeAttribute('disabled');
    }
    if (speakerIcon) {
      speakerIcon.setAttribute('name', this.muteSelection ? 'icon-speaker-muted_16' : 'icon-speaker_16');
    }
    
    this.savePreferences();
    this.stopText();
  }

  playButton() {
    this.stopText();
    if (this.textDemo) {
      this.speakText(this.textDemo);
    } else {
      logger.warn('No text to speak');
    }
  }

  stopText() {
    window.speechSynthesis.cancel();
	}

  inputTextChanged(e) {
    logger.info(`Demo text updated: ${e.detail.value}`);
    this.textDemo = e.detail.value;
    this.savePreferences();
  }

  speakText(textString) {
    if (!textString) {
      logger.warn('No text provided to speak');
      return;
    }
    
    if (this.muteSelection === false) {
      try {
        this.speak = new SpeechSynthesisUtterance(textString);
        this.speak.voice = this.useVoice;
        this.speak.rate = 1.0;
        this.speak.volume = (this.volumeSelection || 70) / 100;
        logger.info(`About to speak: ${textString}, at volume: ${this.speak.volume}`);
        window.speechSynthesis.speak(this.speak);
        this.speak.onerror = (event) => {
          logger.error("Error during playback:", event.error);
        };
      } catch (error) {
        logger.error('Failed to speak text:', error);
      }
    }
  }

  savePreferences() {
    let jsonPreference = JSON.stringify({
    volume: this.volumeSelection, 
    mute: this.muteSelection, 
    voice: this.voiceSelection,
    text: this.textDemo,
    device: this.selectedDeviceId
    });

    logger.info(`Updated preferences: ${jsonPreference}`);
		localStorage.setItem('desktopAgentAnnouncement', jsonPreference);
  }

  retrievePreferences() {
    // Retrieve Preferences from storage
    try {
      const storedData = localStorage.getItem('desktopAgentAnnouncement');
      
      // Set defaults
      this.voiceSelection = 'Google US English';
      this.volumeSelection = 70;
      this.muteSelection = false;
      this.textDemo = 'Hello World! This is a demo announcement.';
      
      if (storedData) {
        const retrievedPreferences = JSON.parse(storedData);
        
        if (retrievedPreferences.voice) {
          this.voiceSelection = retrievedPreferences.voice;
        }
        if (retrievedPreferences.volume !== undefined) {
          this.volumeSelection = retrievedPreferences.volume;
        }
        if (retrievedPreferences.mute !== undefined) {
          this.muteSelection = retrievedPreferences.mute;
        }
        if (retrievedPreferences.device) {
          this.selectedDeviceId = retrievedPreferences.device;
        }
        if (retrievedPreferences.text) {
          this.textDemo = retrievedPreferences.text;
        }
        
        logger.info(`Retrieved Preferences: voice=${this.voiceSelection}, volume=${this.volumeSelection}, mute=${this.muteSelection}, device=${this.selectedDeviceId}`);
      } else {
        logger.info('No stored preferences found, using defaults');
      }
      
      // Apply to UI
      const volumeSlider = this.shadowRoot.getElementById(`notification-volume`);
      if (volumeSlider) {
        volumeSlider.setAttribute('now', this.volumeSelection);
        if (this.muteSelection) {
          volumeSlider.setAttribute('disabled', true);
        }
      }
      
      const speakerIcon = this.shadowRoot.getElementById(`speaker-icon`);
      if (speakerIcon) {
        speakerIcon.setAttribute('name', this.muteSelection ? 'icon-speaker-muted_16' : 'icon-speaker_16');
      }

      const inputField = this.shadowRoot.getElementById(`input-field`);
      if (inputField && this.textDemo) {
        inputField.setAttribute('value', this.textDemo);
      }
    } catch (error) {
      logger.error('Failed to retrieve preferences:', error);
      // Set safe defaults on error
      this.volumeSelection = 70;
      this.muteSelection = false;
      this.textDemo = 'Hello World! This is a demo announcement.';
    }
  }

  agentInteractionEvents() {
		Desktop.agentContact.addEventListener("eAgentOfferContact", (e => {
      logger.info(`Call data: ${JSON.stringify(e)}`);
      const callData = e.data.interaction.callProcessingDetails;
      const interactionData = e.data.interaction.callAssociatedData;
			const skipValues = this.skipValuesFor;
      logger.info(`Call associated data: ${JSON.stringify(interactionData)}`);
			logger.info(`Call processing data: ${JSON.stringify(callData)}`);
      logger.info(`Values to be skipped for: ${skipValues}`);
      let textString;
			
      if (e.data.interaction.mediaType === 'telephony' && e.data.interaction.contactDirection.type === 'INBOUND') {
        const desktopView = JSON.parse(callData["fcDesktopView"]);
        logger.info(`Desktop View: ${JSON.stringify(desktopView)}`);
				const popoverValues = desktopView["pop-over"].map(item => item.name);
				const filteredValues = popoverValues.filter(element => !skipValues.includes(element));
        logger.info(`Filtered values to be read: ${filteredValues}`);

        this.preAnnounce ? textString = this.preAnnounce : textString = "Hey! You have new incoming call... ";
				for (const each of filteredValues) {
					textString = textString + each + " is " + interactionData[each].value + ". ";
				}

				logger.info(`Playback for telephony channel: ${textString}`);
      }

      else if (e.data.interaction.mediaType !== 'telephony') {
				const popoverValues = Object.keys(interactionData);
				const filteredValues = popoverValues.filter(element => !skipValues.includes(element));

        this.preAnnounce ? textString = this.preAnnounce : textString = `Hey! You have new incoming ${e.data.interaction.mediaType}! `;
				for (const each of filteredValues) {
					textString = textString + interactionData[each].displayName + " is " + interactionData[each].value + ". ";
				}

        logger.info(`Playback for non-telephony channel ${textString}`);
      }

      this.speakText(textString);

		}));

		Desktop.agentContact.addEventListener("eAgentContactAssigned", (e => {
			logger.info("Stop playback as contact assigned");
      this.stopText();
		}));
		Desktop.agentContact.addEventListener("eAgentOfferContactRona", (e => {
			logger.info("Stop playback as contact is RONA");
      this.stopText();
		}));
		Desktop.agentContact.addEventListener("eAgentContactEnded", (e => {
      this.stopText();
		}));
	}

  
  attributeChangedCallback(attrName, oldVal, newVal) {
		logger.info(`Attribute ${attrName} has changed, ${oldVal}, ${newVal}`);
    if (attrName === "darkmode") {
			this.isDarkMode = newVal === "true";
      const widgetContainer = this.shadowRoot.querySelector(".container");
      if (widgetContainer) {
        widgetContainer.style.backgroundColor = this.isDarkMode ? "#1C1C1C" : "#FFFFFF";
      }
      // If container doesn't exist yet, it will be applied during render()
		}
	}
}

customElements.define('desktop-agent-announcement', desktopAgentAnnouncement);
