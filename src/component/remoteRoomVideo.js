import React, { useState, useEffect } from "react"
import { useDispatch } from "react-redux"

export default function RemoteRoomVideo({ session, status, muteInfo, videoLength, index }) {
    const [videoSelect, setVideoSelect] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        let target = document.getElementById("videoremote" + session.rfindex)
        let remoteVideoDom = document.getElementById(`remotevideo${session.rfindex}`)

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

    useEffect(() => {
        if (index !== session.rfindex) setVideoSelect(false)
    }, [index])

    const NoVideo = () => (
        <div className="no-video-container" style={{ display: session.videoTracks && session.videoTracks.length !== 0 ? "none" : "flex" }}>
            <i className="fa fa-video-camera fa-4"></i>
            <span className="no-video-text">No remote video available</span>
        </div>
    )
    const handleRemoteVideo = () => {
        if (videoLength > 1) {
            setVideoSelect(true)
            dispatch({ type: "VIDEO_SELECT", name: session.rfdisplay, select: true, index: session.rfindex })
        }
    }
    // console.log("videoTrack: ------------- ", session)
    // console.log("videoTrack: ------------- ", session.videoTracks, session.videoTracks.length)
    return (
        <div
            className={!videoSelect ? "videoremote" : "videolocal"}
            id={`videoremote${session.rfindex}`}
            style={{ top: session.rfindex < index ? session.rfindex * 165 + 20 : (session.rfindex - 1) * 165 + 20, right: "5%" }}
            onClick={handleRemoteVideo}
        >
            <video
                className="rounded centered relative full"
                style={{ display: session.videoTracks && session.videoTracks.length === 0 ? "none" : "flex" }}
                id={`remotevideo${session.rfindex}`}
                autoPlay
                playsInline
            ></video>
            {!videoSelect ? (
                <span
                    style={{
                        position: "absolute",
                        left: "20px",
                        top: "15px",
                        // top: session.videoTracks && session.videoTracks.length === 0 ? "10px" : "none",
                    }}
                >
                    {session.rfdisplay}
                </span>
            ) : null}
            <NoVideo />
        </div>
    )
}
