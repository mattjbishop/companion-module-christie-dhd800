import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base';
import { ConfigFields } from './src/config.js';
import { getActions } from './src/actions.js';
import { getFeedbacks } from './src/feedbacks.js';
import { getPresets } from './src/presets.js';
import { getVariableDefinitions } from './src/variables.js';
import { initTCP } from './src/api.js';

class ChristieInstance extends InstanceBase {
	constructor(internal) {
		super(internal);
	}

	async init(config) {
		this.startup(config);
	}

	startup(config) {
		// reset everything
		this.config = config;
		this.login = false;
		this.projectorStatus = '';
		this.pollingInterval = null;

		// setup everything
		this.getConfigFields();
		this.updateActions();
		this.updateFeedbacks();
		this.updateVariableDefinitions();
		this.updatePresets();

		// start the telnet connection
		initTCP(this);
	}

	destroy() {
		// destroy the telnet connection
		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		// destroy the retry timer
		if (this.socketTimer) {
			clearInterval(this.socketTimer);
			delete this.socketTimer;
		}

		// destroy the status update polling
		if (this.pollingInterval !== undefined) {
			clearInterval(this.pollingInterval);
			delete this.pollingInterval;
		}
	}

	// update the config
	async configUpdated(config) {
		this.destroy();
		this.startup(config);
	}

	// get the configuration fields for the companion web interface
	getConfigFields() {
		return ConfigFields;
	}

	// Set the action definitions
	updateActions() {
		this.setActionDefinitions(getActions(this));
	}

	// Set the feedback definitions
	updateFeedbacks() {
		this.setFeedbackDefinitions(getFeedbacks(this));
	}

	// set the variable defintions
	updateVariableDefinitions() {
		this.setVariableDefinitions(getVariableDefinitions(this));
	}

	// set the preset definitions
	updatePresets() {
		this.setPresetDefinitions(getPresets(this));
	}

	// update the status of the projector. This will update the related variables and
	// then nudge the relevant feedbacks
	updateProjectorStatus(updatedStatus) {
		this.projectorStatus = updatedStatus;
		this.log('info', 'Projector status updated to ' + updatedStatus);
		this.checkFeedbacks('status');
		this.checkFeedbacks('simple_state');
		this.setVariableValues({ status: updatedStatus });
	}
}

runEntrypoint(ChristieInstance, []);
