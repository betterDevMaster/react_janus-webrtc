/**
 * dispatch {type, value}
 *          JANUS_STATE : enum { INITIALIZED, CONNECTED, DISCONNECTED, REJECTED}
 *          JANUS_MESSAGE: event from server
 *          JANUS_LOCALSTREAM: local stream
 *          JANUS_REMOTESTREAM: remote stream
 *
 */

export default class JanusHelper {
    static baseUrl = "https://janusserver.simportal.net:8089/janus"

    static getInstance() {
        if (!JanusHelper._inst) {
            JanusHelper._inst = new JanusHelper()
        }
        return JanusHelper._inst
    }

    init(dispatch, pluginName) {
        this.dispatch = dispatch
        this.pluginName = pluginName
        this.opaqueId = "videoroom-" + window.Janus.randomString(12)
        this.session = null
        this.mystream = null
        this.myid = ""
        this.mypvtid = ""
        this.feeds = []
        this.bitrateTimer = []
        this.initJanus()
    }

    initJanus(debug = "all") {
        window.Janus.init({
            // debug,
            callback: () => {
                this.dispatch({ type: "JANUS_STATE", value: "INITIALIZED" })
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
            onremotestream: () => {},
            oncleanup: () => this.onCleanUp(),
        })
    }

    onAttach(pluginHandle) {
        this.janusPlugin = pluginHandle
        this.dispatch({ type: "JANUS_STATE", value: "ATTACHED" })
    }

    onWaitDialog(on) {
        window.Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now")
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

    onWebrtcStateChange(on) {
        window.Janus.log("Janus says our WebRTC PeerConnection is ------------------- " + (on ? "up" : "down") + " now")
        this.closeWaitDialog()
        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED" })
    }

    onMessage(msg, jsep) {
        var event = msg["videoroom"]
        console.log("localFeed: onMessage: ----------------- ", event, msg, jsep)

        if (event) {
            switch (event) {
                case "joined":
                    // this.myid = msg["id"]
                    // this.mypvtid = msg["private_id"]
                    // set local stream
                    this.publishOwnFeed(true)
                    // add remote stream which are already in room
                    this.addRemoteStreams(msg["publishers"])
                    break
                case "destroyed":
                    window.bootbox.alert("The room has been destroyed", function () {
                        window.location.reload()
                    })
                case "event":
                    if (msg["publishers"]) {
                        // add new remote
                        this.addRemoteStreams(msg["publishers"])
                    } else if (msg["leaving"]) {
                        // this.removeRemoteStreamById(msg["leaving"])
                        this.removeRemoteStream(msg["leaving"])
                    } else if (msg["unpublished"]) {
                        const id = msg["unpublished"]
                        if (id === "ok") {
                            this.janusPlugin.hangup()
                            return
                        }
                        this.removeRemoteStream(id)
                    } else if (msg["error"]) {
                        console.error(msg)
                    }
            }
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
                this.dispatch({ type: "JANUS_STATE", value: "REJECTED" })
            }
        }
    }

    onLocalStream(stream) {
        this.mystream = stream
        this.dispatch({ type: "JANUS_STATE", value: "RUNNING" })
        this.dispatch({ type: "JANUS_LOCALSTREAM", value: stream })
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
        this.janusPlugin = null
    }

    onError(title, detail) {
        window.Janus.error(title, detail)
        window.bootbox.alert(title + detail, () => {
            this.dispatch({ type: "JANUS_STATE", value: "DESTROYED" })
        })
    }

    closeWaitDialog() {
        window.$.unblockUI()
    }

    registerUsername(username) {
        // this.publishOwnFeed(true)
        if (username === "") {
            console.error("Insert your display name (e.g., pippo)")
            return
        }
        if (/[^a-zA-Z0-9]/.test(username)) {
            console.error("Input is not alphanumeric")
            return
        }
        this.myusername = username
        var register = {
            request: "join",
            room: this.myroom,
            ptype: "publisher",
            display: this.myusername,
        }
        // console.log("registerUsername : ------------ ", register)
        this.janusPlugin.send({ message: register })
    }

    toggleMute() {
        var muted = this.janusPlugin.isAudioMuted()
        // console.log("toggleMute: ------------ ", muted)

        window.Janus.log((muted ? "Unmuting" : "Muting") + " local stream...")
        if (muted) this.janusPlugin.unmuteAudio()
        else this.janusPlugin.muteAudio()
        muted = this.janusPlugin.isAudioMuted()
    }

    publishOwnFeed(useAudio) {
        // Publish our stream
        this.janusPlugin.createOffer({
            // Add data:true here if you want to publish datachannels as well
            media: {
                audioRecv: false,
                videoRecv: false,
                audioSend: useAudio,
                videoSend: true,
            }, // Publishers are sendonly
            // If you want to test simulcasting (Chrome and Firefox only), then
            // pass a ?simulcast=true when opening this demo page: it will turn
            // the following 'simulcast' property to pass to janus.js to true
            simulcast: false, //doSimulcast,
            simulcast2: false, //doSimulcast2,
            success: (jsep) => {
                window.Janus.debug("Got publisher SDP!", jsep)
                var publish = { request: "configure", audio: useAudio, video: true }
                // You can force a specific codec to use when publishing by using the
                // audiocodec and videocodec properties, for instance:
                // 		publish["audiocodec"] = "opus"
                // to force Opus as the audio codec to use, or:
                // 		publish["videocodec"] = "vp9"
                // to force VP9 as the videocodec to use. In both case, though, forcing
                // a codec will only work if: (1) the codec is actually in the SDP (and
                // so the browser supports it), and (2) the codec is in the list of
                // allowed codecs in a room. With respect to the point (2) above,
                // refer to the text in janus.plugin.videoroom.jcfg for more details
                this.janusPlugin.send({ message: publish, jsep: jsep })
            },
            error: (error) => {
                window.Janus.error("WebRTC error:", error)
                if (useAudio) {
                    this.publishOwnFeed(false)
                } else {
                    window.bootbox.alert("WebRTC error... " + error.message)
                }
            },
        })
    }

    unpublishOwnFeed() {
        // Unpublish our stream
        var unpublish = { request: "unpublish" }
        this.janusPlugin.send({ message: unpublish })
    }

    addRemoteStreams(list) {
        if (list) {
            list.forEach((rec) => {
                this.newRemoteFeed(rec["id"], rec["display"], rec["audio_codec"], rec["video_codec"])
            })
        }
    }

    getRemoteFeedById(remoteId) {
        var remoteFeed = null
        for (var i = 1; i < 6; i++) {
            if (this.feeds[i] && this.feeds[i].rfid == remoteId) {
                remoteFeed = this.feeds[i]
                break
            }
        }
        return remoteFeed
    }

    removeRemoteStream(remoteId) {
        var remoteFeed = this.getRemoteFeedById(remoteId)
        console.log("removeRemoteStream: ----------- ", remoteFeed, this.feeds)
        if (remoteFeed != null) {
            this.feeds[remoteFeed.rfindex] = null
            remoteFeed.detach()
            this.dispatch({ type: "JANUS_REMOTESTREAM", value: this.feeds })
        }
    }

    newRemoteFeed(remoteId, display, audio, video) {
        // A new feed has been published, create a new plugin handle and attach to it as a subscriber
        var remoteFeed = null
        this.session.attach({
            plugin: this.pluginName,
            opaqueId: this.opaqueId,
            success: (pluginHandle) => {
                remoteFeed = pluginHandle
                remoteFeed.simulcastStarted = false
                var subscribe = {
                    request: "join",
                    room: this.myroom,
                    ptype: "subscriber",
                    feed: remoteId,
                    private_id: this.mypvtid,
                }
                if (
                    window.Janus.webRTCAdapter.browserDetails.browser === "safari" &&
                    (video === "vp9" || (video === "vp8" && !window.Janus.safariVp8))
                ) {
                    if (video) video = video.toUpperCase()
                    window.toastr.warning("Publisher is using " + video + ", but Safari doesn't support it: disabling video")
                    subscribe["offer_video"] = false
                }
                remoteFeed.videoCodec = video
                remoteFeed.send({ message: subscribe })
            },
            error: (error) => {
                window.Janus.error("  -- Error attaching plugin...", error)
                window.bootbox.alert("Error attaching plugin... " + error)
            },
            onmessage: (msg, jsep) => {
                //Janus.debug(" ::: Got a message (subscriber) :::", msg)
                var event = msg["videoroom"]
                //Janus.debug("Event: " + event)
                console.log("newRemoteFeed: onmessage: ----------------- ", event, msg, jsep)
                if (msg["error"]) {
                    window.bootbox.alert(msg["error"])
                } else if (event) {
                    switch (event) {
                        case "attached":
                            // add remote stream in blank record of feeds array
                            for (var i = 1; i < 6; i++) {
                                if (!this.feeds[i]) {
                                    this.feeds[i] = remoteFeed
                                    remoteFeed.rfindex = i
                                    break
                                }
                            }
                            // console.log("feeds: -------------- ", this.feeds)

                            remoteFeed.rfid = msg["id"]
                            remoteFeed.rfdisplay = msg["display"]
                            this.dispatch({ type: "JANUS_REMOTESTREAM", value: this.feeds })
                            // console.log(
                            //     "Successfully attached to feed " +
                            //         remoteFeed.rfid +
                            //         " (" +
                            //         remoteFeed.rfdisplay +
                            //         ") in room " +
                            //         msg["room"]
                            // )
                            break
                        case "event":
                            var substream = msg["substream"]
                            var temporal = msg["temporal"]
                            if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
                                if (!remoteFeed.simulcastStarted) {
                                    remoteFeed.simulcastStarted = true
                                    // Add some new buttons
                                    // addSimulcastButtons(remoteFeed.rfindex, remoteFeed.videoCodec === "vp8" || remoteFeed.videoCodec === "h264")
                                }
                                // We just received notice that there's been a switch, update the buttons
                                // updateSimulcastButtons(remoteFeed.rfindex, substream, temporal)
                            }
                            break
                        default:
                        // console.log("What has just happened?", msg)
                        // What has just happened?
                    }
                }
                if (jsep) {
                    window.Janus.debug("Handling SDP as well...", jsep)
                    // Answer and attach
                    remoteFeed.createAnswer({
                        jsep: jsep,
                        // Add data:true here if you want to subscribe to datachannels as well
                        // (obviously only works if the publisher offered them in the first place)
                        media: { audioSend: false, videoSend: false }, // We want recvonly audio/video
                        success: function (jsep) {
                            window.Janus.debug("Got SDP!", jsep)
                            var body = { request: "start", room: this.myroom }
                            remoteFeed.send({ message: body, jsep: jsep })
                        },
                        error: function (error) {
                            window.Janus.error("WebRTC error:", error)
                            window.bootbox.alert("WebRTC error... " + error.message)
                        },
                    })
                }
            },
            iceState: (state) => {
                window.Janus.log("ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state)
            },
            webrtcState: (on) => {
                window.Janus.log(
                    "Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now"
                )
            },
            onlocalstream: (stream) => {
                // The subscriber stream is recvonly, we don't expect anything here
            },
            onremotestream: (stream) => {
                // window.Janus.debug("Remote feed #" + remoteFeed.rfindex + ", stream:", stream)
                // console.log("newRemoteStream: ------------- ", stream)
                remoteFeed["stream"] = stream
                // this.dispatch({ type: "JANUS_REMOTESTREAM", value: this.feeds })
            },
            oncleanup: () => {
                this.removeRemoteStream(remoteFeed.rfindex)
            },
        })
    }
}
