import React, { useState, useEffect } from "react"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"

export default function RemoteVideo({ session }) {
    const [bitRate, setBitRate] = useState(0)
    const [videoSizeText, setVideoSizeText] = useState("")
    const [toggleAudioMute, setToggleAudioMute] = useState(true)
    const [toggleVideoMute, setToggleVideoMute] = useState(true)

    useEffect(() => {
        update()
    }, [])

    const update = () => {
        let remoteVideoDom = document.getElementById(`remotevideo${session.rfindex}`)
        if (session && remoteVideoDom) {
            setBitRate(session.getBitrate())
            setVideoSizeText(remoteVideoDom.videoWidth + "x" + remoteVideoDom.videoHeight)
        }
        if (session.stream && remoteVideoDom) {
            if (remoteVideoDom.srcObject == null) {
                console.log("remoteVideo Attach: ------------ ")
                // console.log("Attach stream to video tag")
                window.Janus.attachMediaStream(remoteVideoDom, session.stream)
            }
        }
        setTimeout(update, 1000)
    }
    const handleToggleAudioMute = () => {
        const dom = document.getElementById(`remotevideo${session.rfindex}`)
        if (dom) {
            dom.muted = toggleAudioMute
            // JanusHelperVideoRoom.getInstance().toggleAudioMute(session)
        }
        setToggleAudioMute(!toggleAudioMute)
    }
    const handleToggleVideoMute = () => {
        // JanusHelperVideoRoom.getInstance().toggleVideoMute(session)
        setToggleVideoMute(!toggleVideoMute)
    }
    const NoVideo = () => (
        <div className="no-video-container">
            <i className="fa fa-video-camera fa-5 no-video-icon"></i>
            <span className="no-video-text">No remote video available</span>
        </div>
    )

    const VideoFooter = () => (
        <>
            <span
                className="label label-primary"
                id={`curres${session.rfindex}`}
                style={{
                    position: "absolute",
                    bottom: "2px",
                    left: "0px",
                    margin: "15px 0",
                }}
            >
                {videoSizeText}
            </span>
            <span
                className="label label-info"
                id={`curbitrate${session.rfindex}`}
                style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "0px",
                    margin: "15px 0",
                }}
            >
                {bitRate}
            </span>
            <button
                className="btn btn-warning btn-xs"
                id="audioMute"
                onClick={handleToggleAudioMute}
                style={{ position: "absolute", bottom: "-20px", left: "0px", margin: "15px 0" }}
            >
                {!toggleAudioMute ? "Enable audio" : "Disable audio"}
            </button>
            <button
                className="btn btn-warning btn-xs"
                id="videoMute"
                onClick={handleToggleVideoMute}
                style={{ position: "absolute", bottom: "-20px", right: "0px", margin: "15px 0" }}
            >
                {!toggleVideoMute ? "Enable video" : "Disable video"}
            </button>
        </>
    )
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
                        <NoVideo />
                    ) : // <div className="no-video-container">
                    //     <i className="fa fa-video-camera fa-5 no-video-icon"></i>
                    //     <span className="no-video-text">No remote video available</span>
                    // </div>
                    !toggleVideoMute ? (
                        <>
                            <NoVideo />
                            <VideoFooter />
                        </>
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
                            <VideoFooter />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
