import React, { useEffect } from "react"
import { useSelector } from "react-redux"
// import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"

export default function LocalRoomVideo(props) {
    const localVideoDom = document.getElementById("myvideo")
    const videoState = useSelector((state) => state.video)
    useEffect(() => {
        const update = () => {
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

    // const handlePublish = () => {
    //     JanusHelperVideoRoom.getInstance().publishOwnFeed(true)
    // }

    return (
        <div id="videolocal" className="videolocal">
            {props.state === "DISCONNECTED" || !videoState.video ? (
                <div className="no-video-container">
                    <i className="fa fa-video-camera fa-5 no-video-icon"></i>
                    <span className="no-video-text">No video available</span>
                </div>
            ) : props.state === "RUNNING" ? (
                <div className="blockingUI">
                    <div className="blockingElement">
                        <b>Publishing...</b>
                    </div>
                </div>
            ) : props.state === "CONNECTED" ? (
                <video className="rounded centered" id="myvideo" width="100%" height="100%" autoPlay playsInline />
            ) : null}
        </div>
    )
}
