import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Header from "../widget/header"
import Footer from "../widget/footer"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"
import LocalVideo from "../component/localVideo"
import RemoteVideo from "../component/remoteVideo"

export default function VideoRoomPage(props) {
    const dispatch = useDispatch()
    const janusState = useSelector((state) => state.janus)
    const [userName, setUserName] = useState("")
    const [statusChange, setStatusChange] = useState(false)

    useEffect(() => {
        JanusHelperVideoRoom.getInstance().init(dispatch, "videoRoom", "janus.plugin.videoroom")
    }, [])
    useEffect(() => {
        // console.log("janusstate: --------------- ", janusState)
        setStatusChange(!statusChange)
        if (janusState.status === "RUNNING") handlePublishing()
    }, [janusState])

    const handleStart = () => {
        setStatusChange(!statusChange)
        JanusHelperVideoRoom.getInstance().start(1234)
    }
    const handleStop = () => {
        JanusHelperVideoRoom.getInstance().stop()
        window.location.reload()
    }
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
        setStatusChange(!statusChange)
        JanusHelperVideoRoom.getInstance().registerUsername(userName)
    }
    const handlePublishing = () => {
        window.$.blockUI({
            message: "<b>Publishing...</b>",
            css: {
                border: "none",
                backgroundColor: "transparent",
                color: "white",
            },
        })
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
                                    disabled={statusChange}
                                    onClick={() =>
                                        janusState.status === "INITIALIZED" || janusState.status === "ATACHED"
                                            ? handleStart()
                                            : handleStop()
                                    }
                                >
                                    {janusState.status === "INITIALIZED" ? "Start" : "Stop"}
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
                        {(janusState.status === "RUNNING" || janusState.status === "CONNECTED") && (
                            <div className="container" id="videos">
                                <div className="row">
                                    {janusState.stream.local && <LocalVideo stream={janusState.stream.local} userName={userName} />}

                                    {janusState.stream.remote.length > 0 &&
                                        janusState.stream.remote.map((session, i) => {
                                            if (session) {
                                                return <RemoteVideo key={i} session={session} />
                                            }
                                        })}
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
