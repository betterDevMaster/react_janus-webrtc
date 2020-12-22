import React, { useEffect } from "react"

export default function LocalRoomVideo(props) {
    useEffect(() => {
        localStorage.setItem("publisher", props.name)
        const update = () => {
            const localVideoDom = document.getElementById("myvideo")
            if (props.stream && localVideoDom)
                if (localVideoDom.srcObject === null) window.Janus.attachMediaStream(localVideoDom, props.stream)

            setTimeout(function () {
                update()
            }, 1000)
        }
        update()
    }, [])

    // const handlePublish = () => {
    //     JanusHelperVideoRoom.getInstance().publishOwnFeed(true)
    // }

    return (
        <div
            className={props.select ? "videoremote" : "videolocal"}
            id="videolocal"
            style={{ top: props.select ? 20 : 0, right: props.select ? 50 : 0 }}
        >
            {props.state === "DISCONNECTED" || !props.video ? (
                <div className="no-video-container">
                    <i className={props.select ? "fa fa-video-camera fa-4" : "fa fa-video-camera fa-5 no-video-icon"}></i>
                    <span className="no-video-text" style={{ fontSize: props.select ? 18 : 25 }}>
                        No video available
                    </span>
                </div>
            ) : props.state === "RUNNING" ? (
                <div className="blockingUI">
                    <div className="blockingElement">
                        <b>Publishing...</b>
                    </div>
                </div>
            ) : props.state === "CONNECTED" ? (
                <div className="full">
                    <video className="rounded centered relative full" id="myvideo" autoPlay playsInline />
                    {props.select ? <span style={{ position: "absolute", left: "20px", bottom: "15px" }}>Me</span> : null}
                </div>
            ) : null}
        </div>
    )
}
