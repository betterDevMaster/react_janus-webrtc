/**
 * dispatch {type, value}
 *          JANUS_STATE : enum { INITIALIZED, CONNECTED, DISCONNECTED, REJECTED}
 *          JANUS_MESSAGE: event from server
 *          JANUS_LOCALSTREAM: local stream
 *          JANUS_ADDREMOTESTREAM: remote stream
 *
 */

export default class JanusHelper {
    static baseUrl = "https://janusserver.simportal.net:8089/janus"

    init(dispatch, pluginName) {
        this.dispatch = dispatch
        this.pluginName = pluginName
        this.opaqueId = "videoroom-" + window.Janus.randomString(12)
        this.session = null
        this.mystream = null
        this.myid = ""
        this.mypvtid = ""
        this.initJanus()
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
    }

    initJanus(debug = "all") {
        window.Janus.init({
            debug,
            callback: () => {
                this.dispatch({ type: "JANUS_STATE", value: "INITIALIZED" })
            },
        })
    }

    createSession() {
        this.session = new window.Janus({
            server: JanusHelper.baseUrl,
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
            error: (error) => this.onError("Error attaching plugin... ", error),
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
            onremotestream: (remoteStream) => this.onRemoteStream(remoteStream),
            oncleanup: () => this.onCleanUp(),
        })
    }
    onAttach(pluginHandle) {
        this.dispatch({ type: "JANUS_STATE", value: "ATTACHED" })
        this.sfutest = pluginHandle
        // window.Janus.log("Plugin attached! (" + this.sfutest.getPlugin() + ", id=" + this.sfutest.getId() + ")")
        // window.Janus.log("  -- This is a publisher/manager")
    }

    onWaitDialog(on) {
        // window.Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now")
        if (on) {
            // Darken screen and show hint
            window.$.blockUI({
                message: '<div><img src="./img/up_arrow.png"/></div>',
                css: {
                    border: "none",
                    padding: "15px",
                    backgroundColor: "transparent",
                    color: "#aaa",
                    top: "10px",
                    left: navigator.mozGetUserMedia ? "-100px" : "300px",
                },
            })
        } else {
            // Restore screen
            window.$.unblockUI()
        }
    }
    closeWaitDialog() {
        window.$.unblockUI()
    }
    onWebrtcStateChange(on) {
        console.log("Janus says our WebRTC PeerConnection is ------------------- " + (on ? "up" : "down") + " now")
        this.closeWaitDialog()
        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED" })
    }
    onMessage(msg, jsep) {
        // window.Janus.debug(" ::: Got a message (publisher) :::", msg)
        var event = msg["videoroom"]
        // window.Janus.debug("Event: " + event)
        if (msg.hasOwnProperty("id")) this.myid = msg["id"]
        if (msg.hasOwnProperty("private_id")) this.mypvtid = msg["private_id"]
        console.log("onMessage: ---------- ", event, msg, jsep, this.mypvtid)
        this.dispatch({ type: "JANUS_MESSAGE", value: msg })

        if (jsep) {
            // window.Janus.debug("Handling SDP as well...", jsep)
            this.sfutest.handleRemoteJsep({ jsep: jsep })
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
                this.dispatch({ type: "JANUS_STATE", value: "REJECTED" })
            }
        }
    }
    onLocalStream(stream) {
        this.mystream = stream
        this.dispatch({ type: "JANUS_LOCALSTREAM", value: stream })
        if (
            this.sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
            this.sfutest.webrtcStuff.pc.iceConnectionState !== "CONNECTED"
        ) {
            window.$.blockUI({
                message: "<b>Publishing...</b>",
                css: {
                    border: "none",
                    backgroundColor: "transparent",
                    color: "white",
                },
            })
        }
    }
    onRemoteStream(remoteStream) {
        this.dispatch({ type: "JANUS_ADDREMOTESTREAM", value: remoteStream })
    }
    onCleanUp() {
        console.log(" ::: Got a cleanup notification: we are unpublished now :::")
        this.mystream = null
        // this.dispatch({ type: "JANUS_STATE", value: "INITIALIZED" })
        this.dispatch({ type: "JANUS_STATE", value: "CONNECTED" })
        this.closeWaitDialog()
    }
    onDestroyed() {
        this.dispatch({ type: "JANUS_STATE", value: "DESTROYED" })
        console.log("window.location.reload() required. ---------------")
        this.sfutest = null
        // window.location.reload()
    }
    onError(title, detail) {
        window.Janus.error(title, detail)
        window.bootbox.alert(title + detail, () => {
            console.log("window.location.reload() required. --------------")
            this.dispatch({ type: "JANUS_STATE", value: "DESTROYED" })
            // window.location.reload()
        })
    }
}
