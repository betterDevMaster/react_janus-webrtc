import JanusHelper from "./janusHelper"

export default class JanusHelperVideoRoom extends JanusHelper {
    static getInstance() {
        if (!JanusHelperVideoRoom._inst) {
            JanusHelperVideoRoom._inst = new JanusHelperVideoRoom()
        }
        return JanusHelperVideoRoom._inst
    }
    init(dispatch, roomType, pluginName) {
        super.init(dispatch, roomType, pluginName)
    }
    start(roomName) {
        this.myroom = roomName // Demo room
        super.start()
    }
    stop() {
        super.stop()
    }
    registerUsername(username) {
        var register = {
            request: "join",
            room: this.myroom,
            ptype: "publisher",
            display: username,
        }
        super.registerUsername(username, register)
    }
    onAttach(pluginHandle) {
        const createRoom = {
            request: "create",
            record: false,
            publishers: JanusHelper.MAX_VIDEOS,
            description: "New VideoRoom",
            secret: "adminpwd",
            room: this.myroom,
            bitrate: 128000,
            fir_freq: 10,
        }
        pluginHandle.send({ message: createRoom })

        super.onAttach(pluginHandle)
    }
    onMessage(msg, jsep) {
        var result = msg["videoroom"]
        console.log("RoomHelper: onMessage: ------------- ", msg, jsep, result)
        switch (result) {
            case "event":
                if (msg["publishers"]) {
                    // add new remote
                    this.addRemoteStreams(msg["publishers"])
                } else if (msg["leaving"]) {
                    this.removeRemoteStream(msg["leaving"])
                } else if (msg["unpublished"]) {
                    const id = msg["unpublished"]
                    window.Janus.log("Publisher left: " + id)

                    if (id === "ok") {
                        this.janusPlugin.hangup()
                        return
                    }
                    this.removeRemoteStream(id)
                } else if (msg["error"]) {
                    if (msg["error_code"] === 426) {
                        // This is a "no such room" error: give a more meaningful description
                        window.bootbox.alert(
                            "<p>Apparently room <code>" +
                                this.myroom +
                                "</code> (the one this demo uses as a test room) " +
                                "does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> " +
                                "configuration file? If not, make sure you copy the details of room <code>" +
                                this.myroom +
                                "</code> " +
                                "from that sample in your current configuration file, then restart Janus and try again."
                        )
                    } else {
                        window.bootbox.alert(msg["error"])
                    }
                }
                break
            default:
        }
        super.onMessage(msg, jsep, result)
    }
    onData(data) {
        window.Janus.debug("We got data from the DataChannel!", data)
        //~ $('#datarecv').val(data);
        console.log("Room: onData: =============== ", data)
        var json = JSON.parse(data)
        var transaction = json["transaction"]
        if (this.transactions[transaction]) {
            // Someone was waiting for this
            this.transactions[transaction](json)
            delete this.transactions[transaction]
            return
        }
        var what = json["textroom"]
        super.onData()
    }
    onWebrtcStateChange(on) {
        // this.dispatch({ type: "JANUS_STATE", value: "CONNECTED" })
        window.Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now")
        if (on) {
            window.bootbox.alert(
                "Your screen sharing session just started: pass the <b>" +
                    this.screenShareId +
                    "</b> session identifier to those who want to attend."
            )
        } else {
            window.bootbox.alert("Your screen sharing session just stopped.", function () {
                window.janus.destroy()
                window.location.reload()
            })
        }

        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED" })
    }
    togglVideoMute() {
        super.toggleVideoMute()
    }
    togglAudioMute() {
        super.toggleAudioMute()
    }
    preShareScreen(username) {
        if (!window.Janus.isExtensionEnabled()) {
            window.bootbox.alert(
                "You're using Chrome but don't have the screensharing extension installed: click <b><a href='https://chrome.google.com/webstore/detail/janus-webrtc-screensharin/hapfgfdkleiggjjpfpenajgdnfckjpaj' target='_blank'>here</a></b> to do so",
                function () {
                    window.location.reload()
                }
            )
            return
        }

        this.capture = "screen"
        if (navigator.mozGetUserMedia) {
            // Firefox needs a different constraint for screen and window sharing
            window.bootbox.dialog({
                title: "Share whole screen or a window?",
                message:
                    "Firefox handles screensharing in a different way: are you going to share the whole screen, or would you rather pick a single window/application to share instead?",
                buttons: {
                    screen: {
                        label: "Share screen",
                        className: "btn-primary",
                        callback: () => {
                            this.capture = "screen"
                            this.shareScreen(username)
                        },
                    },
                    window: {
                        label: "Pick a window",
                        className: "btn-success",
                        callback: () => {
                            this.capture = "window"
                            this.shareScreen(username)
                        },
                    },
                },
                onEscape: function () {
                    console.log("screenShare: onEscape: =============== ")
                },
            })
        } else {
            this.shareScreen(username)
        }
    }
    shareScreen(username) {
        // Create a new room
        this.role = "publisher"
        var create = {
            request: "create",
            description: username,
            bitrate: 500000,
            publishers: 1,
        }
        this.janusPlugin.send({
            message: create,
            success: (result) => {
                var event = result["videoroom"]
                window.Janus.debug("Event: " + event)
                console.log("shareScreen: ----------------- ", result)
                if (event) {
                    // Our own screen sharing session has been created, join it
                    // var room = result["room"]
                    this.screenShareId = result["room"]
                    window.Janus.log("Screen sharing session created: " + this.screenShareId)
                    // this.myusername = randomString(12)
                    var register = {
                        request: "join",
                        room: this.screenShareId,
                        ptype: "publisher",
                        display: this.myusername,
                    }
                    this.janusPlugin.send({ message: register })
                }
            },
        })
    }
    joinScreen() {
        // Join an existing screen sharing session
        this.role = "listener"
        // myusername = randomString(12)
        var register = {
            request: "join",
            room: this.screenShareId,
            ptype: "publisher",
            display: this.myusername,
        }
        this.janusPlugin.send({ message: register })
    }
}
