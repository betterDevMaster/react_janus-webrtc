import React, { useEffect } from "react"

export default function LocalRoomVideo(props) {
    useEffect(() => {
        const update = () => {
            // if (props.pluginType === "videoRoom") {
            const localVideoDom = document.getElementById("myvideo")
            if (props.stream.local && localVideoDom)
                if (localVideoDom.srcObject === null) window.Janus.attachMediaStream(localVideoDom, props.stream.local)
            // }
            // if (props.pluginType === "screenShare") {
            const screenVideoDom = document.getElementById("screenvideo")
            if (props.stream.sharedLocal && screenVideoDom)
                if (screenVideoDom.srcObject === null) {
                    window.Janus.attachMediaStream(screenVideoDom, props.stream.sharedLocal)
                }
            // }
        }

        setTimeout(() => {
            update()
        }, 500)
    }, [props.janusState, props.videoState])

    return (
        <div
            className={props.select ? "videoremote" : "videolocal"}
            id="videolocal"
            style={{ top: props.select ? 20 : 0, right: props.select ? 50 : 0 }}
        >
            {props.janusState === "DISCONNECTED" || (!props.video && props.pluginType === "videoRoom") ? (
                <div className="no-video-container">
                    <img className={props.select ? "no-video-small-icon" : " no-video-icon"} src="img/no_video.svg" alt="Video Icon" />
                    {/* <i className={props.select ? "fa fa-video-camera fa-4" : "fa fa-video-camera fa-5 no-video-icon"}></i> */}
                    <span className="no-video-text" style={{ fontSize: props.select ? 18 : 25 }}>
                        No video available
                    </span>
                </div>
            ) : props.janusState === "RUNNING" ? (
                <div className="blockingUI">
                    <div className="blockingElement">
                        <b>Publishing...</b>
                    </div>
                </div>
            ) : props.janusState === "CONNECTED" ? (
                <div className="full">
                    <video className="rounded centered relative full" id="myvideo" autoPlay playsInline />
                    {props.select ? <span style={{ position: "absolute", left: "20px", bottom: "15px" }}>Me</span> : null}

                    <video
                        className="rounded centered absolution screenshare"
                        id="screenvideo"
                        // width="100%"
                        // height="100%"
                        autoPlay
                        playsInline
                        muted="muted"
                    />
                </div>
            ) : null}
        </div>
    )
}
