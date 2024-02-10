import { ExecutionCommmands, sendCommand } from './api.js';

export function getActions(self) {
	const actionDefs = {
		// power on the projector
		powerOn: {
			name: 'Power On',
			options: [],
			callback: async (event) => {
				let cmd = ExecutionCommmands.POWER_ON;
				self.log('debug', 'Power ON. Command is ' + cmd);
				sendCommand(cmd, self, true);
			},
		},

		// power off the projector
		powerOff: {
			name: 'Power Off',
			options: [],
			callback: async (event) => {
				let cmd = ExecutionCommmands.POWER_OFF;
				self.log('debug', 'Power OFF. Command is ' + cmd);
				sendCommand(cmd, self, true);
			},
		},
	};

	return actionDefs;
}
