import JanusHelper from "./janusHelper"
import * as $ from "jquery"

export default class JanusHelperVideoRoom extends JanusHelper {
    static getInstance() {
        if (!JanusHelperVideoRoom._inst) {
            JanusHelperVideoRoom._inst = new JanusHelperVideoRoom()
        }
        return JanusHelperVideoRoom._inst
    }
    init(dispatch) {
        super.init(dispatch, "janus.plugin.videoroom")
    }
    start(roomName) {
        this.myroom = roomName // Demo room
        super.start()
        // if (getQueryStringValue("room") !== "") myroom = parseInt(getQueryStringValue("room"))
        this.feeds = []
        this.bitrateTimer = []
    }
    stop() {
        if (this.session) this.session.destroy()
    }
    registerUsername(username) {
        this.publishOwnFeed(true)
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
        console.log("registerUsername : ------------ ", register)
        this.sfutest.send({ message: register })
    }

    publishOwnFeed(useAudio) {
        // Publish our stream
        this.sfutest.createOffer({
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
                this.sfutest.send({ message: publish, jsep: jsep })
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
    toggleMute() {
        var muted = this.sfutest.isAudioMuted()
        console.log("toggleMute: ------------ ", muted)

        window.Janus.log((muted ? "Unmuting" : "Muting") + " local stream...")
        if (muted) this.sfutest.unmuteAudio()
        else this.sfutest.muteAudio()
        muted = this.sfutest.isAudioMuted()
    }
    unpublishOwnFeed() {
        // Unpublish our stream
        var unpublish = { request: "unpublish" }
        this.sfutest.send({ message: unpublish })
    }
    newRemoteFeed(id, display, audio, video) {
        // A new feed has been published, create a new plugin handle and attach to it as a subscriber
        var remoteFeed = null
        this.session.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: this.opaqueId,
            success: (pluginHandle) => {
                remoteFeed = pluginHandle
                remoteFeed.simulcastStarted = false
                //Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")")
                //Janus.log("  -- This is a subscriber")
                // We wait for the plugin to send us an offer
                var subscribe = {
                    request: "join",
                    room: this.myroom,
                    ptype: "subscriber",
                    feed: id,
                    private_id: this.mypvtid,
                }
                // In case you don't want to receive audio, video or data, even if the
                // publisher is sending them, set the 'offer_audio', 'offer_video' or
                // 'offer_data' properties to false (they're true by default), e.g.:
                // 		subscribe["offer_video"] = false;
                // For example, if the publisher is VP8 and this is Safari, let's avoid video
                console.log("remoteFeed: ------------- ", this.opaqueId, subscribe)
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
                if (msg["error"]) {
                    window.bootbox.alert(msg["error"])
                } else if (event) {
                    if (event === "attached") {
                        // Subscriber created and attached
                        for (var i = 1; i < 6; i++) {
                            if (!this.feeds[i]) {
                                this.feeds[i] = remoteFeed
                                remoteFeed.rfindex = i
                                break
                            }
                        }
                        remoteFeed.rfid = msg["id"]
                        remoteFeed.rfdisplay = msg["display"]
                        if (!remoteFeed.spinner) {
                            var target = document.getElementById("videoremote" + remoteFeed.rfindex)
                            remoteFeed.spinner = new window.Spinner({ top: 100 }).spin(target)
                        } else {
                            remoteFeed.spinner.spin()
                        }
                        window.Janus.log(
                            "Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]
                        )
                        // $("#remote" + remoteFeed.rfindex)
                        //     .removeClass("hide")
                        //     .html(remoteFeed.rfdisplay)
                        //     .show()
                    } else if (event === "event") {
                        // Check if we got a simulcast-related event from this publisher
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
                    } else {
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
                var addButtons = false
                if ($("#remotevideo" + remoteFeed.rfindex).length === 0) {
                    addButtons = true
                    // No remote video yet
                    $("#videoremote" + remoteFeed.rfindex).append(
                        '<video class="rounded centered" id="waitingvideo' + remoteFeed.rfindex + '" width="100%" height="100%" />'
                    )
                    $("#videoremote" + remoteFeed.rfindex).append(
                        '<video class="rounded centered relative hide" id="remotevideo' +
                            remoteFeed.rfindex +
                            '" width="100%" height="100%" autoplay playsinline/>'
                    )
                    $("#videoremote" + remoteFeed.rfindex).append(
                        '<span class="label label-primary hide" id="curres' +
                            remoteFeed.rfindex +
                            '" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
                            '<span class="label label-info hide" id="curbitrate' +
                            remoteFeed.rfindex +
                            '" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>'
                    )
                    // Show the video, hide the spinner and show the resolution when we get a playing event
                    $("#remotevideo" + remoteFeed.rfindex).bind("playing", function () {
                        if (remoteFeed.spinner) remoteFeed.spinner.stop()
                        remoteFeed.spinner = null
                        $("#waitingvideo" + remoteFeed.rfindex).remove()
                        if (this.videoWidth)
                            $("#remotevideo" + remoteFeed.rfindex)
                                .removeClass("hide")
                                .show()
                        var width = this.videoWidth
                        var height = this.videoHeight
                        $("#curres" + remoteFeed.rfindex)
                            .removeClass("hide")
                            .text(width + "x" + height)
                            .show()
                        if (window.Janus.webRTCAdapter.browserDetails.browser === "firefox") {
                            // Firefox Stable has a bug: width and height are not immediately available after a playing
                            setTimeout(function () {
                                var width = $("#remotevideo" + remoteFeed.rfindex).get(0).videoWidth
                                var height = $("#remotevideo" + remoteFeed.rfindex).get(0).videoHeight
                                $("#curres" + remoteFeed.rfindex)
                                    .removeClass("hide")
                                    .text(width + "x" + height)
                                    .show()
                            }, 2000)
                        }
                    })
                }
                window.Janus.attachMediaStream($("#remotevideo" + remoteFeed.rfindex).get(0), stream)
                var videoTracks = stream.getVideoTracks()
                if (!videoTracks || videoTracks.length === 0) {
                    // No remote video
                    $("#remotevideo" + remoteFeed.rfindex).hide()
                    if ($("#videoremote" + remoteFeed.rfindex + " .no-video-container").length === 0) {
                        $("#videoremote" + remoteFeed.rfindex).append(
                            '<div class="no-video-container">' +
                                '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                '<span class="no-video-text">No remote video available</span>' +
                                "</div>"
                        )
                    }
                } else {
                    $("#videoremote" + remoteFeed.rfindex + " .no-video-container").remove()
                    $("#remotevideo" + remoteFeed.rfindex)
                        .removeClass("hide")
                        .show()
                }
                if (!addButtons) return
                if (
                    window.Janus.webRTCAdapter.browserDetails.browser === "chrome" ||
                    window.Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
                    window.Janus.webRTCAdapter.browserDetails.browser === "safari"
                ) {
                    $("#curbitrate" + remoteFeed.rfindex)
                        .removeClass("hide")
                        .show()
                    this.bitrateTimer[remoteFeed.rfindex] = setInterval(function () {
                        // Display updated bitrate, if supported
                        var bitrate = remoteFeed.getBitrate()
                        $("#curbitrate" + remoteFeed.rfindex).text(bitrate)
                        // Check if the resolution changed too
                        var width = $("#remotevideo" + remoteFeed.rfindex).get(0).videoWidth
                        var height = $("#remotevideo" + remoteFeed.rfindex).get(0).videoHeight
                        if (width > 0 && height > 0)
                            $("#curres" + remoteFeed.rfindex)
                                .removeClass("hide")
                                .text(width + "x" + height)
                                .show()
                    }, 1000)
                }
            },
            oncleanup: () => {
                window.Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::")
                if (remoteFeed.spinner) remoteFeed.spinner.stop()
                remoteFeed.spinner = null
                $("#remotevideo" + remoteFeed.rfindex).remove()
                $("#waitingvideo" + remoteFeed.rfindex).remove()
                $("#novideo" + remoteFeed.rfindex).remove()
                $("#curbitrate" + remoteFeed.rfindex).remove()
                $("#curres" + remoteFeed.rfindex).remove()
                if (this.bitrateTimer[remoteFeed.rfindex]) clearInterval(this.bitrateTimer[remoteFeed.rfindex])
                this.bitrateTimer[remoteFeed.rfindex] = null
                remoteFeed.simulcastStarted = false
                $("#simulcast" + remoteFeed.rfindex).remove()
            },
        })
    }
}
