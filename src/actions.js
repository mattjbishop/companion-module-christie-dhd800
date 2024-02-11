import { ExecutionCommmands, sendCommand } from './api.js';

export function getActions(self) {
	const actionDefs = {
		// power on the projector
		powerOn: {
			name: 'Power On',
			options: [],
			callback: async (event) => {
				let cmd = ExecutionCommmands.POWER_ON;
				sendCommand(cmd, self, true);
			},
		},

		// power off the projector
		powerOff: {
			name: 'Power Off',
			options: [],
			callback: async (event) => {
				let cmd = ExecutionCommmands.POWER_OFF;
				sendCommand(cmd, self, true);
			},
		},

		// mute the projector
		muteOn: {
			name: 'Video Mute On',
			options: [],
			callback: async (event) => {
				let cmd = ExecutionCommmands.VIDEO_MUTE_ON;
				sendCommand(cmd, self, true);
			},
		},

		// unmute the projector
		muteOff: {
			name: 'Video Mute Off',
			options: [],
			callback: async (event) => {
				let cmd = ExecutionCommmands.VIDEO_MUTE_OFF;
				sendCommand(cmd, self, true);
			},
		},
	};

	return actionDefs;
}
