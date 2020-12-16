import React, { useState, useEffect } from "react"
import JanusHelperVideoCall from "../janus/janusHelperVideoCall"

export default function LocalVideoCall(props) {
    const [toggleAudioMute, setToggleAudioMute] = useState(false)
    const [toggleVideoMute, setToggleVideoMute] = useState(false)
    const [datasendData, setDatasendData] = useState({ name: "", nameSet: false })

    useEffect(() => {
        const update = () => {
            const localVideoDom = document.getElementById("myvideo")
            if (props.stream && localVideoDom) {
                if (localVideoDom.srcObject === null) {
                    // console.log("localVideo Attach: ------------ ", props.stream, props.state)

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

        JanusHelperVideoCall.getInstance().janusPlugin.send({
            message: { request: "set", bitrate: bitrate },
        })
    }
    const handleToggleAudioMute = () => {
        JanusHelperVideoCall.getInstance().toggleAudioMute()
        setToggleAudioMute(!toggleAudioMute)
    }
    const handleToggleVideoMute = () => {
        JanusHelperVideoCall.getInstance().toggleVideoMute()
        setToggleVideoMute(!toggleVideoMute)
    }
    const handleCheckEnter = (event) => {
        var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
        if (theCode === 13) {
            if (event.target.id === "datasend") {
                setDatasendData({ name: event.target.value, nameSet: true })
                JanusHelperVideoCall.getInstance().sendData(event.target.value)
            }
            return false
        } else {
            return true
        }
    }
    const handlePublish = () => {
        JanusHelperVideoCall.getInstance().publishOwnFeed(true)
    }

    return (
        <div className="col-md-6">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        Local Stream {JanusHelperVideoCall.getInstance().myusername}
                        <div className="btn-group btn-group-xs pull-right hide">
                            <button className="btn btn-danger" autoComplete="off" id="toggleaudio" onClick={handleToggleAudioMute}>
                                Disable audio
                            </button>
                            <button className="btn btn-danger" autoComplete="off" id="togglevideo" onClick={handleToggleVideoMute}>
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
                <div className="panel-body" id="videoleft">
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
                        <video className="rounded centered" id="myvideo" width="100%" height="100%" autoPlay playsInline muted="muted" />
                    ) : null}
                </div>
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
                    value={datasendData.name}
                    disabled={datasendData.nameSet}
                    onChange={(e) => {
                        setDatasendData({ ...datasendData, name: e.target.value })
                    }}
                    onKeyPress={(e) => handleCheckEnter(e)}
                />
            </div>
        </div>
    )
}
