import React, { useState, useEffect } from "react"
import JanusHelperLectureRoom from "../janus/janusHelperLectureRoom"

export default function LocalLectureVideo(props) {
    const [toggleAudioMute, setToggleAudioMute] = useState(false)
    const update = () => {
        const localVideoDom = document.getElementById("myvideo")
        if (props.stream && localVideoDom) {
            if (localVideoDom.srcObject === null) {
                window.Janus.attachMediaStream(localVideoDom, props.stream)
            }
        }
        setTimeout(() => update(), 1000)
    }

    useEffect(() => {
        update()
    }, [props])

    const handleBitrate = (rate) => {
        var bitrate = rate * 1000
        if (bitrate === 0) {
            window.Janus.log("Not limiting bandwidth via REMB")
        } else {
            window.Janus.log("Capping bandwidth to " + bitrate + " via REMB")
        }

        JanusHelperLectureRoom.getInstance().janusPlugin.send({
            message: { request: "configure", bitrate: bitrate },
        })
    }
    const handleToggleAudioMute = () => {
        JanusHelperLectureRoom.getInstance().toggleAudioMute()
        setToggleAudioMute(!toggleAudioMute)
    }
    const handleUnpublish = () => {
        JanusHelperLectureRoom.getInstance().unpublishOwnFeed()
    }
    const handlePublish = () => {
        JanusHelperLectureRoom.getInstance().publishOwnFeed(true)
    }
    const handleCheckEnter = (event) => {
        var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
        if (theCode === 13) {
            if (event.target.id === "username") JanusHelperLectureRoom.getInstance().registerUsername(event.target.value)
            return false
        } else {
            return true
        }
    }

    return (
        <div className="col-md-6">
            <div className="row">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">
                            Local Stream
                            <span className="label label-primary" id="publisher">
                                {props.userName}
                            </span>
                            <div className="btn-group btn-group-xs pull-right">
                                <button className="btn btn-danger" autoComplete="off" id="toggleaudio">
                                    Disable audio
                                </button>
                                <button className="btn btn-danger" autoComplete="off" id="togglevideo">
                                    Disable video
                                </button>
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
                        {props.state === "DISCONNECTED" ? (
                            <div>
                                <button className="btn btn-primary" id="unpublish" onClick={handlePublish}>
                                    Publish
                                </button>
                                <b
                                    style={{
                                        float: "right",
                                        padding: "10px",
                                    }}
                                >
                                    No video available
                                </b>
                            </div>
                        ) : props.state === "RUNNING" ? (
                            <div className="blockingUI">
                                <div className="blockingElement">
                                    <b>Publishing...</b>
                                </div>
                            </div>
                        ) : props.state === "CONNECTED" ? (
                            <div className="panel-body" id="videoleft">
                                <video className="rounded centered " id="myvideo" width="432" height="240" muted="muted"></video>
                                <canvas
                                    id="canvas"
                                    width="432"
                                    height="240"
                                    style={{ display: "block", margin: "auto", padding: "0" }}
                                ></canvas>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">Tweaks</h3>
                    </div>
                    <div className="panel-body" id="tweaks">
                        <div className="input-group margin-bottom-sm">
                            <span className="input-group-addon">
                                <i className="fa fa-font fa-fw"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                autoComplete="off"
                                id="font"
                                onKeyPress={(e) => handleCheckEnter(e)}
                            ></input>
                        </div>
                        <div className="input-group margin-bottom-sm">
                            <span className="input-group-addon">
                                <i className="fa fa-eraser fa-fw"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                autoComplete="off"
                                id="color"
                                onKeyPress={(e) => handleCheckEnter(e)}
                            ></input>
                        </div>
                        <div className="input-group margin-bottom-sm">
                            <span className="input-group-addon">
                                <i className="fa fa-text-width fa-fw"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                autoComplete="off"
                                id="posX"
                                onKeyPress={(e) => handleCheckEnter(e)}
                            ></input>
                        </div>
                        <div className="input-group margin-bottom-sm">
                            <span className="input-group-addon">
                                <i className="fa fa-text-height fa-fw"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                autoComplete="off"
                                id="posY"
                                onKeyPress={(e) => handleCheckEnter(e)}
                            ></input>
                        </div>
                        <div className="input-group margin-bottom-sm">
                            <span className="input-group-addon">
                                <i className="fa fa-edit fa-fw"></i>
                            </span>
                            <input
                                className="form-control"
                                type="text"
                                autoComplete="off"
                                id="text"
                                onKeyPress={(e) => handleCheckEnter(e)}
                            ></input>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
