import React, { useRef, useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Header from "../widget/header"
import Footer from "../widget/footer"
import WebRTC from "../webRTC"
import * as Constraint from "../store/constraint"
import * as $ from "jquery"

export default function VideoCallPage(props) {
    const janusReducer = useSelector((state) => state.janusReducer)
    const videoCallReducer = useSelector((state) => state.videoCall)
    const [attachData, setAttachData] = useState({
        startFlag: false,
        detailsFlag: false,
        videoCallFlag: false,
        loginFlag: false,
        registerFlag: false,
        callFlag: false,
        peerFlag: false,
        youokFlag: false,
        phoneFlag: false,
        videosFlag: false,
        toggleaudioFlag: false,
        togglevideoFlag: false,
        curresFlag: false,
        bitrateFlag: false,
        curbitrateFlag: false,
        bitrateFlag: false,
        userNameFlag: false,
        userNameValue: "",
        peerValue: "",
    })
    const dispatch = useDispatch()
    const userNameRef = useRef(null)
    const peerRef = useRef(null)
    const dataSendRef = useRef(null)
    const type = Constraint.VIDEO_CALL

    useEffect(() => {
        WebRTC.getInstance().initJanus(type)
    }, [])

    useEffect(() => {
        if (janusReducer.attachSuccess) {
            WebRTC.getInstance().videocall = janusReducer.pluginHandle
            window.Janus.log(
                "Plugin attached! (" + WebRTC.getInstance().videocall.getPlugin() + ", id=" + WebRTC.getInstance().videocall.getId() + ")"
            )
            setAttachData({
                ...attachData,
                startFlag: true,
                detailsFlag: true,
                videoCallFlag: true,
                loginFlag: true,
                videosFlag: true,
            })
            userNameRef.current.focus()
        }
        if (janusReducer.attachError) {
            window.Janus.error("  -- Error attaching plugin...", janusReducer.error)
            window.bootbox.alert("  -- Error attaching plugin... " + janusReducer.error)
        }
        if (janusReducer.attachConsentDialog) {
            window.Janus.debug("Consent dialog should be " + (janusReducer.on ? "on" : "off") + " now")

            if (janusReducer.on) {
                // Darken screen and show hint
                window.$.blockUI({
                    message: '<div><img src="img/up_arrow.png"/></div>',
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
        if (janusReducer.attachIceState) {
            window.Janus.log("ICE state changed to " + janusReducer.state)
        }
        if (janusReducer.attachMediaState) {
            window.Janus.log("Janus " + (janusReducer.on ? "started" : "stopped") + " receiving our " + janusReducer.medium)
        }
        if (janusReducer.webrtcState) {
            window.Janus.log("Janus says our WebRTC PeerConnection is " + (janusReducer.on ? "up" : "down") + " now")
            window.$.unblockUI()
        }
        if (janusReducer.onMessage) {
            let msg = janusReducer.msg
            let jsep = janusReducer.jsep
            let result = msg["result"]
            window.Janus.debug(" ::: Got a message :::", msg)
            // console.log("onmessage: ---------- ", msg, jsep, result)
            if (result) {
                if (result["list"]) {
                    vcResult(result["list"])
                } else if (result["event"]) {
                    var event = result["event"]
                    // console.log("event: ------------ ", event)
                    if (event === "registered") {
                        vcEventRegistered(result["username"])
                    } else if (event === "calling") {
                        vcEventCalling()
                    } else if (event === "incomingcall") {
                        vcEventIncomingCall(result["username"], jsep)
                    } else if (event === "accepted") {
                        vcEventAccepted(result["username"], jsep)
                    } else if (event === "update") {
                        vcEventUpdate(jsep)
                    } else if (event === "hangup") {
                        vcEventHangUp(result["username"], result["reason"])
                    } else if (event === "simulcast") {
                        vcEventSimulCast(result["substream"], result["temporal"], result["videocodec"])
                    }
                }
            } else {
                vcResultError(msg["error"])
            }
        }
        if (janusReducer.onLocalstream) {
            window.Janus.debug(" ::: Got a local stream :::", janusReducer.stream)

            $("#videos").removeClass("hide").show()
            if ($("#myvideo").length === 0)
                $("#videoleft").append(
                    '<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>'
                )
            window.Janus.attachMediaStream($("#myvideo").get(0), janusReducer.stream)
            $("#myvideo").get(0).muted = "muted"
            if (
                WebRTC.getInstance().videocall.webrtcStuff.pc.iceConnectionState !== "completed" &&
                WebRTC.getInstance().videocall.webrtcStuff.pc.iceConnectionState !== "connected"
            ) {
                window.$.blockUI({
                    message: "<b>Publishing...</b>",
                    css: {
                        border: "none",
                        backgroundColor: "transparent",
                        color: "white",
                    },
                })
                // No remote video yet
                $("#videoright").append('<video class="rounded centered" id="waitingvideo" width="100%" height="100%" />')
                if (WebRTC.getInstance().spinner === null) {
                    var target = document.getElementById("videoright")
                    WebRTC.getInstance().spinner = new window.Spinner({
                        top: 100,
                    }).spin(target)
                } else {
                    WebRTC.getInstance().spinner.spin()
                }
            }
            var videoTracks = janusReducer.stream.getVideoTracks()
            if (!videoTracks || videoTracks.length === 0) {
                // No webcam
                $("#myvideo").hide()
                if ($("#videoleft .no-video-container").length === 0) {
                    $("#videoleft").append(
                        '<div class="no-video-container">' +
                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                            '<span class="no-video-text">No webcam available</span>' +
                            "</div>"
                    )
                }
            } else {
                $("#videoleft .no-video-container").remove()
                $("#myvideo").removeClass("hide").show()
            }
        }
        if (janusReducer.onRemotestream) {
            window.Janus.debug(" ::: Got a remote stream :::", janusReducer.stream)
            var addButtons = false
            if ($("#remotevideo").length === 0) {
                addButtons = true
                $("#videoright").append(
                    '<video class="rounded centered hide" id="remotevideo" width="100%" height="100%" autoplay playsinline/>'
                )
                // Show the video, hide the spinner and show the resolution when we get a playing event
                $("#remotevideo").bind("playing", function () {
                    $("#waitingvideo").remove()
                    if (this.videoWidth) $("#remotevideo").removeClass("hide").show()
                    if (WebRTC.getInstance().spinner) WebRTC.getInstance().spinner.stop()
                    WebRTC.getInstance().spinner = null
                    var width = this.videoWidth
                    var height = this.videoHeight
                    $("#curres")
                        .removeClass("hide")
                        .text(width + "x" + height)
                        .show()
                })
                $("#callee").removeClass("hide").html(WebRTC.getInstance().yourusername).show()
            }
            window.Janus.attachMediaStream($("#remotevideo").get(0), janusReducer.stream)
            var videoTracks = janusReducer.stream.getVideoTracks()
            if (!videoTracks || videoTracks.length === 0) {
                // No remote video
                $("#remotevideo").hide()
                if ($("#videoright .no-video-container").length === 0) {
                    $("#videoright").append(
                        '<div class="no-video-container">' +
                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                            '<span class="no-video-text">No remote video available</span>' +
                            "</div>"
                    )
                }
            } else {
                $("#videoright .no-video-container").remove()
                $("#remotevideo").removeClass("hide").show()
            }
            if (!addButtons) return
            // Enable audio/video buttons and bitrate limiter
            WebRTC.getInstance().audioenabled = true
            WebRTC.getInstance().videoenabled = true

            // setAttachData({
            //     ...attachData,
            //     videosFlag: false,
            //     peerFlag: false,
            //     callFlag: false,
            //     togglevideoFlag: true,
            //     toggleaudioFlag: true,
            //     bitrateFlag: true,
            //     curresFlag: false,
            //     peerValue: "",
            // })

            $("#toggleaudio")
                .html("Disable audio")
                .removeClass("btn-success")
                .addClass("btn-danger")
                .unbind("click")
                .removeAttr("disabled")
                .click(function () {
                    WebRTC.getInstance().audioenabled = !WebRTC.getInstance().audioenabled
                    if (WebRTC.getInstance().audioenabled)
                        $("#toggleaudio").html("Disable audio").removeClass("btn-success").addClass("btn-danger")
                    else $("#toggleaudio").html("Enable audio").removeClass("btn-danger").addClass("btn-success")
                    WebRTC.getInstance().videocall.send({
                        message: {
                            request: "set",
                            audio: WebRTC.getInstance().audioenabled,
                        },
                    })
                })
            $("#togglevideo")
                .html("Disable video")
                .removeClass("btn-success")
                .addClass("btn-danger")
                .unbind("click")
                .removeAttr("disabled")
                .click(function () {
                    WebRTC.getInstance().videoenabled = !WebRTC.getInstance().videoenabled
                    if (WebRTC.getInstance().videoenabled)
                        $("#togglevideo").html("Disable video").removeClass("btn-success").addClass("btn-danger")
                    else $("#togglevideo").html("Enable video").removeClass("btn-danger").addClass("btn-success")
                    WebRTC.getInstance().videocall.send({
                        message: {
                            request: "set",
                            video: WebRTC.getInstance().videoenabled,
                        },
                    })
                })
            $("#toggleaudio").parent().removeClass("hide").show()
            $("#bitrateset").html("Bandwidth")
            $("#bitrate a")
                .unbind("click")
                .removeAttr("disabled")
                .click(function () {
                    var id = $(this).attr("id")
                    var bitrate = parseInt(id) * 1000
                    if (bitrate === 0) {
                        window.Janus.log("Not limiting bandwidth via REMB")
                    } else {
                        window.Janus.log("Capping bandwidth to " + bitrate + " via REMB")
                    }
                    $("#bitrateset").html($(this).html()).parent().removeClass("open")
                    WebRTC.getInstance().videocall.send({
                        message: {
                            request: "set",
                            bitrate: bitrate,
                        },
                    })
                    return false
                })
            if (
                window.Janus.webRTCAdapter.browserDetails.browser === "chrome" ||
                window.Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
                window.Janus.webRTCAdapter.browserDetails.browser === "safari"
            ) {
                $("#curbitrate").removeClass("hide").show()
                WebRTC.getInstance().bitrateTimer = setInterval(function () {
                    // Display updated bitrate, if supported
                    var bitrate = WebRTC.getInstance().videocall.getBitrate()
                    $("#curbitrate").text(bitrate)
                    // Check if the resolution changed too
                    var width = $("#remotevideo").get(0).videoWidth
                    var height = $("#remotevideo").get(0).videoHeight
                    if (width > 0 && height > 0)
                        $("#curres")
                            .removeClass("hide")
                            .text(width + "x" + height)
                            .show()
                }, 1000)
            }
        }
        if (janusReducer.onDataOpen) {
            window.Janus.log("The DataChannel is available!")
            $("#videos").removeClass("hide").show()
            $("#datasend").removeAttr("disabled")
        }
        if (janusReducer.onData) {
            window.Janus.debug("We got data from the DataChannel!", janusReducer.data)
            $("#datarecv").val(janusReducer.data)
        }
        if (janusReducer.onCleanUp) {
            window.Janus.log(" ::: Got a cleanup notification :::")

            // var myVideoDom = document.querySelector("#myvideo")
            // myVideoDom.parentNode.removeChild(myVideoDom)
            // var remotevideo = document.querySelector("#myvideo")
            // remotevideo.parentNode.removeChild(remotevideo)

            // setAttachData({
            //     ...attachData,
            //     videosFlag: true,
            //     peerFlag: true,
            //     peerValue: "",
            //     toggleaudioFlag: true,
            //     togglevideoFlag: true,
            //     bitrateFlag: true,
            //     curbitrateFlag: true,
            //     curresFlag: true,
            // })

            $("#myvideo").remove()
            $("#remotevideo").remove()
            // $("#videoleft").parent().unblock()
            window.$.unblockUI()
            $(".no-video-container").remove()
            $("#callee").empty().hide()
            WebRTC.getInstance().yourusername = null
            $("#curbitrate").hide()
            $("#curres").hide()
            $("#videos").hide()
            $("#toggleaudio").attr("disabled", true)
            $("#togglevideo").attr("disabled", true)
            $("#bitrate").attr("disabled", true)
            $("#curbitrate").hide()
            $("#curres").hide()
            if (WebRTC.getInstance().bitrateTimer) clearInterval(WebRTC.getInstance().bitrateTimer)
            WebRTC.getInstance().bitrateTimer = null
            $("#waitingvideo").remove()
            $("#videos").hide()
            WebRTC.getInstance().simulcastStarted = false
            $("#simulcast").remove()
            $("#peer").removeAttr("disabled").val("")
            // console.log("oncleanup: ------------ ")

            $("#call")
                .removeAttr("disabled")
                .html("Call")
                .removeClass("btn-danger")
                .addClass("btn-success")
                .unbind("click")
                .click(WebRTC.getInstance().doCall)
        }
    }, [janusReducer, videoCallReducer])

    const handleCheckEnter = (event) => {
        var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
        if (theCode === 13) {
            if (event.target.id === "username") handleRegister()
            else if (event.target.id === "peer") handleCall()
            else if (event.target.id === "datasend") handleSendData()
            return false
        } else {
            return true
        }
    }

    const handleRegister = () => {
        setAttachData({ ...attachData, registerFlag: true })
        const uName = userNameRef.current.value

        if (uName === "") {
            window.bootbox.alert("Insert a username to register (e.g., pippo)")
            setAttachData({
                ...attachData,
                registerFlag: false,
                userNameFlag: false,
            })
            return
        }
        if (/[^a-zA-Z0-9]/.test(uName)) {
            window.bootbox.alert("Input is not alphanumeric")
            setAttachData({
                ...attachData,
                registerFlag: false,
                userNameFlag: false,
                userNameValue: "",
            })
            return
        }
        var register = { request: "register", username: uName }
        WebRTC.getInstance().videocall.send({ message: register })
    }

    const handleCall = () => {
        setAttachData({ ...attachData, callFlag: true })
        const uName = peerRef.current.value
        if (uName === "") {
            window.bootbox.alert("Insert a username to call (e.g., pluto)")
            setAttachData({ ...attachData, callFlag: false })
            return
        }
        if (/[^a-zA-Z0-9]/.test(uName)) {
            window.bootbox.alert("Input is not alphanumeric")
            setAttachData({ ...attachData, callFlag: false, peerValue: "" })
            return
        }
        console.log("handleCall : ------- ", uName)
        WebRTC.getInstance().videocall.createOffer({
            // By default, it's sendrecv for audio and video...
            media: { data: true }, // ... let's negotiate data channels as well
            // If you want to test simulcasting (Chrome and Firefox only), then
            // pass a ?simulcast=true when opening this demo page: it will turn
            // the following 'simulcast' property to pass to janus.js to true
            simulcast: WebRTC.getInstance().doSimulcast,
            success: function (jsep) {
                window.Janus.debug("Got SDP!", jsep)
                var body = { request: "call", username: uName }
                WebRTC.getInstance().videocall.send({
                    message: body,
                    jsep: jsep,
                })
            },
            error: function (error) {
                window.Janus.error("WebRTC error...", error)
                window.bootbox.alert("WebRTC error... " + error.message)
            },
        })
    }

    const handleSendData = () => {
        const data = dataSendRef.current.value
        if (data === "") {
            window.bootbox.alert("Insert a message to send on the DataChannel to your peer")
            return
        }
        WebRTC.getInstance().videocall.data({
            text: data,
            error: function (reason) {
                window.bootbox.alert(reason)
            },
            success: function () {
                dataSendRef.current.value = ""
            },
        })
    }

    const handleInputValueChange = (e) => {
        if (e.target.id === "username") setAttachData({ ...attachData, userNameValue: e.target.value })
        if (e.target.id === "peer") setAttachData({ ...attachData, peerValue: e.target.value })
    }

    const handleToogleAudio = (e) => {}

    const handleToogleVideo = (e) => {}

    const vcResult = (list) => {
        window.Janus.debug("Got a list of registered peers:", list)
        for (var mp in list) {
            window.Janus.debug("  >> [" + list[mp] + "]")
        }
    }

    const vcResultError = (error) => {
        // FIXME Error?
        window.bootbox.alert(error)
        if (error.indexOf("already taken") > 0) {
            // FIXME Use status codes...
            setAttachData({
                ...attachData,
                userNameFlag: false,
                registerFlag: false,
                userNameValue: "",
            })
        }
        // TODO Reset status
        WebRTC.getInstance().videocall.hangup()
        if (WebRTC.getInstance().spinner) WebRTC.getInstance().spinner.stop()

        // var el = document.querySelector("#waitingvideo")
        // el.parentNode.removeChild(el)
        $("#waitingvideo").remove()

        setAttachData({
            ...attachData,
            videosFlag: false,
            peerFlag: false,
            callFlag: false,
            togglevideoFlag: true,
            toggleaudioFlag: true,
            bitrateFlag: true,
            curresFlag: false,
            peerValue: "",
        })

        if (WebRTC.getInstance().bitrateTimer) clearInterval(WebRTC.getInstance().bitrateTimer)
        WebRTC.getInstance().bitrateTimer = null
    }

    const vcEventRegistered = (username) => {
        WebRTC.getInstance().myusername = username
        window.Janus.log("Successfully registered as " + username + "!")
        WebRTC.getInstance().videocall.send({
            message: { request: "list" },
        })
        setAttachData({
            ...attachData,
            youokFlag: true,
            phoneFlag: true,
            userNameFlag: true,
        })
        peerRef.current.focus()
    }

    const vcEventCalling = () => {
        window.Janus.log("Waiting for the peer to answer...")
        // TODO Any ringtone?
        window.bootbox.alert("Waiting for the peer to answer...")
    }

    const vcEventIncomingCall = (username, jsep) => {
        window.Janus.log("Incoming call from " + username + "!")
        WebRTC.getInstance().yourusername = username
        // Notify user
        window.bootbox.hideAll()

        WebRTC.getInstance().incoming = window.bootbox.dialog({
            message: "Incoming call from " + username + "!",
            title: "Incoming call",
            closeButton: false,
            buttons: {
                success: {
                    label: "Answer",
                    className: "btn-success",
                    callback: function () {
                        WebRTC.getInstance().incoming = null
                        setAttachData({
                            ...attachData,
                            peerValue: username,
                            peerFlag: true,
                        })
                        WebRTC.getInstance().videocall.createAnswer({
                            jsep: jsep,
                            // No media provided: by default, it's sendrecv for audio and video
                            media: { data: true },
                            // Let's negotiate data channels as well
                            // If you want to test simulcasting (Chrome and Firefox only), then
                            // pass a ?simulcast=true when opening this demo page: it will turn
                            // the following 'simulcast' property to pass to janus.js to true
                            simulcast: WebRTC.getInstance().doSimulcast,
                            success: function (jsep) {
                                window.Janus.debug("Got SDP!", jsep)
                                var body = { request: "accept" }
                                WebRTC.getInstance().videocall.send({
                                    message: body,
                                    jsep: jsep,
                                })
                                setAttachData({
                                    ...attachData,
                                    callFlag: true,
                                })
                            },
                            error: function (error) {
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
                        handleCall()
                    },
                },
            },
        })
    }

    const vcEventAccepted = (username, jsep) => {
        window.bootbox.hideAll()
        if (!username) {
            window.Janus.log("Call started!")
        } else {
            window.Janus.log(username + " accepted the call!")
            WebRTC.getInstance().yourusername = username
        }
        // Video call can start
        if (jsep)
            WebRTC.getInstance().videocall.handleRemoteJsep({
                jsep: jsep,
            })

        setAttachData({
            ...attachData,
            callFlag: true,
        })
    }

    const vcEventUpdate = (jsep) => {
        // An 'update' event may be used to provide renegotiation attempts\
        if (jsep) {
            if (jsep.type === "answer") {
                WebRTC.getInstance().videocall.handleRemoteJsep({
                    jsep: jsep,
                })
            } else {
                WebRTC.getInstance().videocall.createAnswer({
                    jsep: jsep,
                    media: { data: true }, // Let's negotiate data channels as well
                    success: function (jsep) {
                        window.Janus.debug("Got SDP!", jsep)
                        var body = { request: "set" }
                        WebRTC.getInstance().videocall.send({
                            message: body,
                            jsep: jsep,
                        })
                    },
                    error: function (error) {
                        window.Janus.error("WebRTC error:", error)
                        window.bootbox.alert("WebRTC error... " + error.message)
                    },
                })
            }
        }
    }

    const vcEventHangUp = (username, reason) => {
        window.Janus.log("Call hung up by " + username + " (" + reason + ")!")
        // Reset status
        window.bootbox.hideAll()
        WebRTC.getInstance().videocall.hangup()
        if (WebRTC.getInstance().spinner) WebRTC.getInstance().spinner.stop()
        // var el = document.querySelector("#waitingvideo")
        // el.parentNode.removeChild(el)
        $("#waitingvideo").remove()
        setAttachData({
            ...attachData,
            videosFlag: true,
            peerFlag: true,
            peerValue: "",
            toggleaudioFlag: true,
            togglevideoFlag: true,
            bitrateFlag: true,
            curbitrateFlag: true,
            curresFlag: true,
        })
    }

    const vcEventSimulCast = (substream, temporal, videocodec) => {
        // Is simulcast in place?
        if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
            if (!WebRTC.getInstance().simulcastStarted) {
                WebRTC.getInstance().simulcastStarted = true
                WebRTC.getInstance().addSimulcastButtons(videocodec === "vp8" || videocodec === "h264")
            }
            // We just received notice that there's been a switch, update the buttons
            WebRTC.getInstance().updateSimulcastButtons(substream, temporal)
        }
    }

    return (
        <div>
            <a href="https://github.com/meetecho/janus-gateway">
                <img
                    style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        border: "0",
                        zIndex: "1001",
                    }}
                    src="https://s3.amazonaws.com/github/ribbons/forkme_left_darkblue_121621.png"
                    alt="Fork me on GitHub"
                />
            </a>

            <nav className="navbar navbar-default navbar-static-top">
                <Header />
            </nav>

            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="page-header">
                            <h1>
                                Plugin Demo: Video Call
                                <button
                                    className="btn btn-default"
                                    autoComplete="off"
                                    id="start"
                                    disabled={attachData.startFlag}
                                    onClick={() => WebRTC.getInstance().startJanus(dispatch, type)}
                                >
                                    Start
                                </button>
                            </h1>
                        </div>
                        <div
                            className="container"
                            id="details"
                            style={{
                                display: attachData.detailsFlag ? "none" : "block",
                            }}
                        >
                            <div className="row">
                                <div className="col-md-12">
                                    <h3>Demo details</h3>
                                    <p>
                                        This Video Call demo is basically an example of how you can achieve a scenario like the famous
                                        AppRTC demo but with media flowing through Janus. It basically is an extension to the Echo Test
                                        demo, where in this case the media packets and statistics are forwarded between the two involved
                                        peers.
                                    </p>
                                    <p>
                                        Using the demo is simple. Just choose a simple username to register at the plugin, and then either
                                        call another user (provided you know which username was picked) or share your username with a friend
                                        and wait for a call. At that point, you'll be in a video call with the remote peer, and you'll have
                                        the same controls the Echo Test demo provides to try and control the media: that is, a button to
                                        mute/unmute your audio and video, and a knob to try and limit your bandwidth. If the browser
                                        supports it, you'll also get a view of the bandwidth currently used by your peer for the video
                                        stream.
                                    </p>
                                    <p>
                                        If you're interested in testing how simulcasting can be used within the context of this sample
                                        videocall application, just pass the
                                        <code>?simulcast=true</code> query string to the url of this page and reload it. If you're using a
                                        browser that does support simulcasting (Chrome or Firefox) and the call will end up using VP8,
                                        you'll send multiple qualities of the video you're capturing. Notice that simulcasting will only
                                        occur if the browser thinks there is enough bandwidth, so you'll have to play with the Bandwidth
                                        selector to increase it. New buttons to play with the feature will automatically appear for your
                                        peer; at the same time, if your peer enabled simulcasting new buttons will appear for you when
                                        watching the remote stream. Notice that no simulcast support is needed for watching, only for
                                        publishing.
                                    </p>
                                    <p>
                                        A very simple chat based on Data Channels is available as well: just use the text area under your
                                        local video to send messages to your peer. Incoming messages will be displayed below the remote
                                        video instead.
                                    </p>
                                    <p>
                                        Press the <code>Start</code> button above to launch the demo.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            className={attachData.videoCallFlag ? "container" : "container hide"}
                            id="videocall"
                            style={{
                                display: attachData.videoCallFlag ? "block" : "none",
                            }}
                        >
                            <div className="row">
                                <div className="col-md-12">
                                    <div
                                        className={attachData.loginFlag ? "col-md-6 container" : "col-md-6 container hide"}
                                        id="login"
                                        style={{
                                            display: attachData.loginFlag ? "block" : "none",
                                        }}
                                    >
                                        <div className="input-group margin-bottom-sm">
                                            <span className="input-group-addon">
                                                <i className="fa fa-user fa-fw"></i>
                                            </span>
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder="Choose a username"
                                                autoComplete="off"
                                                id="username"
                                                ref={userNameRef}
                                                value={attachData.userNameValue}
                                                onChange={(e) => handleInputValueChange(e)}
                                                disabled={attachData.userNameFlag}
                                                onKeyPress={(e) => handleCheckEnter(e)}
                                            />
                                        </div>
                                        <button
                                            className="btn btn-success margin-bottom-sm"
                                            autoComplete="off"
                                            id="register"
                                            disabled={attachData.registerFlag}
                                            onClick={() => handleRegister()}
                                        >
                                            Register
                                        </button>
                                        <span className={attachData.youokFlag ? "label label-info" : "hide label label-info"} id="youok">
                                            {attachData.youokFlag ? `Registered as '${WebRTC.getInstance().myusername}'` : null}
                                        </span>
                                    </div>
                                    <div className={attachData.phoneFlag ? "col-md-6 container" : "col-md-6 container hide"} id="phone">
                                        <div className="input-group margin-bottom-sm">
                                            <span className="input-group-addon">
                                                <i className="fa fa-phone fa-fw"></i>
                                            </span>
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder="Who should we call?"
                                                autoComplete="off"
                                                id="peer"
                                                ref={peerRef}
                                                value={attachData.peerValue}
                                                onChange={(e) => handleInputValueChange(e)}
                                                disabled={attachData.peerFlag}
                                                onKeyPress={(e) => handleCheckEnter(e)}
                                            />
                                        </div>
                                        <button
                                            className={
                                                attachData.callFlag ? "btn btn-danger margin-bottom-sm" : "btn btn-success margin-bottom-sm"
                                            }
                                            autoComplete="off"
                                            id="call"
                                            disabled={attachData.callFlag}
                                            onClick={() => handleCall()}
                                        >
                                            {attachData.callFlag ? "Hangup" : "Call"}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <div id="videos" className={attachData.videosFlag ? "hide" : ""}>
                                        <div className="col-md-6">
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h3 className="panel-title">
                                                        Local Stream
                                                        <div className="btn-group btn-group-xs pull-right hide">
                                                            <button
                                                                className="btn btn-danger"
                                                                autoComplete="off"
                                                                id="toggleaudio"
                                                                disabled={attachData.toggleaudioFlag}
                                                                onClick={(e) => handleToogleAudio(e)}
                                                            >
                                                                Disable audio
                                                            </button>
                                                            <button
                                                                className="btn btn-danger"
                                                                autoComplete="off"
                                                                id="togglevideo"
                                                                disabled={attachData.togglevideoFlag}
                                                                onClick={(e) => handleToogleVideo(e)}
                                                            >
                                                                Disable video
                                                            </button>
                                                            <div className="btn-group btn-group-xs">
                                                                <button
                                                                    autoComplete="off"
                                                                    id="bitrateset"
                                                                    className="btn btn-primary dropdown-toggle"
                                                                    data-toggle="dropdown"
                                                                >
                                                                    Bandwidth
                                                                    <span className="caret"></span>
                                                                </button>
                                                                <ul
                                                                    id="bitrate"
                                                                    className="dropdown-menu"
                                                                    role="menu"
                                                                    disabled={attachData.bitrateFlag}
                                                                >
                                                                    <li>
                                                                        <a href="#" id="0">
                                                                            No limit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" id="128">
                                                                            Cap to 128kbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" id="256">
                                                                            Cap to 256kbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" id="512">
                                                                            Cap to 512kbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" id="1024">
                                                                            Cap to 1mbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" id="1500">
                                                                            Cap to 1.5mbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a href="#" id="2000">
                                                                            Cap to 2mbit
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </h3>
                                                </div>
                                                <div className="panel-body" id="videoleft"></div>
                                            </div>
                                            <div className="input-group margin-bottom-sm">
                                                <span className="input-group-addon">
                                                    <i className="fa fa-cloud-upload fa-fw"></i>
                                                </span>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    placeholder="Write a DataChannel message to your peer"
                                                    autoComplete="off"
                                                    id="datasend"
                                                    ref={dataSendRef}
                                                    onKeyPress={(e) => handleCheckEnter(e)}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h3 className="panel-title">
                                                        Remote Stream
                                                        <span className="label label-info hide" id="callee"></span>
                                                        <span
                                                            className={
                                                                attachData.curresFlag ? "label label-primary" : "label label-primary hide"
                                                            }
                                                            id="curres"
                                                        ></span>
                                                        <span
                                                            className={
                                                                attachData.curbitrateFlag ? "label label-info" : "label label-info hide"
                                                            }
                                                            id="curbitrate"
                                                        ></span>
                                                    </h3>
                                                </div>
                                                <div className="panel-body" id="videoright"></div>
                                            </div>
                                            <div className="input-group margin-bottom-sm">
                                                <span className="input-group-addon">
                                                    <i className="fa fa-cloud-download fa-fw"></i>
                                                </span>
                                                <input className="form-control" type="text" id="datarecv" disabled />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr />
                    <Footer />
                </div>
            </div>
        </div>
    )
}
