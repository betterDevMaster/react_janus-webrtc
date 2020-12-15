import JanusHelper from "./janusHelper"

export default class JanusHelperVideoCall extends JanusHelper {
    static getInstance() {
        if (!JanusHelperVideoCall._inst) {
            JanusHelperVideoCall._inst = new JanusHelperVideoCall()
        }
        return JanusHelperVideoCall._inst
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
        // console.log("helperVideoCall: registerUsername: ================")
        var register = { request: "register", username: username }
        super.registerUsername(username, register)
    }
    onMessage(msg, jsep) {
        // Video Call
        var result = msg["result"]
        // console.log("localFeed: onMessage: =============== ", result, msg, jsep)
        if (result) {
            var event = result["event"]
            switch (event) {
                case "registered":
                    this.myusername = result["username"]
                    window.Janus.log("Successfully registered as " + this.myusername + "!")
                    this.janusPlugin.send({ message: { request: "list" } })
                    break
                case "calling":
                    window.Janus.log("Waiting for the peer to answer...")
                    // TODO Any ringtone?
                    window.bootbox.alert("Waiting for the peer to answer...")
                    break
                case "incomingcall":
                    window.Janus.log("Incoming call from " + result["username"] + "!")
                    this.yourusername = result["username"]
                    this.janusPlugin.rfdisplay = msg["display"]

                    // Notify user
                    window.bootbox.hideAll()
                    let plugin = this.janusPlugin
                    // let incoming = window.bootbox.dialog({
                    window.bootbox.dialog({
                        message: "Incoming call from " + this.yourusername + "!",
                        title: "Incoming call",
                        closeButton: false,
                        buttons: {
                            success: {
                                label: "Answer",
                                className: "btn-success",
                                callback: function () {
                                    // incoming = null
                                    // $("#peer").val(result["username"]).attr("disabled", true)
                                    plugin.createAnswer({
                                        jsep: jsep,
                                        // No media provided: by default, it's sendrecv for audio and video
                                        media: { data: true }, // Let's negotiate data channels as well
                                        // If you want to test simulcasting (Chrome and Firefox only), then
                                        // pass a ?simulcast=true when opening this demo page: it will turn
                                        // the following 'simulcast' property to pass to janus.js to true
                                        simulcast: false,
                                        success: (jsep) => {
                                            window.Janus.debug("Got SDP!", jsep)
                                            var body = { request: "accept" }
                                            plugin.send({ message: body, jsep: jsep })
                                        },
                                        error: (error) => {
                                            window.Janus.error("WebRTC error:", error)
                                            window.bootbox.alert("WebRTC error... " + error.message)
                                        },
                                    })
                                },
                            },
                            danger: {
                                label: "Decline",
                                className: "btn-danger",
                                callback: function () {
                                    this.doHangup()
                                },
                            },
                        },
                    })
                    break
                case "accepted":
                    window.bootbox.hideAll()
                    var peer = result["username"]
                    if (!peer) {
                        window.Janus.log("Call started!")
                    } else {
                        window.Janus.log(peer + " accepted the call!")
                        this.yourusername = peer
                    }
                    // Video call can start
                    if (jsep) this.janusPlugin.handleRemoteJsep({ jsep: jsep })
                    break
                case "update":
                    // An 'update' event may be used to provide renegotiation attempts
                    if (jsep) {
                        if (jsep.type === "answer") {
                            this.janusPlugin.handleRemoteJsep({ jsep: jsep })
                        } else {
                            this.janusPlugin.createAnswer({
                                jsep: jsep,
                                media: { data: true }, // Let's negotiate data channels as well
                                success: (jsep) => {
                                    window.Janus.debug("Got SDP!", jsep)
                                    var body = { request: "set" }
                                    this.janusPlugin.send({ message: body, jsep: jsep })
                                },
                                error: (error) => {
                                    window.Janus.error("WebRTC error:", error)
                                    window.bootbox.alert("WebRTC error... " + error.message)
                                },
                            })
                        }
                    }
                    break
                case "hangup":
                    window.Janus.log("Call hung up by " + result["username"] + " (" + result["reason"] + ")!")
                    // Reset status
                    window.bootbox.hideAll()
                    this.janusPlugin.hangup()
                    if (window.spinner) window.spinner.stop()
                    break
                default:
            }
        }
        super.onMessage(msg, jsep, result)
    }
    onData(data) {
        window.Janus.debug("We got data from the JanusHelper!", data)
        // $("#datarecv").val(data)
        this.dispatch({ type: "JANUS_MESSAGE", message: data })
    }
    onWebrtcStateChange(on) {
        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "ATTACHED" })
    }
}
