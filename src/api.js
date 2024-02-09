import { InstanceStatus, TelnetHelper } from '@companion-module/base'

const TelnetSocket = TelnetHelper;

export function initTCP(self) {

    let receivebuffer = '';

	//if (self.socketTimer) {
     //   clearInterval(self.socketTimer);
      //  delete self.socketTimer;
    //}

    //if (self.poll_interval) {
    //    clearInterval(self.poll_interval);
    //    delete self.poll_interval;
    //}

    if (self.socket !== undefined) {
        self.socket.destroy();
        delete self.socket;
        self.login = false;
    }

    if (self.config.host) {
        self.socket = new TelnetSocket(self.config.host, 10000);

        self.socket.on('error', (err) => {
            self.log('error', 'Network error: ' + err.message);
            self.login = false;

            // set timer to retry connection in 10 secs
            if (self.socketTimer) {
                clearInterval(self.socketTimer);
                delete self.socketTimer;
            }
            if (self.socket) {
                self.socket.destroy();
                delete self.socket;
            }
            //self.socketTimer = setInterval( () => {
            //    self.updateStatus(InstanceStatus.Connecting, 'Retrying connection');
            //    self.init_tcp();
            //}, 10000)
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
            self.log('error', 'Console disconnected');
            self.login = false;
            
            self.updateStatus(InstanceStatus.Error, 'Disconnected');
            if (self.socket) {
                self.socket.destroy();
                delete self.socket;
            }
            // set timer to retry connection in 10 secs
            //if (self.socketTimer) {
            //    clearInterval(self.socketTimer);
            //    delete self.socketTimer;
            //}

            //self.socketTimer = setInterval( () => {
            //    self.updateStatus(InstanceStatus.Connecting, 'Retrying connection');
            //    self.init_tcp();
            //}, 10000)
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
                self.socket?.emit('receiveline', line.toString());
            }
            receivebuffer = receivebuffer.slice(offset);
        })

        self.socket.on('receiveline', async (data) => {
            self.connect_time = Date.now();

            self.log('debug', `DHD800: < ${data}`)
            
            if (self.login === false && receivebuffer.match(/PASSWORD:/)){
                self.socket.send(self.config.pass + '\r\n');
            } else if (self.login === false && data.match(/Hello/)){
                //Successful Login
                self.login = true;
                //self.status(self.STATUS_OK);
                self.log('info', 'Projector Login Successful.')
                self.socket.send("CR0\r\n"); // get current status
    
   //             self.heartbeatInterval = setInterval(
   //                 this.sendHeartbeatCommand.bind(this),
   //                 (this.heartbeatTime*1000)
   //             );
            } else if (data.match (/00/)) {
                // Power On
                self.projectorStatus = "ON";
                self.log('info', 'Projector ON');
                //this.checkFeedbacks('output_bg');
            } else if (data.match (/20/)) {
                // Cooling
                self.projectorStatus = "COOLING";
                self.log('info', 'Projector COOLING');
                //this.checkFeedbacks('output_bg');
            } else if (data.match (/40/)) {
                // Countdown
                self.projectorStatus = "WAIT";
                self.log('info', 'Projector COUNTDOWN');
                //this.checkFeedbacks('output_bg');
            } else if (data.match (/80/)) {
                // Standby
                self.projectorStatus = "STANDBY";
                self.log('info', 'Projector STANDBY');
                //this.checkFeedbacks('output_bg');
            }
        })
    }
}