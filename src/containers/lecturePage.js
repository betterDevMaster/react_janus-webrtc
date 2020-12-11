import React, { useRef, useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import * as qs from "query-string"

import Header from "../widget/header"
import Footer from "../widget/footer"
import JanusHelperLectureRoom from "../janus/janusHelperLectureRoom"
import LocalLectureVideo from "../component/localLectureVideo"

export default function LecturePage(props) {
    const history = useHistory()
    const dispatch = useDispatch()
    const janusState = useSelector((state) => state.janus)
    const [userName, setUserName] = useState("")
    const [statusChange, setStatusChange] = useState(false)
    const query = qs.parse(props.location.search)

    const status1 = ["RUNNING", "CONNECTED", "DISCONNECTED"]
    const status2 = ["INITIALIZED", "ATACHED"]

    useEffect(() => {
        JanusHelperLectureRoom.getInstance().init(dispatch, "echotest", "janus.plugin.echotest")
    }, [])
    useEffect(() => {
        console.log("janusstate: --------------- ", janusState, statusChange, props, query)
        status1.includes(janusState.status) ? setStatusChange(false) : setStatusChange(!statusChange)
    }, [janusState])

    const handleStart = () => {
        setStatusChange(!statusChange)
        JanusHelperLectureRoom.getInstance().start(1234) // string IDS = false in janus conf
        // JanusHelperLectureRoom.getInstance().start("1234") // string IDS = true in janus conf
        // JanusHelperLectureRoom.getInstance().start(query.room)
    }
    const handleStop = () => {
        JanusHelperLectureRoom.getInstance().stop()
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
                                Plugin Demo: Canvas Capture
                                <button
                                    className="btn btn-default"
                                    autoComplete="off"
                                    id="start"
                                    disabled={statusChange ? "disabled" : ""}
                                    onClick={status2.includes(janusState.status) ? handleStart : handleStop}
                                >
                                    {status2.includes(janusState.status) ? "Start" : "Stop"}
                                </button>
                            </h1>
                        </div>
                        {janusState.status === "INITIALIZED" && (
                            <div className="container" id="details">
                                <div className="row">
                                    <div className="col-md-12">
                                        <h3>Demo details</h3>
                                        <p>
                                            This is a variant of the Echo Test demo meant to showcase how you can use an HTML5{" "}
                                            <code>canvas</code> element as a WebRTC media source: everything is exactly the same in term of
                                            available controls, features, and the like, with the substantial difference that we'll play a
                                            bit with what we'll send on the video stream.
                                        </p>
                                        <p>
                                            More precisely, the demo captures the webcam feed via a<code>getUserMedia</code> call to use as
                                            a background in a<code>canvas</code> element, and then presents some basic controls to add some
                                            text dynamically; an image is also statically added to the element as well. The{" "}
                                            <code>canvas</code> element is then used as the actual source of media for our PeerConnection,
                                            which means the video we get back from the EchoTest plugin should reflect the tweaks we've made
                                            on the stream.
                                        </p>
                                        <p>
                                            Notice that this is a very naive implementation, with many hardcoded assumptions about video
                                            resolution and other things, and may not perform very well either: it's only meant to showcase
                                            an interesting approach that can be used for WebRTC, so you're encouraged to dig deeper yourself
                                            to see how to make the <code>canvas</code>
                                            processing more efficient and cooler. The code for this demo comes from a
                                            <a href="https://youtu.be/zwYUojfm0hY?t=2140" target="blank">
                                                Dangerous Demo
                                            </a>
                                            we showed during a past edition of Kamailio World; you can read more details in a
                                            <a href="https://www.meetecho.com/blog/firefox-webrtc-youtube-kinda/" target="blank">
                                                blog post
                                            </a>
                                            we wrote on the Meetecho blog after the fact.
                                        </p>
                                        <p>
                                            Press the <code>Start</code> button above to launch the demo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {janusState.status === "ATTACHED" && (
                            <div className="container " id="videos">
                                <div className="row">
                                    <LocalLectureVideo />
                                    <div className="col-md-6">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">
                                                    Remote Stream <span className="label label-primary " id="curres"></span>
                                                    <span className="label label-info " id="curbitrate"></span>
                                                </h3>
                                            </div>
                                            <div className="panel-body" id="videoright"></div>
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
