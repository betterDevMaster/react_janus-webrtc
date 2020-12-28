import React, { useEffect } from "react"

export default function LocalRoomVideo(props) {
    useEffect(() => {
        const update = () => {
            const localVideoDom = document.getElementById("myvideo")
            if (props.stream.local && localVideoDom)
                if (localVideoDom.srcObject === null) {
                    window.Janus.attachMediaStream(localVideoDom, props.stream.local)
                }
            const screenVideoDom = document.getElementById("screenvideo")
            if (props.stream.sharedLocal && screenVideoDom)
                if (screenVideoDom.srcObject === null) {
                    window.Janus.attachMediaStream(screenVideoDom, props.stream.sharedLocal)
                }
        }

        setTimeout(() => {
            update()
        }, 500)
    }, [props.janusState, props.video, props.stream.local, props.stream.sharedLocal])

    const NoVideo = () => (
        <div className="no-video-container" style={{ display: props.video ? "none" : "flex" }}>
            <img className={props.select ? "no-video-small-icon" : " no-video-icon"} src="img/no_video.svg" alt="Video Icon" />
            <span className="no-video-text" style={{ fontSize: props.select ? 18 : 25 }}>
                No video available
            </span>
        </div>
    )

    // console.log(props.janusState, props.video, typeof props.video, props.pluginType)
    return (
        <div
            className={props.select ? "videoremote" : "videolocal"}
            id="videolocal"
            style={{ top: props.select ? 20 : 0, right: props.select ? "5%" : 0 }}
        >
            {props.stream.sharedLocal ? (
                <video className="rounded centered absolution screenshare" id="screenvideo" autoPlay playsInline muted="muted" />
            ) : null}
            {props.select ? <span style={{ position: "absolute", left: "20px", top: "15px", zIndex: 1 }}>Me</span> : null}

            {props.janusState === "DISCONNECTED" || (!props.video && props.pluginType === "videoRoom") ? (
                <NoVideo />
            ) : props.janusState === "RUNNING" ? (
                <div className="blockingUI">
                    <div className="blockingElement">
                        <b>Publishing...</b>
                    </div>
                </div>
            ) : props.janusState === "CONNECTED" ? (
                <video className="rounded centered relative full" id="myvideo" autoPlay playsInline muted="muted" />
            ) : null}
        </div>
    )
}
