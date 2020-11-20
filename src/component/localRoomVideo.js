import React, { useState, useEffect } from "react"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"

export default function LocalRoomVideo(props) {
    const [toggleAudioMute, setToggleAudioMute] = useState(false)
    const update = () => {
        const localVideoDom = document.getElementById("myvideo")
        if (props.stream && localVideoDom) {
            if (localVideoDom.srcObject === null) {
                window.Janus.attachMediaStream(localVideoDom, props.stream)
            }
        }
        setTimeout(update, 1000)
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

        JanusHelperVideoRoom.getInstance().janusPlugin.send({
            message: { request: "configure", bitrate: bitrate },
        })
    }
    const handleToggleAudioMute = () => {
        JanusHelperVideoRoom.getInstance().toggleAudioMute()
        setToggleAudioMute(!toggleAudioMute)
    }
    const handleUnpublish = () => {
        JanusHelperVideoRoom.getInstance().unpublishOwnFeed()
    }
    const handlePublish = () => {
        JanusHelperVideoRoom.getInstance().publishOwnFeed(true)
    }

    return (
        <div className="col-md-4">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        Local Video
                        <span className="label label-primary" id="publisher">
                            {props.userName}
                        </span>
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
                                onClick={handleToggleAudioMute}
                                style={{ position: "absolute", bottom: "0px", left: "0px", margin: "15px" }}
                            >
                                {!toggleAudioMute ? "Mute" : "Unmute"}
                            </button>
                            <button
                                className="btn btn-warning btn-xs"
                                id="unpublish"
                                onClick={handleUnpublish}
                                style={{
                                    position: "absolute",
                                    bottom: "0px",
                                    right: "0px",
                                    margin: "15px",
                                }}
                            >
                                Unpublish
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
