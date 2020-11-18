import React, { useRef, useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Header from "../widget/header"
import Footer from "../widget/footer"
import JanusHelperVideoCall from "../janus/JanusHelperVideoCall"

export default function VideoCallPage(props) {
    const dispatch = useDispatch()
    const janusState = useSelector((state) => state.janus)
    const [userName, setUserName] = useState({ name: "", nameSet: false })
    const [peer, setPeer] = useState("")
    const [datasend, setDatasend] = useState("")
    const [statusChange, setStatusChange] = useState(false)

    useEffect(() => {
        JanusHelperVideoCall.getInstance().init(dispatch, "videoCall", "janus.plugin.videocall")
    }, [])
    useEffect(() => {
        setStatusChange(!statusChange)
        // if (janusState.status === "RUNNING") handlePublishing()
    }, [janusState])
    console.log("janusstate: --------------- ", janusState, userName)

    const handleStart = () => {
        setStatusChange(!statusChange)
        JanusHelperVideoCall.getInstance().start(1234)
    }
    const handleStop = () => {
        JanusHelperVideoCall.getInstance().stop()
        window.location.reload()
    }
    const handleRegister = () => {
        setUserName({ ...userName, nameSet: true })
        JanusHelperVideoCall.getInstance().registerUsername(userName.name)
    }
    const handleCheckEnter = (event) => {
        var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
        if (theCode === 13) {
            if (event.target.id === "username") {
                setUserName({ userName: event.target.value, nameSet: true })
                JanusHelperVideoCall.getInstance().registerUsername(event.target.value)
            }
            return false
        } else {
            return true
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
                                            This Video Call demo is basically an example of how you can achieve a scenario like the famous
                                            AppRTC demo but with media flowing through Janus. It basically is an extension to the Echo Test
                                            demo, where in this case the media packets and statistics are forwarded between the two involved
                                            peers.
                                        </p>
                                        <p>
                                            Using the demo is simple. Just choose a simple username to register at the plugin, and then
                                            either call another user (provided you know which username was picked) or share your username
                                            with a friend and wait for a call. At that point, you'll be in a video call with the remote
                                            peer, and you'll have the same controls the Echo Test demo provides to try and control the
                                            media: that is, a button to mute/unmute your audio and video, and a knob to try and limit your
                                            bandwidth. If the browser supports it, you'll also get a view of the bandwidth currently used by
                                            your peer for the video stream.
                                        </p>
                                        <p>
                                            If you're interested in testing how simulcasting can be used within the context of this sample
                                            videocall application, just pass the
                                            <code>?simulcast=true</code> query string to the url of this page and reload it. If you're using
                                            a browser that does support simulcasting (Chrome or Firefox) and the call will end up using VP8,
                                            you'll send multiple qualities of the video you're capturing. Notice that simulcasting will only
                                            occur if the browser thinks there is enough bandwidth, so you'll have to play with the Bandwidth
                                            selector to increase it. New buttons to play with the feature will automatically appear for your
                                            peer; at the same time, if your peer enabled simulcasting new buttons will appear for you when
                                            watching the remote stream. Notice that no simulcast support is needed for watching, only for
                                            publishing.
                                        </p>
                                        <p>
                                            A very simple chat based on Data Channels is available as well: just use the text area under
                                            your local video to send messages to your peer. Incoming messages will be displayed below the
                                            remote video instead.
                                        </p>
                                        <p>
                                            Press the <code>Start</code> button above to launch the demo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {janusState.status === "ATTACHED" && (
                            <div className="container" id="videocall">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="col-md-6 container" id="login">
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
                                                    value={userName.name}
                                                    disabled={userName.nameSet}
                                                    onChange={(e) => {
                                                        setUserName({ ...userName, name: e.target.value })
                                                    }}
                                                    onKeyPress={(e) => handleCheckEnter(e)}
                                                />
                                            </div>
                                            <button
                                                className="btn btn-success margin-bottom-sm"
                                                autoComplete="off"
                                                id="register"
                                                disabled={userName.nameSet}
                                                onClick={handleRegister}
                                            >
                                                Register
                                            </button>
                                            <span className="label label-info" id="youok">
                                                {userName.nameSet ? "Registered as " + userName.name : null}
                                            </span>
                                        </div>
                                        {userName.nameSet ? (
                                            <div className="col-md-6 container" id="phone">
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
                                                        value={peer}
                                                        onChange={(e) => {
                                                            setPeer(e.target.value)
                                                        }}
                                                        onKeyPress={(e) => handleCheckEnter(e)}
                                                    />
                                                </div>
                                                <button className="btn btn-success margin-bottom-sm" autoComplete="off" id="call">
                                                    Call
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div />
                                    <div id="videos" className="">
                                        <div className="col-md-6">
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h3 className="panel-title">
                                                        Local Stream
                                                        <div className="btn-group btn-group-xs pull-right">
                                                            <button className="btn btn-danger" autoComplete="off" id="toggleaudio">
                                                                Disable audio
                                                            </button>
                                                            <button className="btn btn-danger" autoComplete="off" id="togglevideo">
                                                                Disable video
                                                            </button>
                                                            <div className="btn-group btn-group-xs">
                                                                <button
                                                                    autoComplete="off"
                                                                    id="bitrateset"
                                                                    className="btn btn-primary dropdown-toggle"
                                                                    data-toggle="dropdown"
                                                                >
                                                                    Bandwidth<span className="caret"></span>
                                                                </button>
                                                                <ul id="bitrate" className="dropdown-menu" role="menu">
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
                                                    value={datasend}
                                                    onChange={(e) => {
                                                        setDatasend(e.target.value)
                                                    }}
                                                    onKeyPress={(e) => handleCheckEnter(e)}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="panel panel-default">
                                                <div className="panel-heading">
                                                    <h3 className="panel-title">
                                                        Remote Stream <span className="label label-info" id="callee"></span>{" "}
                                                        <span className="label label-primary" id="curres"></span>{" "}
                                                        <span className="label label-info" id="curbitrate"></span>
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
                        )}
                    </div>
                </div>
                <hr />
                <Footer />
            </div>
        </div>
    )
}
