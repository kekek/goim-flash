(function(win) {
    var Client = function(options) {
        var MAX_CONNECT_TIME = 10;
        var DELAY = 15000;
        this.options = options || {};
        this.wsUrl = this.options.wsUrl || 'ws://localhost:8091/sub';
        this.flashUrl = this.options.Url || 'ws://localhost:10081/';
        this.createConnect(MAX_CONNECT_TIME, DELAY);
       
    }

    Client.prototype.createConnect = function(max, delay) {
        var self = this;
        if (max === 0) {
            return;
        }
        connect();

        var heartbeatInterval;

        function connect() {
            var url = self.wsUrl;
            if (win.WEB_SOCKET_FORCE_FLASH) {
                url = self.flashUrl;
            }

            var ws = new WebSocket(url);
            var auth = false;

            ws.onopen = function() {
                log('onopen');
                getAuth();
            }

            ws.onmessage = function(evt) {
                console.log("-----",evt)
                var receives = JSON.parse(evt.data)
                for(var i=0; i<receives.length; i++) {
                    var data = receives[i]
                    if (data.op == 8) {
                        auth = true;
                        heartbeat();
                        heartbeatInterval = setInterval(heartbeat, 4 * 60 * 1000);
                    }
                    if (!auth) {
                        setTimeout(getAuth, delay);
                    }
                    if (auth && data.op == 5) {
                        var notify = self.options.notify;
                        if(notify) notify(data.body);
                    }
                }
            }

            ws.onclose = function() {
                log("close");
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                setTimeout(reConnect, delay);
            }

            function heartbeat() {

                var authData = {
                    "isSubRoom": true,
                    "message_token": "2a302d1d26ec76ae5d892cbb8be1de01",
                    "origin": "ktkt",
                    "roomid": 1531468811,
                    "rtype": "vip",
                    "teacher_id": 1371765374235354,
                    "sina": "0",
                    "version":"1"
                }
                ws.send(JSON.stringify({
                    'ver': 1,
                    'op': 2,
                    'seq': 2,
                    'body': authData
                }));
                
            }

            function getAuth() {
                var authData = {
                    "isSubRoom": true,
                    "message_token": "2a302d1d26ec76ae5d892cbb8be1de01",
                    "origin": "ktkt",
                    "roomid": 1531468811,
                    "rtype": "vip",
                    "teacher_id": 1371765374235354,
                    "sina": "0",
                    "version":"1"
                }
                ws.send(JSON.stringify({
                    'ver': 1,
                    'op': 7,
                    'seq': 1,
                    'body': authData
                }));
            }

        }

        function log(msg){
            // if (win.WEB_SOCKET_FORCE_FLASH) {
                alert(msg);
            //     return;
            // } 
            // console.log(msg);
        }

        function reConnect() {
            self.createConnect(--max, delay * 2);
        }
    }

    win['MyClient'] = Client;
})(window);
