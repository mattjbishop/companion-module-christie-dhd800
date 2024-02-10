import { combineRgb } from "@companion-module/base";
import { PROJECTOR_STATUS } from "./api.js";
import { CHOICES_PROJECTORSTATUS } from "./choices.js";

export function getFeedbacks(self) {
	const feedbacks = {};

    // default colour values
    const COLOUR_WHITE = combineRgb(255, 255, 255);
	const COLOUR_BLACK = combineRgb(0, 0, 0);
	const COLOUR_RED = combineRgb(200, 0, 0);
	const COLOUR_GREEN = combineRgb(0, 200, 0);
	const COLOUR_ORANGE = combineRgb(255, 102, 0);
    const COLOUR_BLUE = combineRgb(0, 0, 255);
    
    // advanced projector status feedback
    feedbacks['status'] = {
        type: 'advanced',
        name: 'Current Projector Status',
        description: 'Change the style of the button based on the current status of the projector',
        options: [
            {
                type: 'colorpicker',
                label: 'Foreground colour (Standby)',
                id: 'fg',
                default: COLOUR_WHITE,
            },
            {
                type: 'colorpicker',
                label: 'Background colour (Standby)',
                id: 'bg',
                default: COLOUR_GREEN,
            },
            {
                type: 'colorpicker',
                label: 'Foreground colour (On)',
                id: 'fg_on',
                default: COLOUR_WHITE,
            },
            {
                type: 'colorpicker',
                label: 'Background colour (On)',
                id: 'bg_on',
                default: COLOUR_RED,
            },
            {
                type: 'colorpicker',
                label: 'Foreground colour (Cooling)',
                id: 'fg_cooling',
                default: COLOUR_WHITE,
            },
            {
                type: 'colorpicker',
                label: 'Background colour (Cooling)',
                id: 'bg_cooling',
                default: COLOUR_BLUE,
            },
            {
                type: 'colorpicker',
                label: 'Foreground colour (Countdown)',
                id: 'fg_countdown',
                default: COLOUR_WHITE,
            },
            {
                type: 'colorpicker',
                label: 'Background colour (Wait)',
                id: 'bg_countdown',
                default: COLOUR_ORANGE,
            },
        ],
        callback: (feedback) => {
            if (self.projectorStatus === PROJECTOR_STATUS.STANDBY) {
                return { color: feedback.options.fg, bgcolor: feedback.options.bg };
            } else if (self.projectorStatus === PROJECTOR_STATUS.ON) {
                return { color: feedback.options.fg_on, bgcolor: feedback.options.bg_on };
            } else if (self.projectorStatus === PROJECTOR_STATUS.COOLING) {
                return { color: feedback.options.fg_cooling, bgcolor: feedback.options.bg_cooling };
            } else if (self.projectorStatus === PROJECTOR_STATUS.COUNTDOWN) {
                return { color: feedback.options.fg_countdown, bgcolor: feedback.options.bg_countdown };
            } else {
                return {};
            }
        },
    }

    // boolean projector feedback
    feedbacks['simple_state'] = {
        name: 'Single Projector State',
        type: 'boolean',
        label: 'Projector State',
        description: 'Check for a particular projector state',
        defaultStyle: {
            bgcolor: COLOUR_GREEN,
            color: COLOUR_BLACK,
        },
        options: [
            {
				type: 'dropdown',
				label: 'State',
				id: 'state',
				default: CHOICES_PROJECTORSTATUS[0].id,
				choices: CHOICES_PROJECTORSTATUS,
			},
        ],
        callback: (feedback) => {
            let opt = feedback.options;
            return (opt.state === self.projectorStatus);
        },
    }

    return feedbacks;
}