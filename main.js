import { InstanceBase, InstanceStatus, runEntrypoint, TelnetHelper } from '@companion-module/base'
import { ConfigFields } from './src/config.js'
import { getActionDefinitions } from './src/actions.js'

class ChristieInstance extends InstanceBase {
	
	constructor(internal) {
		super(internal)
	}

// https://github.com/bitfocus/companion-module-generic-pjlink/blob/master/pjlink.js has a good structure
// and https://github.com/bitfocus/companion-module-malighting-grandma2/blob/master/grandma2.js for telnet use


	async init(config) {
		this.config = config

		this.setActionDefinitions(getActionDefinitions(this))

		await this.configUpdated(config)
	}

	async configUpdated(config) {
		// destroy any open socket

		this.config = config

		// run startup actions 
	}

	async destroy() {
		// destroy stuff
	}

	// Return config fields for web config
	getConfigFields() {
		return ConfigFields
	}

	updateActions() {
		//
	}

	updateFeedbacks() {
		//
	}

	updateVariableDefinitions() {
		//
	}

	updatePresets() {
		//
	}

}

runEntrypoint(ChristieInstance, [])
