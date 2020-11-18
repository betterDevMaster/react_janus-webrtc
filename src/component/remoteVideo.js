import React, { useState, useEffect } from "react"

export default function RemoteVideo({ session }) {
    const [bitRate, setBitRate] = useState(0)
    const [videoSizeText, setVideoSizeText] = useState("")
    const update = () => {
        const remoteVideoDom = document.getElementById(`remotevideo${session.rfindex}`)

        if (session && session.getBitrate && remoteVideoDom) {
            setBitRate(session.getBitrate())
            setVideoSizeText(remoteVideoDom.videoWidth + "x" + remoteVideoDom.videoHeight)
        }
        if (session.stream && remoteVideoDom) {
            if (remoteVideoDom.srcObject == null) {
                // console.log("Attach stream to video tag")
                window.Janus.attachMediaStream(remoteVideoDom, session.stream)
            }
        }
        setTimeout(update, 1000)
    }

    useEffect(() => {
        update()
    }, [])
    return (
        <div className="col-md-4" key={session.rfindex}>
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        Remote Video #{session.rfindex}
                        <span className="label label-info" id={`remote${session.rfindex}`}>
                            {session.rfdisplay}
                        </span>
                    </h3>
                </div>
                <div className="panel-body relative" id={`videoremote${session.rfindex}`}>
                    {session.stream === undefined ? (
                        <div className="no-video-container">
                            <i className="fa fa-video-camera fa-5 no-video-icon"></i>
                            <span className="no-video-text">No remote video available</span>
                        </div>
                    ) : (
                        <>
                            <video
                                className="rounded centered relative"
                                id={`remotevideo${session.rfindex}`}
                                width="100%"
                                height="100%"
                                autoPlay
                                playsInline
                            ></video>
                            <span
                                className="label label-primary"
                                id={`curres${session.rfindex}`}
                                style={{
                                    position: "absolute",
                                    bottom: "0px",
                                    left: "0px",
                                    margin: "15px",
                                }}
                            >
                                {videoSizeText}
                            </span>
                            <span
                                className="label label-info"
                                id={`curbitrate${session.rfindex}`}
                                style={{
                                    position: "absolute",
                                    bottom: "0px",
                                    right: "0px",
                                    margin: "15px",
                                }}
                            >
                                {bitRate}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
