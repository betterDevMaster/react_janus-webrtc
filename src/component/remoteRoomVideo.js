import React, { useState, useEffect } from "react"
// import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"

export default function RemoteRoomVideo({ session, status, muteInfo }) {
    const [toggleAudioMute, setToggleAudioMute] = useState(false)
    const [toggleVideoMute, setToggleVideoMute] = useState(false)
    const [hover, setHover] = useState(false)

    useEffect(() => {
        const update = () => {
            let remoteVideoDom = document.getElementById(`remotevideo${session.rfindex}`)
            let curresDom = document.getElementById(`curres${session.rfindex}`)
            let curbitrateDom = document.getElementById(`curbitrate${session.rfindex}`)

            if (session && remoteVideoDom && curresDom && curbitrateDom) {
                curresDom.innerHTML = remoteVideoDom.videoWidth + "x" + remoteVideoDom.videoHeight
                curbitrateDom.innerHTML = session.getBitrate()
            }
            setTimeout(function () {
                update()
            }, 1000)
        }
        update()
    })
    useEffect(() => {
        let target = document.getElementById("videoremote" + session.rfindex)
        let remoteVideoDom = document.getElementById(`remotevideo${session.rfindex}`)
        if (muteInfo.type === "audio" && muteInfo.mute && muteInfo.display === session.rfdisplay) {
            remoteVideoDom.srcObject.getAudioTracks()[0].enabled = !toggleAudioMute // unmute
            remoteVideoDom.muted = !toggleAudioMute
            setToggleAudioMute(!toggleAudioMute)
        }
        if (muteInfo.mute && muteInfo.display === session.rfdisplay && muteInfo.type === "video") setToggleVideoMute(!toggleVideoMute)
        if (session.stream && !remoteVideoDom.srcObject) window.Janus.attachMediaStream(remoteVideoDom, session.stream)
        if (session.spinner) {
            session.spinner.stop()
            session.spinner = null
        }
        if (!session.videoTracks || session.videoTracks.length === 0) {
            session.spinner = new window.Spinner({ top: "50%" }).spin(target)
            remoteVideoDom.classList.add("hide")
        } else {
            remoteVideoDom.classList.remove("hide")
        }
    }, [session.videoTracks, status, muteInfo])

    const handleToggleAudioMute = () => {
        const dom = document.getElementById(`remotevideo${session.rfindex}`)
        if (dom) {
            dom.srcObject.getAudioTracks()[0].enabled = !toggleAudioMute // unmute
            dom.muted = !toggleAudioMute
            // JanusHelperVideoRoom.getInstance().toggleAudioMute(session)
        }
        setToggleAudioMute(!toggleAudioMute)
    }
    const handleToggleVideoMute = () => {
        // JanusHelperVideoRoom.getInstance().toggleVideoMute(session)
        setToggleVideoMute(!toggleVideoMute)
    }
    const VideoFooter = () => (
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
            <span
                className="label label-primary"
                id={`curres${session.rfindex}`}
                // style={{
                //     position: "absolute",
                //     bottom: "2px",
                //     left: "0px",
                //     margin: "15px 0",
                // }}
            ></span>
            <span
                className="label label-info"
                id={`curbitrate${session.rfindex}`}
                // style={{
                //     position: "absolute",
                //     bottom: "2px",
                //     right: "0px",
                //     margin: "15px 0",
                // }}
            ></span>
            <button
                className="btn btn-warning btn-xs"
                id="audioMute"
                onClick={handleToggleAudioMute}
                // style={{ position: "absolute", bottom: "-20px", left: "0px", margin: "15px 0" }}
            >
                {toggleAudioMute ? "Enable audio" : "Disable audio"}
            </button>
            <button
                className="btn btn-warning btn-xs"
                id="videoMute"
                onClick={handleToggleVideoMute}
                // style={{ position: "absolute", bottom: "-20px", right: "0px", margin: "15px 0" }}
            >
                {toggleVideoMute ? "Enable video" : "Disable video"}
            </button>
        </div>
    )
    const NoVideo = () => (
        <div className="no-video-container" style={{ display: !toggleVideoMute ? "none" : "block" }}>
            <i className="fa fa-video-camera fa-5 no-video-icon"></i>
            <span className="no-video-text">No remote video available</span>
        </div>
    )

    return (
        <div className="col-md-4" key={session.rfindex} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
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
                        Remote Video #{session.rfindex}
                        <span className="label label-info" id={`remote${session.rfindex}`}>
                            {session.rfdisplay}
                        </span>
                    </h3>
                </div>
                <div className="panel-body relative" id={`videoremote${session.rfindex}`}>
                    {/* {muteInfo.mute && muteInfo.display === session.rfdisplay && muteInfo.type === "video" ? (
                        <NoVideo />
                    ) : ( */}
                    <>
                        <div style={{ display: toggleVideoMute ? "none" : "block" }}>
                            <video
                                className="rounded centered relative"
                                id={`remotevideo${session.rfindex}`}
                                width="100%"
                                height="100%"
                                autoPlay
                                playsInline
                            ></video>
                            <VideoFooter />
                        </div>
                        <NoVideo />
                    </>
                    {/* )} */}
                </div>
            </div>
        </div>
    )
}
