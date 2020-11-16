import JanusHelper from "./janusHelper"

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
        console.log("start: ------------- ", this.myroom)
        super.start()
        // if (getQueryStringValue("room") !== "") myroom = parseInt(getQueryStringValue("room"))
        this.feeds = []
        this.bitrateTimer = []
    }
    stop() {
        if (this.session) this.session.destroy()
    }
    registerUsername(username) {
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
        console.log(register)
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
    }
}
