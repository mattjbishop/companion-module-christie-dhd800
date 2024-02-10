import { PROJECTOR_STATUS } from "./api.js";

export const CHOICES_PROJECTORSTATUS = [
    { id: PROJECTOR_STATUS.ON, label: 'Projector On' },
    { id: PROJECTOR_STATUS.COOLING, label: 'Projector Cooling' },
    { id: PROJECTOR_STATUS.COUNTDOWN, label: 'Projector Counting Down' },
    { id: PROJECTOR_STATUS.STANDBY, label: 'Projector Standby' }
]