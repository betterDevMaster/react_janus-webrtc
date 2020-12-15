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
    onWebrtcStateChange(on) {
        // this.dispatch({ type: "JANUS_STATE", value: "CONNECTED" })
        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED" })
    }
}
