import React, { useRef, useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Header from "../widget/header"
import Footer from "../widget/footer"
import JanusHelperVideoCall from "../janus/janusHelperVideoCall"
import LocalCallVideo from "../component/localCallVideo"
import RemoteCallVideo from "../component/remoteCallVideo"

export default function TextRoomPage(props) {
    const dispatch = useDispatch()
    const janusState = useSelector((state) => state.janus)
    const [userData, setUserData] = useState({ name: "", nameSet: false })
    const [peerData, setPeerData] = useState({ name: "", peerSet: false })
    const [statusChange, setStatusChange] = useState(false)
    const status = ["RUNNING", "CONNECTED", "DISCONNECTED"]

    useEffect(() => {
        JanusHelperVideoCall.getInstance().init(dispatch, "videoCall", "janus.plugin.videocall")
    }, [])
    useEffect(() => {
        // console.log("janusstate: --------------- ", janusState, userData)
        setStatusChange(!statusChange)
        if (janusState.status === "ATTACHED") setPeerData({ ...peerData, peerSet: false })
    }, [janusState])

    const handleStart = () => {
        setStatusChange(!statusChange)
        JanusHelperVideoCall.getInstance().start(1234)
    }
    const handleStop = () => {
        JanusHelperVideoCall.getInstance().stop()
    }
    const handleRegister = () => {
        // console.log("UI: handleRegister: ----------------- ")
        setUserData({ ...userData, nameSet: true })
        JanusHelperVideoCall.getInstance().registerUsername(userData.name)
    }
    const handleCall = () => {
        setPeerData({ ...peerData, peerSet: true })
        JanusHelperVideoCall.getInstance().doCall(peerData.name)
    }
    const handleCheckEnter = (event) => {
        var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
        if (theCode === 13) {
            if (event.target.id === "username") {
                // console.log("UI: handleCheckEnter: ----------------- ")

                setUserData({ name: event.target.value, nameSet: true })
                JanusHelperVideoCall.getInstance().registerUsername(event.target.value)
            } else if (event.target.id == "peer") handleCall()
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
                                Plugin Demo: Text Room
                                <button className="btn btn-default" autocomplete="off" id="start">
                                    Start
                                </button>
                            </h1>
                        </div>
                        <div className="container" id="details">
                            <div className="row">
                                <div className="col-md-12">
                                    <h3>Demo details</h3>
                                    <p>
                                        The Text Room demo is a simple example of how you can use this text broadcasting plugin, which uses
                                        Data Channels, to implement something similar to a chatroom. More specifically, the demo allows you
                                        to join a previously created and configured text room together with other participants, and
                                        send/receive public and private messages to individual participants. To send messages on the
                                        chatroom, just type your text and send. To send private messages to individual participants, click
                                        the participant name in the list on the right and a custom dialog will appear.
                                    </p>
                                    <p>
                                        To try the demo, just insert a username to join the room. This will add you to chatroom, and allow
                                        you to interact with the other participants.
                                    </p>
                                    <p>
                                        Notice that this is just a very basic demo, and that is just one of the several different ways you
                                        can use this plugin for. The plugin actually allows you to join multiple rooms at the same time, and
                                        also to forward incoming messages to the room to external components. This makes it a useful tool
                                        whenever you have to interact with third party applications and exchange text data.
                                    </p>
                                    <p>
                                        Press the <code>Start</code> button above to launch the demo.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="container hide" id="roomjoin">
                            <div className="row">
                                <span className="label label-info" id="you"></span>
                                <div className="col-md-12" id="controls">
                                    <div className="input-group margin-bottom-md hide" id="registernow">
                                        <span className="input-group-addon">@</span>
                                        <input
                                            className="form-control"
                                            type="text"
                                            placeholder="Choose a display name"
                                            autocomplete="off"
                                            id="username"
                                            onkeypress="return checkEnter(this, event);"
                                        />
                                        <span className="input-group-btn">
                                            <button className="btn btn-success" autocomplete="off" id="register">
                                                Join the room
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="container hide" id="room">
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
                                            <h3 className="panel-title">
                                                Participants <span className="label label-info hide" id="participant"></span>
                                            </h3>
                                        </div>
                                        <div className="panel-body">
                                            <ul id="list" className="list-group"></ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
                                            <h3 className="panel-title">Public Chatroom</h3>
                                        </div>
                                        <div className="panel-body relative" style="overflow-x: auto;" id="chatroom"></div>
                                        <div className="panel-footer">
                                            <div className="input-group margin-bottom-sm">
                                                <span className="input-group-addon">
                                                    <i className="fa fa-cloud-upload fa-fw"></i>
                                                </span>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    placeholder="Write a chatroom message"
                                                    autocomplete="off"
                                                    id="datasend"
                                                    onkeypress="return checkEnter(this, event);"
                                                    disabled
                                                />
                                            </div>
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
    )
}
