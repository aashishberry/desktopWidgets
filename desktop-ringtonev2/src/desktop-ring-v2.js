import { Desktop } from '@wxcc-desktop/sdk';

const logger = Desktop.logger.createLogger('desktop-ring-v2');

class desktopRingV2 extends HTMLElement {
  // Get Attributes
  static get observedAttributes() {
		return ['darkmode'];
	}
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isDarkMode = this.getAttribute('darkmode') === 'true';
  }

  createInteractionSection(index, config) {
    const section = document.createDocumentFragment();

    // Label
    const label = document.createElement('md-label');
    label.setAttribute('label', config.label);
    label.setAttribute('active', true);
    label.style.paddingBottom = '6px';
    section.appendChild(label);

    // Combobox
    const combobox = document.createElement('md-combobox');
    combobox.id = `list-${index}`;
    combobox.style.width = '300px';
    combobox.setAttribute('placeholder', config.placeholder);
    combobox.setAttribute('options', JSON.stringify(config.items));
    combobox.setAttribute('no-clear-icon', true);
    combobox.setAttribute('newMomentum', true);
    combobox.style.paddingBottom = '18px';
    combobox.addEventListener('change-selected', (e) => this.changeAudioSelection(e, index));
    section.appendChild(combobox);

    // Volume Container
    const volumeContainer = document.createElement('div');
    volumeContainer.style.display = 'flex';

    // Volume Slider
    const volumeSlider = document.createElement('md-slider');
    volumeSlider.setAttribute('id', `notification-volume-${index}`);
    volumeSlider.setAttribute('min', '0');
    volumeSlider.setAttribute('max', '100');
    volumeSlider.setAttribute('hide-value', true);
    volumeSlider.setAttribute('text', '0');
    volumeSlider.setAttribute('label', 'volume-slider');
    volumeSlider.style.width = '240px';
    volumeSlider.style.marginTop = '-20px';
    volumeSlider.addEventListener('slider-change', (e) => this.changeVolume(e, index));
    volumeContainer.appendChild(volumeSlider);

    // Speaker/Mute Button
    const speakerButton = document.createElement('md-button');
    speakerButton.setAttribute('id', `speaker-button-${index}`);
    speakerButton.style.marginLeft = '10px';
    speakerButton.setAttribute('circle', true);
    speakerButton.setAttribute('color', 'color-none');
    speakerButton.setAttribute('size', '20');
    speakerButton.addEventListener('click', () => this.muteVolume(index));

    const speakerIcon = document.createElement('md-icon');
    speakerIcon.setAttribute('id', `speaker-icon-${index}`);
    speakerIcon.setAttribute('name', 'icon-speaker_16');
    speakerIcon.setAttribute('size', '16');
    speakerButton.appendChild(speakerIcon);
    volumeContainer.appendChild(speakerButton);

    // Play Button
    const playButton = document.createElement('md-button');
    playButton.setAttribute('id', `mute-button-${index}`);
    playButton.style.marginLeft = '10px';
    playButton.setAttribute('circle', true);
    playButton.setAttribute('color', 'color-none');
    playButton.setAttribute('size', '20');
    playButton.addEventListener('click', () => this.playButton(index));

    const playIcon = document.createElement('md-icon');
    playIcon.setAttribute('id', `play-icon-${index}`);
    playIcon.setAttribute('name', 'icon-play_16');
    playIcon.setAttribute('size', '16');
    playButton.appendChild(playIcon);
    volumeContainer.appendChild(playButton);

    section.appendChild(volumeContainer);
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
		header.setAttribute('label', 'Select Notification Sound.');
    header.setAttribute('active', true);
    header.style.fontWeight = 'bold';
    header.style.paddingBottom = '18px';

		widgetContainer.appendChild(header);

    const vItems = [
      "Ascent",
      "Calculation",
      "ClassicRinger",
      "Delight",
      "Evolve",
      "Mellow",
      "Mischief",
      "Playful",
      "Reflections",
      "Ripples",
      "Sunrise",
      "Vibes"
    ];

    const dItems = [
      "Beep",
      "Bounce",
      "Calculation",
      "Cute",
      "Drop",
      "Evolve",
      "Idea",
      "Nimba",
      "Open",
      "Snap",
      "Tick",
      "Vibes"
    ];

    this.volumeSelection = {
      "voice": 75,
      "digital": 75
    }

    this.audioSelection = {
      "voice": this.voiceTones?.[0] || "",
      "digital": this.digitalTones?.[0] || ""
    }

    this.muteSelection = {
      "voice": false,
      "digital": false
    }

    // Create combobox, slider and buttons
    // -----------------------------------
    const interactionConfigs = [
      { label: 'Voice Interactions...', placeholder: 'Voice Interaction Sounds...', items: this.voiceTones },
      { label: 'Digital Interactions...', placeholder: 'Digital Interaction Sounds...', items: this.digitalTones }
    ];

    interactionConfigs.forEach((config, i) => {
      widgetContainer.appendChild(this.createInteractionSection(i, config));
    });



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
    this.deviceListBox.setAttribute('no-clear-icon', true);
    this.deviceListBox.setAttribute('newMomentum', true);
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
    iconElement.setAttribute('name', 'adjust-audio-bold');
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
    tooltip.setAttribute('message', 'Notification Sound');
    tooltip.setAttribute('placement', 'bottom');
    tooltip.appendChild(widgetButton);

    this.shadowRoot.appendChild(tooltip);
    this.shadowRoot.appendChild(widgetContainer);
  }

  async init() {
    Desktop.config.init({widgetName: "desktop-ring-v2", widgetProvider: "Aashish (aaberry)"});
    logger.info(`Ringer URL: ${this.ringerUrl}`);
    logger.info(`Audio files available: Voice ${this.voiceTones.length}, ${this.voiceTones}, Digital ${this.digitalTones.length}, ${this.digitalTones}`);
    this.render();
  }

  connectedCallback() {
    logger.info('Connected listener.');
    this.init();
    this.retrievePreferences();
    this.listAudioDevices();
    navigator.mediaDevices.addEventListener('devicechange', (e) => this.updateAudioDevices(e));
    this.agentInteractionEvents();
  }

  disconnectedCallback() {
    navigator.mediaDevices.removeEventListener('devicechange', (e) => this.updateAudioDevices(e));
    Desktop.agentContact.removeAllEventListeners();
    this.stopAudio();
  }

  updateAudioDevices(event) {
    if (event.type === 'devicechange') {
      logger.info("List of audio devices update event");
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
        this.stopAudio();
        logger.info(`Selected audio device Id: ${this.selectedDeviceId}`);
        this.savePreferences();
      } else {
        logger.warn(`Device not found: ${e.detail.selected}`);
      }
    } catch (error) {
      logger.error('Failed to change device:', error);
    }
  }

  changeAudioSelection(e, i) {
    const channel = i === 0 ? 'voice' : 'digital';
    this.audioSelection[channel] = String(e.detail.selected);
    logger.info(`Audio file selection: ${channel}, ${this.audioSelection[channel]}`);
    this.stopAudio();
    this.savePreferences();
  }

  changeVolume(e, i) {
    const channel = i === 0 ? 'voice' : 'digital';
    this.volumeSelection[channel] = e.detail.value;
    logger.info(`Volume selection: ${channel}, ${e.detail.value}`);
    
		if (this.audio && this.audio.src.includes(this.audioSelection[channel])) {
      this.audio.volume = this.volumeSelection[channel] / 100;
      logger.info("Updated volume for:", channel, this.audio.volume);
    }
    this.savePreferences();
	}

  muteVolume(i) {
    const channel = i === 0 ? 'voice' : 'digital';
    this.muteSelection[channel] = !this.muteSelection[channel];
    const isMuted = this.muteSelection[channel];
    
    logger.info(`Mute option: ${channel}, ${isMuted}`);

    const volumeSlider = this.shadowRoot.getElementById(`notification-volume-${i}`);
    isMuted ? volumeSlider.setAttribute('disabled', true) : volumeSlider.removeAttribute('disabled');
    
    const speakerIcon = this.shadowRoot.getElementById(`speaker-icon-${i}`);
    speakerIcon.setAttribute('name', isMuted ? 'icon-speaker-muted_16' : 'icon-speaker_16');

    if (this.audio && this.audio.src.includes(this.audioSelection[channel])) {
      this.audio.volume = isMuted ? 0 : this.volumeSelection[channel] / 100;
    }
    
    this.savePreferences();
  }

  playButton(i) {
    if (!this.audio && !Object.values(this.muteSelection)[i]) {
      this.playAudio(i);
      const playIcon = this.shadowRoot.getElementById(`play-icon-${i}`);
      playIcon.setAttribute('name', 'icon-stop_16');
    }
    else {
      this.stopAudio();
    }
  }

  stopAudio() {
		if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
			this.audio.removeEventListener('ended', this.audioEndedHandler);
      this.audio = null;
      const playIcon0 = this.shadowRoot.getElementById(`play-icon-0`);
      const playIcon1 = this.shadowRoot.getElementById(`play-icon-1`);
      if (playIcon0) playIcon0.setAttribute('name', 'icon-play_16');
      if (playIcon1) playIcon1.setAttribute('name', 'icon-play_16');
		}
	}

  playAudio(i) {
    logger.info(`Play audio: ${Object.keys(this.audioSelection)[i]}, ${Object.values(this.audioSelection)[i]}`);
    
    const audioFile = Object.values(this.audioSelection)[i];
    if (!audioFile) {
      logger.warn('No audio file selected');
      return;
    }
    
    this.audio = new Audio(this.ringerUrl + audioFile + ".mp3");
    Object.values(this.muteSelection)[i] === true ? this.audio.volume = 0 : this.audio.volume = Object.values(this.volumeSelection)[i] / 100;
    
    // Store handler reference for cleanup
    this.audioEndedHandler = () => {
      if (this.audio) {
        this.audio.currentTime = 0;
        this.audio.play().catch(err => logger.error('Audio play error:', err));
      }
    };
    
    this.audio.addEventListener('ended', this.audioEndedHandler);
    
    // Set audio output device with error handling
    if (this.selectedDeviceId && typeof this.audio.setSinkId === 'function') {
      this.audio.setSinkId(this.selectedDeviceId).catch(err => {
        logger.warn(`Failed to set audio output device: ${err.message}`);
      });
    }
    
    this.audio.play().catch(err => {
      logger.error('Failed to play audio:', err);
      this.stopAudio();
    });
  }

  savePreferences() {
    let jsonPreference = JSON.stringify({
    volume: JSON.stringify(this.volumeSelection), 
    mute: JSON.stringify(this.muteSelection), 
    audio: JSON.stringify(this.audioSelection),
    device: this.selectedDeviceId
    });

    logger.info(`Updated preferences: ${jsonPreference}`);
		localStorage.setItem('desktopRingV2', jsonPreference);
  }

  restoreUIState(index, channel, audioValue, volumeValue, muteValue) {
    const combobox = this.shadowRoot.getElementById(`list-${index}`);
    if (combobox && audioValue) {
      combobox.setAttribute('value', JSON.stringify([audioValue]));
      logger.info(`Restored audio selection [${channel}]: ${audioValue}`);
    }
    
    const volumeSlider = this.shadowRoot.getElementById(`notification-volume-${index}`);
    if (volumeSlider && volumeValue !== undefined && volumeValue !== '') {
      volumeSlider.setAttribute('now', volumeValue);
      logger.info(`Restored volume selection [${channel}]: ${volumeValue}`);
      
      if (muteValue) {
        volumeSlider.setAttribute('disabled', true);
      }
    }
    
    const speakerIcon = this.shadowRoot.getElementById(`speaker-icon-${index}`);
    if (speakerIcon) {
      speakerIcon.setAttribute('name', muteValue ? 'icon-speaker-muted_16' : 'icon-speaker_16');
      logger.info(`Restored mute selection [${channel}]: ${muteValue}`);
    }
  }

  retrievePreferences() {
    // Retrieve Preferences from storage
    try {
      const storedData = localStorage.getItem('desktopRingV2');
      if (!storedData) {
        logger.info('No stored preferences found, using defaults');
        // Apply defaults to UI when no preferences found
      } else {
        const retrievedPreferences = JSON.parse(storedData);
        
        // Validate and parse preferences
        if (retrievedPreferences.audio) {
          this.audioSelection = JSON.parse(retrievedPreferences.audio);
        }
        if (retrievedPreferences.volume) {
          this.volumeSelection = JSON.parse(retrievedPreferences.volume);
        }
        if (retrievedPreferences.mute) {
          this.muteSelection = JSON.parse(retrievedPreferences.mute);
        }
        if (retrievedPreferences.device) {
          this.selectedDeviceId = retrievedPreferences.device;
        }

        logger.info(`Retrieved Preferences: audio=${JSON.stringify(this.audioSelection)}, volume=${JSON.stringify(this.volumeSelection)}, mute=${JSON.stringify(this.muteSelection)}, device=${this.selectedDeviceId}`);
      }
      
      // Restore UI state for both channels
      const channels = ['voice', 'digital'];
      channels.forEach((channel, i) => {
        this.restoreUIState(
          i,
          channel,
          this.audioSelection[channel],
          this.volumeSelection[channel],
          this.muteSelection[channel]
        );
      });
    } catch (error) {
      logger.error('Failed to retrieve preferences:', error);
      // Reset to defaults on error
      this.audioSelection = { "voice": this.voiceTones?.[0] || "", "digital": this.digitalTones?.[0] || "" };
      this.volumeSelection = { "voice": 75, "digital": 75 };
      this.muteSelection = { "voice": false, "digital": false };
      
      // Apply defaults to UI after error
      const channels = ['voice', 'digital'];
      channels.forEach((channel, i) => {
        this.restoreUIState(
          i,
          channel,
          this.audioSelection[channel],
          this.volumeSelection[channel],
          this.muteSelection[channel]
        );
      });
    }
  }

  agentInteractionEvents() {
		Desktop.agentContact.addEventListener("eAgentOfferContact", (e => {
      logger.info(`Call data: ${JSON.stringify(e)}`);
      if (e.data.interaction.mediaType === 'telephony') {
				logger.info(`Ring playback on Telephony channel`);
        this.playAudio(0);
      }
      else if (e.data.interaction.mediaType !== 'telephony') {
        logger.info(`Ring playback on non-Telephony channel`);
        this.playAudio(1);
      }
		}));

		Desktop.agentContact.addEventListener("eAgentContactAssigned", (e => {
			logger.info("Stop Ringtone as contact assigned");
      this.stopAudio();
		}));
		Desktop.agentContact.addEventListener("eAgentOfferContactRona", (e => {
			logger.info("Stop Ringtone as contact is RONA");
      this.stopAudio();
		}));
		Desktop.agentContact.addEventListener("eAgentContactEnded", (e => {
      this.stopAudio();
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

customElements.define('desktop-ring-v2', desktopRingV2);
