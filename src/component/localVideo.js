import React, { useState, useEffect } from "react"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"

export default function LocalVideo({ stream, userName }) {
    const [toggleMute, setToggleMute] = useState(false)
    const [publish, setPublish] = useState(true)

    const update = () => {
        const localVideoDom = document.getElementById("myvideo")

        if (stream && localVideoDom) {
            if (localVideoDom.srcObject == null) {
                window.Janus.attachMediaStream(localVideoDom, stream)
            }
        }
        setTimeout(update, 1000)
    }

    useEffect(() => {
        update()
    }, [])

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

    const handleToggleMute = () => {
        setToggleMute(!toggleMute)
        JanusHelperVideoRoom.getInstance().toggleMute()
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
        <div className="col-md-4">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        Local Video
                        <span className="label label-primary" id="publisher">
                            {userName}
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
                    {!stream ? (
                        <div className="no-video-container">
                            <i className="fa fa-video-camera fa-5 no-video-icon"></i>
                            <span className="no-video-text">No remote video available</span>
                        </div>
                    ) : !publish ? (
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
                    )}
                </div>
            </div>
        </div>
    )
}
