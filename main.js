import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base'
import { ConfigFields } from './src/config.js'
import { getActions } from './src/actions.js'
import { getFeedbacks } from './src/feedbacks.js'
import { getPresets } from './src/presets.js'
import { getVariableDefinitions } from './src/variables.js'
import { initTCP } from './src/api.js'


class ChristieInstance extends InstanceBase {
	
	constructor(internal) {
		super(internal)

		this.login = false;
	}

// https://github.com/bitfocus/companion-module-generic-pjlink/blob/master/pjlink.js has a good structure
// and https://github.com/bitfocus/companion-module-malighting-grandma2/blob/master/grandma2.js for telnet use


	async init(config) {
		this.startup(config);
	}

	startup(config) {
		this.config = config;
		this.login = false;
		this.projectorStatus = "";
		//this.heartbeatTime = 10;
		//this.heartbeatInterval = null;

		this.getConfigFields();
		this.updateActions();
		this.updateFeedbacks();
		this.updateVariableDefinitions();
		this.updatePresets();
		initTCP(this);
	}

	destroy() {
		// destroy stuff
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.poll_interval !== undefined) {
			clearInterval(this.poll_interval)
			delete this.poll_interval
		}

		if (this.socketTimer) {
			clearInterval(this.socketTimer)
			delete this.socketTimer
		}
	}

	async configUpdated(config) {
		this.destroy();
		this.startup(config);
	}

	// Return config fields for web config
	getConfigFields() {
		return ConfigFields(this);
	}

	updateActions() {
		this.setActionDefinitions(getActions(this));		
	}

	updateFeedbacks() {
		this.setFeedbackDefinitions(getFeedbacks(this));
	}

	updateVariableDefinitions() {
		this.setVariableDefinitions(getVariableDefinitions(this));
	}

	updatePresets() {
		this.setPresetDefinitions(getPresets(this));
	}

}

runEntrypoint(ChristieInstance, [])
