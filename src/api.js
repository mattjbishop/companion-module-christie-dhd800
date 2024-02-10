import { InstanceStatus, TelnetHelper } from '@companion-module/base'

export const ExecutionCommmands = Object.freeze({
    POWER_ON: 'C00',
    POWER_OFF: 'C01',
    INPUT_1: 'C05',
    INPUT_2: 'C06',
    INPUT_3: 'C07',
    INPUT_4: 'C08',
    VIDEO_MUTE_ON: 'C0D',
    VIDEO_MUTE_OFF: 'C0E'
})

export const ReadCommands = Object.freeze({
    STATUS_READ: 'CR0',
    INPUT_MODE_READ: 'CR1',
    LAMP_TIME_READ: 'CR3',
    SETTING_READ: 'CR4',
    TEMP_READ: 'CR6',
    LAMP_MODE_READ: 'CR7'
})

export const PROJECTOR_STATUS = Object.freeze({
    ON: "On",
    COOLING: "Cooling",
    COUNTDOWN: "Wait",
    STANDBY: "Off"
})

const RETRY_INTERVAL = 10000;
const SEND_LINE_ENDING = '\r\n';
const TelnetSocket = TelnetHelper;


// Sets up the telnet connection with the projector and listens for incoming data
export function initTCP(self) {

    self.log('debug', 'initTCP called');

    let receivebuffer = '';

	if (self.socketTimer) {
        clearInterval(self.socketTimer);
        delete self.socketTimer;
    }

    if (self.pollingInterval) {
        clearInterval(self.pollingInterval);
        delete self.pollingInterval;
    }

    if (self.socket !== undefined) {
        self.socket.destroy();
        delete self.socket;
        self.login = false;
    }

    if (self.config.host) {
        self.socket = new TelnetSocket(self.config.host, self.config.port);

        self.socket.on('error', (err) => {
            self.log('error', 'Network error: ' + err.message);
            self.login = false;

            retry(self);
        })

        self.socket.on('connect', () => {
            self.updateStatus(InstanceStatus.Ok);
			self.log('debug',"yes, we are Connected");
            self.login = false;
        })

        self.socket.on('status_change', (status, message) => {
            if (status == 'ok' || status == 'connecting') {
                // ignore
            } else if (message == 'read ECONNRESET') {
                self.socket.emit('end');
            } else {
                self.log('debug', status + ' ' + message);
            }
        })

        self.socket.on('end', () => {
            self.log('error', 'Projector disconnected');
            self.login = false;
            
            self.updateStatus(InstanceStatus.Error, 'Disconnected');

            retry(self);
        })

        self.socket.on('data', (chunk) => {
            // this code is from generic-pjlink - it does what we tried to do in the wyrestorm module... :-)
            // separate buffered stream into lines with responses

            self.log('debug', `data: < ${chunk}`);

            let i = 0,
                line = '',
                offset = 0
            receivebuffer += chunk;
            while ((i = receivebuffer.indexOf('\r', offset)) !== -1) {
                line = receivebuffer.slice(offset, i);
                offset = i + 1;

                // if we have an [ack] then silently note it for now
                if (line.startsWith('\x06')) {
                    self.log('debug', 'got an ack');
                }

                self.socket?.emit('receiveline', line.toString());
            }
            receivebuffer = receivebuffer.slice(offset);
        })

        self.socket.on('receiveline', async (data) => {
            self.connect_time = Date.now();

            self.log('debug', `DHD800: < ${data}`)
            
            if (self.login === false && receivebuffer.match(/PASSWORD:/)){
                sendCommand(self.config.pass, self);
            } else if (self.login === false && data.match(/Hello/)){
                //Successful Login
                self.login = true;
                //self.status(self.STATUS_OK);
                self.log('info', 'Projector Login Successful.')
                sendCommand(ReadCommands.STATUS_READ, self); // get current status
    
                setupPollingInterval(self); // don't start polling until we know that we are logged in properly

            } else if (data.match (/00/)) {
                // Power On
                self.updateProjectorStatus(PROJECTOR_STATUS.ON);
            } else if (data.match (/20/)) {
                // Cooling
                self.updateProjectorStatus(PROJECTOR_STATUS.COOLING);
            } else if (data.match (/40/)) {
                // Countdown
                self.updateProjectorStatus(PROJECTOR_STATUS.COUNTDOWN);
            } else if (data.match (/80/)) {
                // Standby
                self.updateProjectorStatus(PROJECTOR_STATUS.STANDBY);
            } else if (data.match (/[?]/)) {
                // projector didn't like the command
                self.log('debug','unexpected response from projector');
            }
        })
    }
}

// Send a command to the projector
export function sendCommand(cmd, self, refreshStatus = false) {
    self.log('debug','sendCommand called: ' + cmd);
    if (cmd !== undefined) {	
        /*
            * create a binary buffer pre-encoded 'latin1' (8bit no change bytes)
            * sending a string assumes 'utf8' encoding
            * which then escapes character values over 0x7F
            * and destroys the 'binary' content
        */
        const sendBuf = Buffer.from(cmd + SEND_LINE_ENDING, 'latin1');

        self.log('debug','Sending: ' + cmd);
        if (self.socket !== undefined && self.socket.isConnected) {
            self.log('debug','sending to ' + self.config.host + ': ' + sendBuf.toString());
            self.socket.send(sendBuf);
            if (refreshStatus) {
                sendCommand(ReadCommands.STATUS_READ, self);
            }
        }
        else {
            self.log('debug','Socket not connected :(');
            retry(self);
        }
    }
}

// internal function to retry the connection every x seconds (normally 10s)
function retry(self) {
    // set timer to retry connection in 10 secs
    self.log('debug', 'Setting up to retry the connection');
    if (self.socketTimer) {
        clearInterval(self.socketTimer);
        delete self.socketTimer;
    }
    if (self.socket) {
        self.socket.destroy();
        delete self.socket;
    }
    self.socketTimer = setInterval( () => {
        self.updateStatus(InstanceStatus.Connecting, 'Retrying connection');
        initTCP(self);
    }, RETRY_INTERVAL)    
}

// internal function to set up the status polling
function setupPollingInterval(self) {
    if (self.pollingInterval !== null) {
        clearInterval(self.PollingInterval);
        self.pollingInterval = null;
    }

    if (!self.config.interval) {
        self.config.interval = 0;
    }

    self.config.interval = parseInt(self.config.interval);

    if (self.config.interval > 0) {
        self.log('info', `Starting Update Interval. Updating every ${self.config.interval}ms`);

        self.pollingInterval = setInterval( () => {
            self.log('debug', 'polling for projector status')
            sendCommand(ReadCommands.STATUS_READ, self);
        }, self.config.interval) 
    }
}