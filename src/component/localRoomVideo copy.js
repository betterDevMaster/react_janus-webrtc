import React, { useState, useEffect } from "react"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"

export default function LocalRoomVideo(props) {
    const [toggleAudioMute, setToggleAudioMute] = useState(false)
    const [hover, setHover] = useState(false)
    useEffect(() => {
        const update = () => {
            const localVideoDom = document.getElementById("myvideo")
            if (props.stream && localVideoDom) {
                if (localVideoDom.srcObject === null) {
                    window.Janus.attachMediaStream(localVideoDom, props.stream)
                }
            }
            setTimeout(function () {
                update()
            }, 1000)
        }
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
        <div className="col-md-4" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="panel panel-default">
                <div
                    className="panel-heading"
                    style={{
                        display: !hover ? "none" : "block",
                        position: "absolute",
                        width: "100%",
                        padding: "10px 17px",
                        top: "8px",
                        zIndex: 1,
                        color: "burlywood",
                    }}
                >
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
                                        <button onClick={() => handleBitrate(0)}>No limit</button>
                                        {/* <a href="#" id="0" onClick={() => handleBitrate(0)}>
                                                No limit
                                            </a> */}
                                    </li>
                                    <li>
                                        <button onClick={() => handleBitrate(0)}>No limit</button>
                                        {/* <a href="#" id="128" onClick={() => handleBitrate(128)}>
                                                Cap to 128kbit
                                            </a> */}
                                    </li>
                                    <li>
                                        <button onClick={() => handleBitrate(256)}>Cap to 256kbit</button>
                                        {/* <a href="#" id="256" onClick={() => handleBitrate(256)}>
                                                Cap to 256kbit
                                            </a> */}
                                    </li>
                                    <li>
                                        <button onClick={() => handleBitrate(512)}>Cap to 512kbit</button>
                                        {/* <a href="#" id="512" onClick={() => handleBitrate(512)}>
                                                Cap to 512kbit
                                            </a> */}
                                    </li>
                                    <li>
                                        <button onClick={() => handleBitrate(1024)}>Cap to 1mbit</button>
                                        {/* <a href="#" id="1024" onClick={() => handleBitrate(1024)}>
                                                Cap to 1mbit
                                            </a> */}
                                    </li>
                                    <li>
                                        <button onClick={() => handleBitrate(1500)}>Cap to 1.5mbit</button>
                                        {/* <a href="#" id="1500" onClick={() => handleBitrate(1500)}>
                                                Cap to 1.5mbit
                                            </a> */}
                                    </li>
                                    <li>
                                        <button onClick={() => handleBitrate(2000)}>Cap to 2mbit</button>
                                        {/* <a href="#" id="2000" onClick={() => handleBitrate(2000)}>
                                                Cap to 2mbit
                                            </a> */}
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
                            <div
                                style={{
                                    display: !hover ? "none" : "flex",
                                    position: "absolute",
                                    width: "100%",
                                    padding: "0 31px 0 1px",
                                    bottom: "17px",
                                    justifyContent: "space-between",
                                }}
                            >
                                <button className="btn btn-warning btn-xs" id="mute" onClick={handleToggleAudioMute}>
                                    {!toggleAudioMute ? "Mute" : "Unmute"}
                                </button>
                                <button className="btn btn-warning btn-xs" id="unpublish" onClick={handleUnpublish}>
                                    Unpublish
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
