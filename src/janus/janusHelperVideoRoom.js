import JanusHelper from "./janusHelper"

export default class JanusHelperVideoRoom extends JanusHelper {
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

        if (username === "") {
            window.bootbox.alert("Insert your display name (e.g., pippo)")
            return
        }
        if (/[^a-zA-Z0-9]/.test(username)) {
            window.bootbox.alert("Input is not alphanumeric")
            return
        }
        this.myusername = username
        this.janusPlugin.send({ message: register })
        // super.registerUsername(username, register)
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

        super.onAttach(pluginHandle, this.pluginName)
    }
    onMessage(msg, jsep) {
        var result = msg["videoroom"]
        // console.log("RoomHelper: onMessage: ------------- ", msg, jsep, result)
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
        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED", pluginType: this.pluginType })
    }
    onLocalStream(stream) {
        this.mystream = stream
        this.dispatch({ type: "JANUS_STATE", value: "RUNNING", pluginType: this.pluginType })
        this.dispatch({ type: "JANUS_LOCALSTREAM", local: stream })
    }
    onRemoteStream(stream) {
        window.Janus.debug(" ::: Got a remote stream :::", stream)
        this.feeds[0] = this.janusPlugin
        this.feeds[0].stream = stream
        this.dispatch({ type: "JANUS_REMOTESTREAM", remote: this.feeds })
    }
    toggleAudioMute() {
        var muted = this.janusPlugin.isAudioMuted()
        window.Janus.log((muted ? "Unmuting" : "Muting") + "in audio stream...")
        if (muted) this.janusPlugin.unmuteAudio()
        else this.janusPlugin.muteAudio()
    }
    toggleVideoMute() {
        var muted = this.janusPlugin.isVideoMuted()
        window.Janus.log((muted ? "Unmuting" : "Muting") + " in video stream...")
        if (muted) this.janusPlugin.unmuteVideo()
        else this.janusPlugin.muteVideo()
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
                // data: true,
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
    removeRemoteStream(remoteId) {
        var remoteFeed = this.getRemoteFeedById(remoteId)
        if (remoteFeed != null) {
            window.Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching")
            this.feeds[remoteFeed.rfindex] = null
            remoteFeed.detach()
            this.dispatch({ type: "JANUS_REMOTESTREAM", remote: this.feeds })
        }
    }
    getRemoteFeedById(remoteId) {
        var remoteFeed = null
        for (var i = 1; i < JanusHelper.MAX_VIDEOS; i++) {
            if (this.feeds[i] && this.feeds[i].rfid === remoteId) {
                remoteFeed = this.feeds[i]
                break
            }
        }
        return remoteFeed
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
                window.Janus.error("Error attaching plugin in RemoteStream...", error)
                window.bootbox.alert("Error attaching plugin in RemoteStream... " + error)
            },
            onmessage: (msg, jsep) => {
                window.Janus.debug(" ::: Got a message (subscriber) :::", msg)

                var event = msg["videoroom"]
                window.Janus.debug("Event: " + event)

                if (msg["error"]) {
                    window.bootbox.alert(msg["error"])
                } else if (event) {
                    switch (event) {
                        case "attached":
                            // add remote stream in blank record of feeds array
                            for (var i = 1; i < JanusHelper.MAX_VIDEOS; i++) {
                                if (!this.feeds[i]) {
                                    this.feeds[i] = remoteFeed
                                    remoteFeed.rfindex = i
                                    break
                                }
                            }

                            remoteFeed.rfid = msg["id"]
                            remoteFeed.rfdisplay = msg["display"]

                            this.dispatch({ type: "JANUS_REMOTESTREAM", remote: this.feeds })
                            window.Janus.log(
                                "Successfully attached to feed " +
                                    remoteFeed.rfid +
                                    " (" +
                                    remoteFeed.rfdisplay +
                                    ") in room " +
                                    msg["room"]
                            )
                            break
                        case "event":
                            var substream = msg["substream"]
                            var temporal = msg["temporal"]
                            // console.log("substream: ================== ", substream, temporal)
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
                window.Janus.debug("Remote feed #" + remoteFeed.rfindex + ", stream:", stream)
                if (stream && stream !== undefined && this.feeds[remoteFeed.rfindex]) {
                    this.feeds[remoteFeed.rfindex].stream = stream
                    this.feeds[remoteFeed.rfindex].videoTracks = stream.getVideoTracks()

                    this.dispatch({ type: "JANUS_REMOTESTREAM", remote: this.feeds })
                }
                if (!this.feeds[remoteFeed.rfindex]) window.location.href = "/"
            },
            oncleanup: () => {
                this.removeRemoteStream(remoteFeed.rfindex)
            },
        })
    }
}
