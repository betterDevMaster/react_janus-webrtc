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
        this.session = null
        this.mystream = null
        this.initJanus()
    }
    generateRandomId() {
        this.opaqueId = this.pluginName + "-" + window.Janus.randomString(12)
    }

    start() {
        if (!window.Janus.isWebrtcSupported()) {
            bootbox.alert("No WebRTC support... ")
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
            success: () => {
                // Attach to VideoRoom plugin
                janus.attach({
                    plugin: this.pluginName, // "janus.plugin.videoroom",
                    opaqueId: this.generateRandomId(),
                    success: this.onAttach,
                    error: (error) => this.onError("Error attaching plugin... ", error),
                    consentDialog: this.onWaitDialog,
                    iceState: (state) => {
                        window.Janus.log("ICE state changed to " + state)
                    },
                    mediaState: (medium, on) => {
                        window.Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium)
                    },
                    webrtcState: this.onWebrtcStateChange,
                    onmessage: this.onMessage,
                    onlocalstream: this.onLocalStream,
                    onremotestream: this.onRemoteStream,
                    oncleanup: this.onCleanUp,
                })
            },
            error: (error) => this.onError("Critical Error --", error),
            destroyed: this.onDestroyed,
        })
    }

    onAttach(pluginHandle) {
        this.sfutest = pluginHandle
    }

    onWaitDialog(on) {
        windowJanus.debug("Consent dialog should be " + (on ? "on" : "off") + " now")
        if (on) {
            // Darken screen and show hint
            $.blockUI({
                message: '<div><img src="up_arrow.png"/></div>',
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
            $.unblockUI()
        }
    }
    closeWaitDialog() {
        window.$.unblockUI()
    }
    onWebrtcStateChange(on) {
        window.Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now")
        this.closeWaitDialog()
        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED" })
    }
    onMessage(msg, jsep) {
        window.Janus.debug(" ::: Got a message (publisher) :::", msg)
        var event = msg["videoroom"]
        Janus.debug("Event: " + event)
        this.dispatch({ type: "JANUS_MESSAGE", value: event })

        if (jsep) {
            window.Janus.debug("Handling SDP as well...", jsep)
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
        window.Janus.debug(" ::: Got a local stream :::", stream)
        this.mystream = stream
        this.dispatch({ type: "JANUS_LOCALSTREAM", value: stream })
        if (
            thi.sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
            this.sfutest.webrtcStuff.pc.iceConnectionState !== "connected"
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
        window.Janus.log(" ::: Got a cleanup notification: we are unpublished now :::")
        this.mystream = null
        this.dispatch({ type: "JANUS_STATE", value: "INITIALIZED" })
        this.closeWaitDialog()
    }
    onDestroyed() {
        this.dispatch({ type: "JANUS_STATE", value: "DESTROYED" })
        console.log("window.location.reload() required.")
        // window.location.reload()
    }
    onError(title, detail) {
        window.Janus.error(title, error)
        window.bootbox.alert(title + error, () => {
            this.dispatch({ type: "JANUS_STATE", value: "DESTROYED" })
            console.log("window.location.reload() required.")
            // window.location.reload()
        })
    }
}
