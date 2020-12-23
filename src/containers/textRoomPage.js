import React, { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as qs from "query-string"

import Header from "../widget/header"
import Footer from "../widget/footer"
import JanusHelperTextRoom from "../janus/janusHelperTextRoom"

export default function TextRoomPage(props) {
    const dispatch = useDispatch()
    const janusState = useSelector((state) => state.janus)
    const [userName, setUserName] = useState("")
    const [statusChange, setStatusChange] = useState(false)
    const query = qs.parse(props.location.search)

    const status1 = useMemo(() => ["RUNNING", "CONNECTED", "DISCONNECTED"], [])
    const status2 = useMemo(() => ["INITIALIZED", "ATACHED"], [])

    useEffect(() => {
        window.textRoomHelper = new JanusHelperTextRoom()
        window.textRoomHelper.init(dispatch, "textRoom", "janus.plugin.textroom")
    }, [dispatch])
    useEffect(() => {
        status1.includes(janusState.status) ? setStatusChange(false) : setStatusChange((sts) => !sts)
    }, [janusState, status1])

    const handleStart = () => {
        setStatusChange(!statusChange)
        // window.textRoomHelper.start(1234) // string IDS = false in janus conf
        // window.textRoomHelper.start("1234") // string IDS = true in janus conf
        window.textRoomHelper.start(query.room + "textRoom")
    }
    const handleStop = () => {
        window.textRoomHelper.stop()
    }
    const handleCheckEnter = (event) => {
        var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
        if (theCode === 13) {
            if (event.target.id === "username") window.textRoomHelper.registerUsername(event.target.value)
            else if (event.target.id === "datasend") window.textRoomHelper.sendData()
            return false
        } else {
            return true
        }
    }
    const handleRegister = () => {
        setStatusChange(!statusChange)
        window.textRoomHelper.registerUsername(userName)
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
                <Header room={query.room} name={query.name} />
            </nav>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="page-header">
                            <h1>
                                Plugin Demo: Text Room
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
                                            The Text Room demo is a simple example of how you can use this text broadcasting plugin, which
                                            uses Data Channels, to implement something similar to a chatroom. More specifically, the demo
                                            allows you to join a previously created and configured text room together with other
                                            participants, and send/receive public and private messages to individual participants. To send
                                            messages on the chatroom, just type your text and send. To send private messages to individual
                                            participants, click the participant name in the list on the right and a custom dialog will
                                            appear.
                                        </p>
                                        <p>
                                            To try the demo, just insert a username to join the room. This will add you to chatroom, and
                                            allow you to interact with the other participants.
                                        </p>
                                        <p>
                                            Notice that this is just a very basic demo, and that is just one of the several different ways
                                            you can use this plugin for. The plugin actually allows you to join multiple rooms at the same
                                            time, and also to forward incoming messages to the room to external components. This makes it a
                                            useful tool whenever you have to interact with third party applications and exchange text data.
                                        </p>
                                        <p>
                                            Press the <code>Start</code> button above to launch the demo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {janusState.status === "ATTACHED" && (
                            <div className="container " id="roomjoin">
                                <div className="row">
                                    <span className="label label-info" id="you"></span>
                                    <div className="col-md-12" id="controls">
                                        <div className="input-group margin-bottom-md " id="registernow">
                                            <span className="input-group-addon">@</span>
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder="Choose a display name"
                                                autoComplete="off"
                                                id="username"
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
                                                    disabled={statusChange ? "disabled" : ""}
                                                    onClick={handleRegister}
                                                >
                                                    Join the room
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="container " id="room">
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
                                            <h3 className="panel-title">
                                                Participants <span className="label label-info " id="participant"></span>
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
                                        <div className="panel-body relative" style={{ overflowX: "auto" }} id="chatroom"></div>
                                        <div className="panel-footer">
                                            <div className="input-group margin-bottom-sm">
                                                <span className="input-group-addon">
                                                    <i className="fa fa-cloud-upload fa-fw"></i>
                                                </span>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    placeholder="Write a chatroom message"
                                                    autoComplete="off"
                                                    id="datasend"
                                                    onKeyPress={(e) => handleCheckEnter(e)}
                                                    // disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* {status1.includes(janusState.status) && (
                            <div className="container " id="room">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">
                                                    Participants
                                                    <span className="label label-info " id="participant">
                                                        {janusState.message.participants[janusState.message.username]}
                                                    </span>
                                                </h3>
                                            </div>
                                            <div className="panel-body">
                                                <ul id="list" className="list-group">
                                                    {Object.keys(janusState.message.participants).map((val, k) => {
                                                        if (val !== janusState.message.username) {
                                                            return (
                                                                <li
                                                                    id={`rp${val}`}
                                                                    key={k}
                                                                    className="list-group-item"
                                                                    style={{ cursor: "pointer" }}
                                                                >
                                                                    {janusState.message.participants[val]}
                                                                </li>
                                                            )
                                                        }
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="panel panel-default">
                                            <div className="panel-heading">
                                                <h3 className="panel-title">Public Chatroom</h3>
                                            </div>
                                            <div
                                                className="panel-body relative"
                                                style={{ overflowX: "auto", height: "460px" }}
                                                id="chatroom"
                                            >
                                                 <p style={{ color: janusState.message.color }}>
                                                    [{janusState.message.dateString}]
                                                    <i> {janusState.message.participants[janusState.message.username]} joined</i>
                                                </p> }
                                            </div>
                                            <div className="panel-footer">
                                                <div className="input-group margin-bottom-sm">
                                                    <span className="input-group-addon">
                                                        <i className="fa fa-cloud-upload fa-fw"></i>
                                                    </span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Write a chatroom message"
                                                        autoComplete="off"
                                                        id="datasend"
                                                        onKeyPress={(e) => handleCheckEnter(e)}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>

                <hr />
                <Footer />
            </div>
        </div>
    )
}
