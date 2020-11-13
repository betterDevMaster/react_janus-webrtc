import React, { useRef, useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Header from "../widget/header"
import Footer from "../widget/footer"
import WebRTC from "../webRTC"
import * as Constraint from "../store/constraint"

export default function VideoCallPage(props) {
    const commonReducer = useSelector((state) => state.common)
    const videoCallReducer = useSelector((state) => state.videoCall)
    const [attachData, setAttachData] = useState({
        detailsFlag: false,
        videoCallFlag: false,
        loginFlag: false,
        register: false,
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
        if (commonReducer.attach) {
            setAttachData({
                ...attachData,
                detailsFlag: true,
                videoCallFlag: true,
                loginFlag: true,
                videosFlag: true,
            })
            userNameRef.current.focus()
        }
        if (videoCallReducer.registered) {
            WebRTC.getInstance().myusername = videoCallReducer.username
            window.Janus.log(
                "Successfully registered as " + videoCallReducer.username + "!"
            )
            WebRTC.getInstance().videocall.send({
                message: { request: "list" },
            })
            setAttachData({
                ...attachData,
                youokFlag: true,
                phoneFlag: true,
            })
            peerRef.current.focus()
        }
        if (videoCallReducer.calling) {
            window.Janus.log("Waiting for the peer to answer...")
            // TODO Any ringtone?
            window.bootbox.alert("Waiting for the peer to answer...")
        }
        if (videoCallReducer.incomingcall) {
            window.Janus.log(
                "Incoming call from " + videoCallReducer.username + "!"
            )
            WebRTC.getInstance().yourusername = videoCallReducer.username
            // Notify user
            window.bootbox.hideAll()

            WebRTC.getInstance().incoming = window.bootbox.dialog({
                message:
                    "Incoming call from " + videoCallReducer.username + "!",
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
                                peerValue: videoCallReducer.username,
                                peerFlag: true,
                            })
                            WebRTC.getInstance().videocall.createAnswer({
                                jsep: videoCallReducer.jsep,
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
                                    window.bootbox.alert(
                                        "WebRTC error... " + error.message
                                    )
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
        if (videoCallReducer.accepted) {
            window.bootbox.hideAll()
            var peer = videoCallReducer.username
            var jsep = videoCallReducer.jsep
            if (!peer) {
                window.Janus.log("Call started!")
            } else {
                window.Janus.log(peer + " accepted the call!")
                WebRTC.getInstance().yourusername = peer
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
        if (videoCallReducer.update) {
            // An 'update' event may be used to provide renegotiation attempts\
            let jsep = videoCallReducer.jsep
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
                            window.bootbox.alert(
                                "WebRTC error... " + error.message
                            )
                        },
                    })
                }
            }
        }
        if (videoCallReducer.hangup) {
            window.Janus.log(
                "Call hung up by " +
                    videoCallReducer.username +
                    " (" +
                    videoCallReducer.reason +
                    ")!"
            )
            // Reset status
            window.bootbox.hideAll()
            WebRTC.getInstance().videocall.hangup()
            if (WebRTC.getInstance().spinner)
                WebRTC.getInstance().spinner.stop()
            var el = document.querySelector("#waitingvideo")
            el.parentNode.removeChild(el)
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
        if (videoCallReducer.simulcast) {
            // Is simulcast in place?
            var substream = videoCallReducer.substream
            var temporal = videoCallReducer.temporal
            if (
                (substream !== null && substream !== undefined) ||
                (temporal !== null && temporal !== undefined)
            ) {
                if (!WebRTC.getInstance().simulcastStarted) {
                    WebRTC.getInstance().simulcastStarted = true
                    WebRTC.getInstance().addSimulcastButtons(
                        videoCallReducer.videocodec === "vp8" ||
                            videoCallReducer.videocodec === "h264"
                    )
                }
                // We just received notice that there's been a switch, update the buttons
                WebRTC.getInstance().updateSimulcastButtons(substream, temporal)
            }
        }
    }, [commonReducer, videoCallReducer])

    const handleCheckEnter = (event) => {
        var theCode = event.keyCode
            ? event.keyCode
            : event.which
            ? event.which
            : event.charCode
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
        setAttachData({ ...attachData, register: true })
        const uName = userNameRef.current.value

        if (uName === "") {
            window.bootbox.alert("Insert a username to register (e.g., pippo)")
            setAttachData({ ...attachData, register: false })
            return
        }
        if (/[^a-zA-Z0-9]/.test(uName)) {
            window.bootbox.alert("Input is not alphanumeric")
            setAttachData({ ...attachData, register: false, userNameValue: "" })
            return
        }
        var register = { request: "register", username: uName }
        WebRTC.getInstance().videocall.send({ message: register })
    }

    const handleCall = () => {
        setAttachData({ ...attachData, call: true })
        const uName = peerRef.current.value
        if (uName === "") {
            window.bootbox.alert("Insert a username to call (e.g., pluto)")
            setAttachData({ ...attachData, call: false })
            return
        }
        if (/[^a-zA-Z0-9]/.test(uName)) {
            window.bootbox.alert("Input is not alphanumeric")
            setAttachData({ ...attachData, call: false, peerValue: "" })
            return
        }

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
            window.bootbox.alert(
                "Insert a message to send on the DataChannel to your peer"
            )
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
        if (e.target.id === "username")
            setAttachData({ ...attachData, userNameValue: e.target.value })
        if (e.target.id === "peer")
            setAttachData({ ...attachData, peerValue: e.target.value })
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
                                    disabled={commonReducer.attach}
                                    onClick={() =>
                                        WebRTC.getInstance().startJanus(
                                            dispatch,
                                            type
                                        )
                                    }
                                >
                                    Start
                                </button>
                            </h1>
                        </div>
                        <div
                            className="container"
                            id="details"
                            style={{
                                display: attachData.detailsFlag
                                    ? "none"
                                    : "block",
                            }}
                        >
                            <div className="row">
                                <div className="col-md-12">
                                    <h3>Demo details</h3>
                                    <p>
                                        This Video Call demo is basically an
                                        example of how you can achieve a
                                        scenario like the famous AppRTC demo but
                                        with media flowing through Janus. It
                                        basically is an extension to the Echo
                                        Test demo, where in this case the media
                                        packets and statistics are forwarded
                                        between the two involved peers.
                                    </p>
                                    <p>
                                        Using the demo is simple. Just choose a
                                        simple username to register at the
                                        plugin, and then either call another
                                        user (provided you know which username
                                        was picked) or share your username with
                                        a friend and wait for a call. At that
                                        point, you'll be in a video call with
                                        the remote peer, and you'll have the
                                        same controls the Echo Test demo
                                        provides to try and control the media:
                                        that is, a button to mute/unmute your
                                        audio and video, and a knob to try and
                                        limit your bandwidth. If the browser
                                        supports it, you'll also get a view of
                                        the bandwidth currently used by your
                                        peer for the video stream.
                                    </p>
                                    <p>
                                        If you're interested in testing how
                                        simulcasting can be used within the
                                        context of this sample videocall
                                        application, just pass the
                                        <code>?simulcast=true</code> query
                                        string to the url of this page and
                                        reload it. If you're using a browser
                                        that does support simulcasting (Chrome
                                        or Firefox) and the call will end up
                                        using VP8, you'll send multiple
                                        qualities of the video you're capturing.
                                        Notice that simulcasting will only occur
                                        if the browser thinks there is enough
                                        bandwidth, so you'll have to play with
                                        the Bandwidth selector to increase it.
                                        New buttons to play with the feature
                                        will automatically appear for your peer;
                                        at the same time, if your peer enabled
                                        simulcasting new buttons will appear for
                                        you when watching the remote stream.
                                        Notice that no simulcast support is
                                        needed for watching, only for
                                        publishing.
                                    </p>
                                    <p>
                                        A very simple chat based on Data
                                        Channels is available as well: just use
                                        the text area under your local video to
                                        send messages to your peer. Incoming
                                        messages will be displayed below the
                                        remote video instead.
                                    </p>
                                    <p>
                                        Press the <code>Start</code> button
                                        above to launch the demo.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            className={
                                attachData.videoCallFlag
                                    ? "container"
                                    : "container hide"
                            }
                            id="videocall"
                            style={{
                                display: attachData.videoCallFlag
                                    ? "block"
                                    : "none",
                            }}
                        >
                            <div className="row">
                                <div className="col-md-12">
                                    <div
                                        className={
                                            attachData.loginFlag
                                                ? "col-md-6 container"
                                                : "col-md-6 container hide"
                                        }
                                        id="login"
                                        style={{
                                            display: attachData.loginFlag
                                                ? "block"
                                                : "none",
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
                                                onChange={(e) =>
                                                    handleInputValueChange(e)
                                                }
                                                disabled={attachData.register}
                                                onKeyPress={(e) =>
                                                    handleCheckEnter(e)
                                                }
                                            />
                                        </div>
                                        <button
                                            className="btn btn-success margin-bottom-sm"
                                            autoComplete="off"
                                            id="register"
                                            disabled={attachData.register}
                                            onClick={() => handleRegister()}
                                        >
                                            Register
                                        </button>
                                        <span
                                            className={
                                                attachData.youokFlag
                                                    ? "label label-info"
                                                    : "hide label label-info"
                                            }
                                            id="youok"
                                        >
                                            {attachData.youokFlag
                                                ? `Registered as '${
                                                      WebRTC.getInstance()
                                                          .myusername
                                                  }'`
                                                : null}
                                        </span>
                                    </div>
                                    <div
                                        className={
                                            attachData.phoneFlag
                                                ? "col-md-6 container"
                                                : "col-md-6 container hide"
                                        }
                                        id="phone"
                                    >
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
                                                onChange={(e) =>
                                                    handleInputValueChange(e)
                                                }
                                                disabled={attachData.peerFlag}
                                                onKeyPress={(e) =>
                                                    handleCheckEnter(e)
                                                }
                                            />
                                        </div>
                                        <button
                                            className={
                                                attachData.callFlag
                                                    ? "btn btn-danger margin-bottom-sm"
                                                    : "btn btn-success margin-bottom-sm"
                                            }
                                            autoComplete="off"
                                            id="call"
                                            disabled={attachData.callFlag}
                                            onClick={() => handleCall()}
                                        >
                                            {attachData.callFlag
                                                ? "Hangup"
                                                : "Call"}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <div
                                        id="videos"
                                        className={
                                            attachData.videosFlag ? "hide" : ""
                                        }
                                    >
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
                                                                disabled={
                                                                    attachData.toggleaudioFlag
                                                                }
                                                            >
                                                                Disable audio
                                                            </button>
                                                            <button
                                                                className="btn btn-danger"
                                                                autoComplete="off"
                                                                id="togglevideo"
                                                                disabled={
                                                                    attachData.togglevideoFlag
                                                                }
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
                                                                    disabled={
                                                                        attachData.bitrateFlag
                                                                    }
                                                                >
                                                                    <li>
                                                                        <a
                                                                            href="#"
                                                                            id="0"
                                                                        >
                                                                            No
                                                                            limit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a
                                                                            href="#"
                                                                            id="128"
                                                                        >
                                                                            Cap
                                                                            to
                                                                            128kbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a
                                                                            href="#"
                                                                            id="256"
                                                                        >
                                                                            Cap
                                                                            to
                                                                            256kbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a
                                                                            href="#"
                                                                            id="512"
                                                                        >
                                                                            Cap
                                                                            to
                                                                            512kbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a
                                                                            href="#"
                                                                            id="1024"
                                                                        >
                                                                            Cap
                                                                            to
                                                                            1mbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a
                                                                            href="#"
                                                                            id="1500"
                                                                        >
                                                                            Cap
                                                                            to
                                                                            1.5mbit
                                                                        </a>
                                                                    </li>
                                                                    <li>
                                                                        <a
                                                                            href="#"
                                                                            id="2000"
                                                                        >
                                                                            Cap
                                                                            to
                                                                            2mbit
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </h3>
                                                </div>
                                                <div
                                                    className="panel-body"
                                                    id="videoleft"
                                                ></div>
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
                                                    onKeyPress={(e) =>
                                                        handleCheckEnter(e)
                                                    }
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h3 className="panel-title">
                                                        Remote Stream
                                                        <span
                                                            className="label label-info hide"
                                                            id="callee"
                                                        ></span>
                                                        <span
                                                            className={
                                                                attachData.curresFlag
                                                                    ? "label label-primary"
                                                                    : "label label-primary hide"
                                                            }
                                                            id="curres"
                                                        ></span>
                                                        <span
                                                            className={
                                                                attachData.curbitrateFlag
                                                                    ? "label label-info"
                                                                    : "label label-info hide"
                                                            }
                                                            id="curbitrate"
                                                        ></span>
                                                    </h3>
                                                </div>
                                                <div
                                                    className="panel-body"
                                                    id="videoright"
                                                ></div>
                                            </div>
                                            <div className="input-group margin-bottom-sm">
                                                <span className="input-group-addon">
                                                    <i className="fa fa-cloud-download fa-fw"></i>
                                                </span>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    id="datarecv"
                                                    disabled
                                                />
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
