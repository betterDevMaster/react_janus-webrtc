import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Header from "../widget/header"
// import Banner from "../Components/w/Homew/Banner"
// import ItemSec from "../Components/w/Homew/ItemSec"
import Footer from "../widget/footer"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"
// import * as ActionTypes from "../Store/Action/ActionTypes"

export default function VideoRoom(props) {
    const dispatch = useDispatch()
    useEffect(() => {
        JanusHelperVideoRoom.getInstance().init(dispatch, "janus.plugin.videoroom")
    }, [])
    const janusState = useSelector((state) => state.janus)
    const [userName, setUserName] = useState("")
    const [toggleMute, setToggleMute] = useState(false)
    const [publish, setPublish] = useState(true)
    console.log("janusstate: --------------- ", janusState, publish)

    useEffect(() => {
        if (janusState.message.publishers) handleNewRemoteFeed(janusState.message)
        if (janusState.status === "CONNECTED" && janusState.stream.local && publish) handleLocalStream(janusState.stream.local)
        // if (janusState.status === "CLEANUP") setPublish(!publish)
    }, [janusState])
    const handleCheckEnter = (event) => {
        var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
        if (theCode === 13) {
            if (event.target.id === "username") JanusHelperVideoRoom.getInstance().registerUsername(event.target.value)
            return false
        } else {
            return true
        }
    }
    const handleRegisterName = () => {
        JanusHelperVideoRoom.getInstance().registerUsername(userName)
    }
    const handleNewRemoteFeed = (msg) => {
        console.log("handleNewRemoteFeed: ---------- ", msg)

        var list = msg["publishers"]
        window.Janus.debug("Got a list of available publishers/feeds:", list)
        for (var f in list) {
            var id = list[f]["id"]
            var display = list[f]["display"]
            var audio = list[f]["audio_codec"]
            var video = list[f]["video_codec"]
            window.Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")")
            JanusHelperVideoRoom.getInstance().newRemoteFeed(id, display, audio, video)
        }
    }
    const handleLocalStream = (stream) => {
        window.Janus.attachMediaStream(document.getElementById("myvideo"), stream)
    }
    const handleToggleMute = () => {
        setToggleMute(!toggleMute)
        JanusHelperVideoRoom.getInstance().toggleMute()
    }
    const handleBitrate = (bitrate) => {
        var bitrate = bitrate * 1000
        if (bitrate === 0) {
            window.Janus.log("Not limiting bandwidth via REMB")
        } else {
            window.Janus.log("Capping bandwidth to " + bitrate + " via REMB")
        }

        JanusHelperVideoRoom.getInstance().sfutest.send({
            message: { request: "configure", bitrate: bitrate },
        })
    }
    const handleUnpublish = () => {
        JanusHelperVideoRoom.getInstance().unpublishOwnFeed()
        setPublish(!publish)
    }
    const handlePublish = () => {
        JanusHelperVideoRoom.getInstance().publishOwnFeed(true)
        setPublish(!publish)
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
                                Plugin Demo: Video Room
                                <button
                                    className="btn btn-default"
                                    autoComplete="off"
                                    id="start"
                                    onClick={() => JanusHelperVideoRoom.getInstance().start(1234)}
                                    disabled={janusState.status === "joined"}
                                >
                                    {janusState.status === "INITIALIZED" || janusState.status === "ATTACHED" ? "Start" : "Stop"}
                                </button>
                            </h1>
                        </div>
                        {janusState.status === "INITIALIZED" && (
                            <div className="container" id="details">
                                <div className="row">
                                    <div className="col-md-12">
                                        <h3>Demo details</h3>
                                        <p>
                                            This demo is an example of how you can use the Video Room plugin to implement a simple
                                            videoconferencing application. In particular, this demo page allows you to have up to 6 active
                                            participants at the same time: more participants joining the room will be instead just passive
                                            users. No mixing is involved: all media are just relayed in a publisher/subscriber approach.
                                            This means that the plugin acts as a SFU (Selective Forwarding Unit) rather than an MCU
                                            (Multipoint Control Unit).
                                        </p>
                                        <p>
                                            If you're interested in testing how simulcasting can be used within the context of a
                                            videoconferencing application, just pass the <code>?simulcast=true</code> query string to the
                                            url of this page and reload it. If you're using a browser that does support simulcasting (Chrome
                                            or Firefox) and the room is configured to use VP8, you'll send multiple qualities of the video
                                            you're capturing. Notice that simulcasting will only occur if the browser thinks there is enough
                                            bandwidth, so you'll have to play with the Bandwidth selector to increase it. New buttons to
                                            play with the feature will automatically appear for viewers when receiving any simulcasted
                                            stream. Notice that no simulcast support is needed for watching, only for publishing.
                                        </p>
                                        <p>
                                            To use the demo, just insert a username to join the default room that is configured. This will
                                            add you to the list of participants, and allow you to automatically send your audio/video frames
                                            and receive the other participants' feeds. The other participants will appear in separate
                                            panels, whose title will be the names they chose when registering at the demo.
                                        </p>
                                        <p>
                                            Press the <code>Start</code> button above to launch the demo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {janusState.status === "ATTACHED" && (
                            <div className="container" id="videojoin">
                                <div className="row">
                                    <span className="label label-info" id="you"></span>
                                    <div className="col-md-12" id="controls">
                                        <div className="input-group margin-bottom-md" id="registernow">
                                            <span className="input-group-addon">@</span>
                                            <input
                                                autoComplete="off"
                                                className="form-control"
                                                type="text"
                                                placefolder="Choose a display name"
                                                id="username"
                                                value={userName}
                                                onChange={(e) => {
                                                    setUserName(e.target.value)
                                                }}
                                                onKeyPress={(e) => handleCheckEnter(e)}
                                            />
                                            <span className="input-group-btn">
                                                <button
                                                    className="btn btn-success"
                                                    autoComplete="off"
                                                    id="register"
                                                    onClick={handleRegisterName}
                                                >
                                                    Join the room
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {janusState.status === "CONNECTED" && (
                            <div className="container" id="videos">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">
                                                    Local Video
                                                    <span className="label label-primary" id="publisher"></span>
                                                    <div className="btn-group btn-group-xs pull-right">
                                                        <div className="btn-group btn-group-xs">
                                                            <button
                                                                id="bitrateset"
                                                                autoComplete="off"
                                                                className="btn btn-primary dropdown-toggle"
                                                                data-toggle="dropdown"
                                                            >
                                                                Bandwidth
                                                                <span className="caret"></span>
                                                            </button>
                                                            <ul id="bitrate" className="dropdown-menu" role="menu">
                                                                <li>
                                                                    <a href="#" id="0" onClick={() => handleBitrate(0)}>
                                                                        No limit
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <a href="#" id="128" onClick={() => handleBitrate(128)}>
                                                                        Cap to 128kbit
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <a href="#" id="256" onClick={() => handleBitrate(256)}>
                                                                        Cap to 256kbit
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <a href="#" id="512" onClick={() => handleBitrate(512)}>
                                                                        Cap to 512kbit
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <a href="#" id="1024" onClick={() => handleBitrate(1024)}>
                                                                        Cap to 1mbit
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <a href="#" id="1500" onClick={() => handleBitrate(1500)}>
                                                                        Cap to 1.5mbit
                                                                    </a>
                                                                </li>
                                                                <li>
                                                                    <a href="#" id="2000" onClick={() => handleBitrate(2000)}>
                                                                        Cap to 2mbit
                                                                    </a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </h3>
                                            </div>
                                            <div className="panel-body" id="videolocal">
                                                {!publish ? (
                                                    <button id="publish" className="btn btn-primary" onClick={handlePublish}>
                                                        Publish
                                                    </button>
                                                ) : (
                                                    <>
                                                        <video
                                                            className="rounded centered"
                                                            id="myvideo"
                                                            width="100%"
                                                            height="100%"
                                                            autoPlay
                                                            playsInline
                                                            muted="muted"
                                                        />
                                                        <button
                                                            className="btn btn-warning btn-xs"
                                                            id="mute"
                                                            onClick={handleToggleMute}
                                                            style={{ position: "absolute", bottom: "0px", left: "0px", margin: "15px" }}
                                                        >
                                                            {!toggleMute ? "Mute" : "Unmute"}
                                                        </button>
                                                        <button
                                                            className="btn btn-warning btn-xs"
                                                            id="unpublish"
                                                            onClick={handleUnpublish}
                                                            style={{ position: "absolute", bottom: "0px", right: "0px", margin: "15px" }}
                                                        >
                                                            Unpublish
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">
                                                    Remote Video #1
                                                    <span className="label label-info" id="remote1"></span>
                                                </h3>
                                            </div>
                                            <div className="panel-body relative" id="videoremote1"></div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">
                                                    Remote Video #2
                                                    <span className="label label-info" id="remote2"></span>
                                                </h3>
                                            </div>
                                            <div className="panel-body relative" id="videoremote2"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">
                                                    Remote Video #3
                                                    <span className="label label-info" id="remote3"></span>
                                                </h3>
                                            </div>
                                            <div className="panel-body relative" id="videoremote3"></div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">
                                                    Remote Video #4
                                                    <span className="label label-info" id="remote4"></span>
                                                </h3>
                                            </div>
                                            <div className="panel-body relative" id="videoremote4"></div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">
                                                    Remote Video #5
                                                    <span className="label label-info" id="remote5"></span>
                                                </h3>
                                            </div>
                                            <div className="panel-body relative" id="videoremote5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <hr />
                <Footer />
            </div>
        </div>
    )
}
