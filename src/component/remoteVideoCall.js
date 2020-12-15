import React, { useState, useEffect } from "react"

export default function RemoteVideoCall(props) {
    // const [bitRate, setBitRate] = useState(0)
    const [videoSizeText, setVideoSizeText] = useState("")
    // const [toggleAudioMute, setToggleAudioMute] = useState(true)
    // const [toggleVideoMute, setToggleVideoMute] = useState(true)

    useEffect(() => {
        const update = () => {
            let remoteVideoDom = document.getElementById("remotevideo")
            if (props.session && remoteVideoDom) {
                setVideoSizeText(remoteVideoDom.videoWidth + "x" + remoteVideoDom.videoHeight)
            }
            if (props.session && remoteVideoDom) {
                if (remoteVideoDom.srcObject == null) {
                    // console.log("remoteVideo Attach: ------------ ", props.session, remoteVideoDom)
                    window.Janus.attachMediaStream(remoteVideoDom, props.session.stream)
                }
            }
            setTimeout(update, 1000)
        }
        update()
    }, [props])

    // const handleToggleAudioMute = () => {
    //     const dom = document.getElementById("remotevideo")
    //     if (dom) {
    //         dom.muted = toggleAudioMute
    //         // JanusHelperVideoRoom.getInstance().toggleAudioMute(props.session)
    //     }
    //     setToggleAudioMute(!toggleAudioMute)
    // }
    // const handleToggleVideoMute = () => {
    //     // JanusHelperVideoRoom.getInstance().toggleVideoMute(props.session)
    //     setToggleVideoMute(!toggleVideoMute)
    // }
    const NoVideo = () => (
        <div className="no-video-container">
            <i className="fa fa-video-camera fa-5 no-video-icon"></i>
            <span className="no-video-text">No remote video available</span>
        </div>
    )

    return (
        <div className="col-md-6">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title">
                        Remote Stream
                        <span className="label label-info" id="callee">
                            {props.session.rfdisplay}
                        </span>
                        <span className="label label-primary" id="curres">
                            {videoSizeText}
                        </span>
                        <span className="label label-info" id="curbitrate">
                            {props.session.getBitrate()}
                        </span>
                    </h3>
                </div>
                <div className="panel-body" id="videoright">
                    {props.session === undefined ? (
                        <NoVideo />
                    ) : (
                        <video className="rounded centered" id="remotevideo" width="100%" height="100%" autoPlay playsInline />
                    )}
                </div>
            </div>
            <div className="input-group margin-bottom-sm">
                <span className="input-group-addon">
                    <i className="fa fa-cloud-download fa-fw"></i>
                </span>
                <input className="form-control" type="text" id="datarecv" value={props.datarecv} disabled />
            </div>
        </div>
    )
}
