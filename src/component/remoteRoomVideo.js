import React, { useState, useEffect } from "react"
// import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"

export default function RemoteRoomVideo({ session, status }) {
    const [toggleAudioMute, setToggleAudioMute] = useState(true)
    const [toggleVideoMute, setToggleVideoMute] = useState(true)

    useEffect(() => {
        const update = () => {
            let remoteVideoDom = document.getElementById(`remotevideo${session.rfindex}`)
            let curresDom = document.getElementById(`curres${session.rfindex}`)
            let curbitrateDom = document.getElementById(`curbitrate${session.rfindex}`)

            if (session && remoteVideoDom && curresDom && curbitrateDom) {
                curresDom.innerHTML = remoteVideoDom.videoWidth + "x" + remoteVideoDom.videoHeight
                curbitrateDom.innerHTML = session.getBitrate()
            }
            setTimeout(() => update(), 1000)
        }
        update()
    })

    useEffect(() => {
        let target = document.getElementById("videoremote" + session.rfindex)
        let remoteVideoDom = document.getElementById(`remotevideo${session.rfindex}`)

        if (session.stream && !remoteVideoDom.srcObject) {
            window.Janus.attachMediaStream(remoteVideoDom, session.stream)
        }

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
    }, [session.videoTracks, status])

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
            ></span>
            <span
                className="label label-info"
                id={`curbitrate${session.rfindex}`}
                style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "0px",
                    margin: "15px 0",
                }}
            ></span>
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
            </div>
        </div>
    )
}
