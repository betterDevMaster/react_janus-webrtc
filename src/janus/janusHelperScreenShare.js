import JanusHelper from "./janusHelper"

export default class JanusHelperScreenShare extends JanusHelper {
    init(dispatch, roomType, pluginName) {
        super.init(dispatch, roomType, pluginName)
    }
    start(roomName) {
        this.myroom = roomName
        this.capture = null
        this.role = null
        this.source = null
        this.room = null
        super.start()
    }
    stop() {
        super.stop()
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
    onMessage(msg, jsep, result) {
        window.Janus.debug(" ::: Got a message (publisher) :::", msg)
        var event = msg["videoroom"]
        window.Janus.debug("Event: " + event)
        console.log("ScreenShareHelper: onMessage: =========== ", msg, jsep, result)

        if (event) {
            if (event === "joined") {
                this.myid = msg["id"]
                // $("#session").html(room)
                // $("#title").html(msg["description"])
                window.Janus.log("Successfully joined room " + msg["room"] + " with ID " + this.myid)
                if (this.role === "publisher") {
                    // This is our session, publish our stream
                    window.Janus.debug("Negotiating WebRTC stream for our screen (capture " + this.capture + ")")
                    this.janusPlugin.createOffer({
                        media: {
                            video: this.capture,
                            audioSend: true,
                            videoRecv: false,
                            // data: true,
                        }, // Screen sharing Publishers are sendonly
                        success: (jsep) => {
                            window.Janus.debug("Got publisher SDP!", jsep)
                            var publish = {
                                request: "configure",
                                audio: true,
                                video: true,
                            }
                            this.janusPlugin.send({ message: publish, jsep: jsep })
                        },
                        error: (error) => {
                            window.Janus.error("WebRTC error:", error)
                            window.bootbox.alert("WebRTC error... " + error.message)
                        },
                    })
                } else {
                    // We're just watching a session, any feed to attach to?
                    if (msg["publishers"]) {
                        window.Janus.debug("Got a list of available publishers/feeds:", msg["publishers"])
                        this.addRemoteStreams(msg["publishers"])
                    }
                }
            } else if (event === "event") {
                // Any feed to attach to?
                if (this.role === "listener" && msg["publishers"]) {
                    window.Janus.debug("Got a list of available publishers/feeds:", msg["publishers"])
                    this.addRemoteStreams(msg["publishers"])
                } else if (msg["leaving"]) {
                    // One of the publishers has gone away?
                    var leaving = msg["leaving"]
                    window.Janus.log("Publisher left: " + leaving)
                    if (this.role === "listener" && msg["leaving"] === this.source) {
                        window.bootbox.alert("The screen sharing session is over, the publisher left", function () {
                            window.location.reload()
                        })
                    }
                } else if (msg["error"]) {
                    window.bootbox.alert(msg["error"])
                }
            }
        }
        if (jsep) {
            window.Janus.debug("Handling SDP as well...", jsep)
            // console.log("screenShare: onMessage: jsep: ================= ", jsep)
            // this.janusPlugin.createAnswer({
            //     jsep: jsep,
            //     media: { audio: false, video: false, data: true }, // We only use datachannels
            //     success: (jsep) => {
            //         window.Janus.debug("Got SDP!", jsep)
            //         var body = { request: "ack" }
            //         this.janusPlugin.send({ message: body, jsep: jsep })
            //     },
            //     error: (error) => {
            //         window.Janus.error("WebRTC error:", error)
            //         window.bootbox.alert("WebRTC error... " + error.message)
            //     },
            // })
            this.janusPlugin.handleRemoteJsep({ jsep: jsep })
        }
    }
    onWebrtcStateChange(on) {
        // this.dispatch({ type: "JANUS_STATE", value: "CONNECTED" })
        window.Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now")
        if (on) {
            window.bootbox.alert(
                "Your screen sharing session just started: pass the <b>" +
                    this.room +
                    "</b> session identifier to those who want to attend."
            )
        } else {
            window.bootbox.alert("Your screen sharing session just stopped.", function () {
                this.session.destroy()
                window.location.reload()
            })
        }

        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED", pluginType: this.pluginType })
    }
    onLocalStream(stream) {
        this.mystream = stream
        this.dispatch({ type: "JANUS_STATE", value: "RUNNING", pluginType: this.pluginType })
        this.dispatch({ type: "JANUS_SHAREDLOCALSTREAM", sharedLocal: stream })
    }
    onRemoteStream(stream) {
        window.Janus.debug(" ::: Got a remote stream :::", stream)
        console.log("screenShare: remoteStream: ================= ", stream, this.mystream)
        // this.dispatch({ type: "JANUS_SHAREDREMOTESTREAM", sharedRemote: stream })
    }
    onData(data) {
        window.Janus.debug("We got data from the JanusHelper!", data)
        console.log("screenHelper: ============ ", data)

        this.dispatch({ type: "JANUS_MESSAGE", message: data })
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
        // Create a new room
        if (username === "") {
            window.bootbox.alert("Please insert a description for the room")
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
                    console.log("ScreenShare: onEscape: ---------- ")
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
                if (event) {
                    // Our own screen sharing session has been created, join it
                    this.room = result["room"]
                    window.Janus.log("Screen sharing session created: " + this.room)
                    this.myusername = window.Janus.randomString(12)
                    var register = {
                        request: "join",
                        room: this.room,
                        ptype: "publisher",
                        display: this.myusername,
                    }
                    this.janusPlugin.send({ message: register })

                    // var message = {
                    //     textroom: "message",
                    //     transaction: window.Janus.randomString(12),
                    //     room: this.myroom,
                    //     text: this.room,
                    // }
                    // // Note: messages are always acknowledged by default. This means that you'll
                    // // always receive a confirmation back that the message has been received by the
                    // // server and forwarded to the recipients. If you do not want this to happen,
                    // // just add an ack:false property to the message above, and server won't send
                    // // you a response (meaning you just have to hope it succeeded).
                    // this.janusPlugin.data({
                    //     text: JSON.stringify(message),
                    //     error: (reason) => {
                    //         window.bootbox.alert(reason)
                    //     },
                    //     success: function () {
                    //         console.log("screenshare: datasend: ===============", message)
                    //     },
                    // })
                    // this.joinScreen(this.room)
                }
            },
        })
    }

    checkEnterJoin(field, event) {
        var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
        if (theCode === 13) {
            this.joinScreen(this.room)
            return false
        } else {
            return true
        }
    }

    joinScreen(roomid) {
        // Join an existing screen sharing session
        if (isNaN(roomid)) {
            window.bootbox.alert("Session identifiers are numeric only")
            return
        }
        this.role = "listener"
        this.myusername = window.Janus.randomString(12)
        var register = {
            request: "join",
            room: roomid,
            ptype: "publisher",
            display: this.myusername,
        }
        this.janusPlugin.send({ message: register })
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
    newRemoteFeed(id, display, audio, video) {
        // A new feed has been published, create a new plugin handle and attach to it as a subscriber
        var remoteFeed = null
        this.source = id
        console.log("newRemoteFeed: id: display: ============== ", id, display)

        this.session.attach({
            plugin: this.pluginName,
            opaqueId: this.opaqueId,
            success: (pluginHandle) => {
                remoteFeed = pluginHandle
                window.Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")")
                window.Janus.log("  -- This is a subscriber")
                // We wait for the plugin to send us an offer
                var listen = {
                    request: "join",
                    room: this.myroom,
                    ptype: "listener",
                    feed: id,
                }
                console.log("newRemoteFeed: listen: ============== ", listen)
                remoteFeed.send({ message: listen })
            },
            error: (error) => {
                window.Janus.error("Error attaching plugin in RemoteStream...", error)
                window.bootbox.alert("Error attaching plugin in RemoteStream... " + error)
            },
            onmessage: (msg, jsep) => {
                window.Janus.debug(" ::: Got a message (listener) :::", msg)
                console.log("newRemoteFeed: onmessage: ============== ", msg)

                var event = msg["videoroom"]
                window.Janus.debug("Event: " + event)

                if (event) {
                    if (event === "attached") {
                        // Subscriber created and attached
                        // this.dispatch({ type: "JANUS_SHAREDREMOTESTREAM", remote: this.feeds })
                        window.Janus.log("Successfully attached to feed " + id + " (" + display + ") in room " + msg["room"])
                    } else {
                        // What has just happened?
                    }
                }
                if (jsep) {
                    window.Janus.debug("Handling SDP as well...", jsep)
                    // Answer and attach
                    remoteFeed.createAnswer({
                        jsep: jsep,
                        media: { audioSend: false, videoSend: false }, // We want recvonly audio/video
                        success: (jsep) => {
                            window.Janus.debug("Got SDP!", jsep)
                            var body = { request: "start", room: this.myroom }
                            remoteFeed.send({ message: body, jsep: jsep })
                        },
                        error: (error) => {
                            window.Janus.error("WebRTC error:", error)
                            window.bootbox.alert("WebRTC error... " + error.message)
                        },
                    })
                }
            },
            iceState: (state) => {
                window.Janus.log("ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state)
            },
            webrtcState: (on) => {},
            onlocalstream: (stream) => {
                // The subscriber stream is recvonly, we don't expect anything here
            },
            onremotestream: (stream) => {
                window.Janus.debug("Remote feed #" + remoteFeed.rfindex + ", stream:", stream)
                if (stream && stream !== undefined && this.feeds[remoteFeed.rfindex]) {
                    this.feeds[remoteFeed.rfindex].stream = stream
                    this.feeds[remoteFeed.rfindex].videoTracks = stream.getVideoTracks()

                    // this.dispatch({ type: "JANUS_SHAREDREMOTESTREAM", remote: this.feeds })
                    this.dispatch({ type: "JANUS_SHAREDREMOTESTREAM", remote: stream })
                }
                if (!this.feeds[remoteFeed.rfindex]) window.location.href = "/"
            },
            oncleanup: () => {
                this.removeRemoteStream(remoteFeed.rfindex)
            },
        })
    }
}
