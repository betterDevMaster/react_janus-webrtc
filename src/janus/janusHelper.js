/**
 * dispatch {type, value}
 *          JANUS_STATE : enum { INITIALIZED, CONNECTED, DISCONNECTED, REJECTED}
 *          JANUS_MESSAGE: event from server
 *          JANUS_LOCALSTREAM: local stream
 *          JANUS_REMOTESTREAM: remote stream
 *
 */

export default class JanusHelper {
    static baseUrl = "https://janusserver.simportal.net/janus" // Current Janus Server
    // static baseUrl = "wss://janus.conf.meetecho.com/ws" // Dafault Janus server
    static MAX_VIDEOS = 6

    init(dispatch, roomType, pluginName) {
        this.dispatch = dispatch
        this.pluginName = pluginName
        this.pluginType = roomType
        this.opaqueId = roomType + "-" + window.Janus.randomString(12)
        this.session = null
        this.mystream = null
        this.myid = ""
        this.mypvtid = ""
        this.myusername = ""
        this.yourusername = ""
        this.feeds = []
        this.bitrateTimer = []
        this.participants = {}
        this.transactions = {}
        this.initJanus()

        // if (window.location.protocol === "http:") baseUrl = "http://janusserver.simportal.net/janus"
        // else baseUrl = "https://janusserver.simportal.net/janus"
    }
    initJanus(debug = "all") {
        window.Janus.init({
            // debug,
            callback: () => {
                this.dispatch({ type: "JANUS_STATE", value: "INITIALIZED", pluginType: this.pluginType })
            },
        })
    }
    start() {
        if (!window.Janus.isWebrtcSupported()) {
            window.bootbox.alert("No WebRTC support... ")
            return
        }
        this.createSession()
    }
    stop() {
        this.session && this.session.destroy()
        this.session = null
        this.janusPlugin = null
        this.dispatch({ type: "JANUS_DESTROYED" })
    }
    createSession() {
        this.session = new window.Janus({
            server: JanusHelper.baseUrl,
            iceServers: [
                // { urls: "stun:stun.voip.eutelia.it" },
                { urls: "turn:13.125.47.200:3478", username: "sonny", credential: "janus" },
                { urls: "turn:13.125.47.200:443?transport=tcp", username: "sonny", credential: "janus" },
                { urls: "turn:13.125.47.200:443?transport=tcp", username: "sonny", credential: "janus" },
            ],
            success: () => this.onInit(),
            error: (error) => this.onError("Critical Error --", error),
            destroyed: () => this.onDestroyed(),
        })
    }
    onInit() {
        // Attach to VideoRoom plugin
        this.session.attach({
            plugin: this.pluginName, // "janus.plugin.videoroom",
            opaqueId: this.opaqueId,
            success: (pluginHandle) => this.onAttach(pluginHandle),
            error: (error) => this.onError("Error attaching plugin in LocalStream... ", error),
            consentDialog: (on) => this.onWaitDialog(on),
            iceState: (state) => {
                window.Janus.log("ICE state changed to " + state)
            },
            mediaState: (medium, on) => {
                window.Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium)
            },
            webrtcState: (on) => this.onWebrtcStateChange(on),
            onmessage: (msg, jsep) => this.onMessage(msg, jsep),
            onlocalstream: (stream) => this.onLocalStream(stream),
            onremotestream: (stream) => this.onRemoteStream(stream),
            ondataopen: (data) => {
                window.Janus.log("The DataChannel is available!")
            },
            ondata: (data) => this.onData(data),
            oncleanup: () => this.onCleanUp(),
        })
    }
    onAttach(pluginHandle, pluginName) {
        this.janusPlugin = pluginHandle
        window.Janus.log("Plugin attached! (" + this.janusPlugin.getPlugin() + ", id=" + this.janusPlugin.getId() + ")")
        this.dispatch({ type: "JANUS_STATE", value: "ATTACHED", pluginType: this.pluginType })
    }
    onWaitDialog(on) {
        window.Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now")
        // if (on) {
        //     // Darken screen and show hint
        //     window.$.blockUI({
        //         message: '<div><img src="./img/up_arrow.png"/></div>',
        //         css: {
        //             border: "none",
        //             padding: "15px",
        //             backgroundColor: "transparent",
        //             color: "#aaa",
        //             top: "10px",
        //             left: navigator.mozGetUserMedia ? "-100px" : "300px",
        //         },
        //     })
        // } else {
        //     // Restore screen
        //     window.$.unblockUI()
        // }
    }
    onWebrtcStateChange(on) {
        window.Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now")
        this.closeWaitDialog()
        // if (on) this.dispatch({ type: "JANUS_CLEANUP", value: false })
        // this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED" })
    }
    onMessage(msg, jsep, result) {
        if (result) {
            // Video Room
            switch (result) {
                case "joined":
                    this.myid = msg["id"]
                    this.mypvtid = msg["private_id"]
                    // set local stream
                    this.publishOwnFeed(true)
                    // add remote stream which are already in room
                    this.addRemoteStreams(msg["publishers"])
                    break
                case "destroyed":
                    // The room has been destroyed
                    window.Janus.warn("The room has been destroyed!")
                    window.bootbox.alert("The room has been destroyed", function () {
                        window.location.reload()
                    })
                    break
                default:
                // console.log("onlocalMessage : default", result)
            }
        } else {
            // FIXME Error?
            var error = msg["error"]
            window.bootbox.alert(error)

            if (error.indexOf("already taken") > 0) {
                // FIXME Use status codes...
                this.dispatch({ type: "JANUS_STATE", value: "ATTACHED", pluginType: this.pluginType })
            }
            // TODO Reset status
            this.janusPlugin.hangup()
        }
        if (jsep) {
            // window.Janus.debug("Handling SDP as well...", jsep)
            this.janusPlugin.handleRemoteJsep({ jsep: jsep })
            // Check if any of the media we wanted to publish has
            // been rejected (e.g., wrong or unsupported codec)
            var audio = msg["audio_codec"]
            if (this.mystream && this.mystream.getAudioTracks() && this.mystream.getAudioTracks().length > 0 && !audio) {
                // Audio has been rejected
                window.toastr.warning("Our audio stream has been rejected, viewers won't hear us")
            }
            var video = msg["video_codec"]
            if (this.mystream && this.mystream.getVideoTracks() && this.mystream.getVideoTracks().length > 0 && !video) {
                // Video has been rejected
                window.toastr.warning("Our video stream has been rejected, viewers won't see us")
                // Hide the webcam video
                this.dispatch({ type: "JANUS_STATE", value: "REJECTED", pluginType: this.pluginType })
            }
        }
    }
    onLocalStream(stream) {
        window.Janus.debug(" ::: Got a local stream :::", stream)
        // this.mystream = stream
        // this.dispatch({ type: "JANUS_STATE", value: "RUNNING", pluginType: this.pluginType })
        // this.dispatch({ type: "JANUS_LOCALSTREAM", value: stream })
    }
    onRemoteStream(stream) {
        window.Janus.debug(" ::: Got a remote stream :::", stream)
        // this.feeds[0] = this.janusPlugin
        // this.feeds[0].stream = stream
        // this.dispatch({ type: "JANUS_REMOTESTREAM", value: this.feeds })
    }
    onData(data) {
        window.Janus.debug("We got data from the DataChannel!", data)
    }
    onCleanUp() {
        window.Janus.log(" ::: Got a cleanup notification: we are unpublished now :::")
        this.mystream = null
        // this.dispatch({ type: "JANUS_STATE", value: "INITIALIZED" })
        // this.dispatch({ type: "JANUS_STATE", value: "RUNNING" })
        // this.dispatch({ type: "JANUS_CLEANUP", value: true })
        this.closeWaitDialog()
    }
    onDestroyed() {
        // this.dispatch({ type: "JANUS_DESTROYED" })
        this.session && this.session.destroy()
        this.session = null
        this.janusPlugin = null
        window.location.reload()
    }
    onError(title, detail) {
        window.Janus.error(title, detail)
        const alt = "Probably a network error. Please contact with the SupportTeam."
        // window.bootbox.alert(title + detail, () => {
        window.bootbox.alert(alt, () => {
            this.dispatch({ type: "JANUS_DESTROYED" })
            window.location.reload()
            // this.dispatch({ type: "JANUS_STATE", value: "DESTROYED" })
        })
    }
    closeWaitDialog() {
        window.$.unblockUI()
    }

    // registerUsername(username, register) {
    //     if (username === "") {
    //         window.bootbox.alert("Insert your display name (e.g., pippo)")
    //         return
    //     }
    //     if (/[^a-zA-Z0-9]/.test(username)) {
    //         window.bootbox.alert("Input is not alphanumeric")
    //         return
    //     }
    //     this.myusername = username
    //     this.janusPlugin.send({ message: register })
    // }
    doCall(username) {
        // Call someone
        if (username === "") {
            window.bootbox.alert("Insert a username to call (e.g., pluto)")
            return
        }
        if (/[^a-zA-Z0-9]/.test(username)) {
            window.bootbox.alert("Input is not alphanumeric")
            return
        }
        // Call this user
        this.janusPlugin.createOffer({
            // By default, it's sendrecv for audio and video...
            media: { data: true }, // ... let's negotiate data channels as well
            // If you want to test simulcasting (Chrome and Firefox only), then
            // pass a ?simulcast=true when opening this demo page: it will turn
            // the following 'simulcast' property to pass to janus.js to true
            simulcast: false,
            success: (jsep) => {
                window.Janus.debug("Got SDP!", jsep)
                var body = { request: "call", username: username }

                this.janusPlugin.send({ message: body, jsep: jsep })
            },
            error: (error) => {
                window.Janus.error("WebRTC error...", error)
                window.bootbox.alert("WebRTC error... " + error.message)
            },
        })
    }

    doHangup() {
        // Hangup a call
        var hangup = { request: "hangup" }
        this.janusPlugin.send({ message: hangup })
        this.janusPlugin.hangup()
        this.yourusername = null
    }
}
