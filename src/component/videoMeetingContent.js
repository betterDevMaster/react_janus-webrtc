import React, { useMemo, useEffect } from "react"
import { useSelector } from "react-redux"
import LocalRoomVideo from "../component/localRoomVideo"
import RemoteRoomVideo from "../component/remoteRoomVideo"

export default function VideoMeetingContent(props) {
    const janusState = useSelector((state) => state.janus)
    const videoState = useSelector((state) => state.video)
    const chatState = useSelector((state) => state.chat)
    const status1 = useMemo(() => ["RUNNING", "CONNECTED", "DISCONNECTED"], [])

    useEffect(() => {
        if (janusState.status === "ATTACHED" && janusState.pluginType === "videoRoom") {
            window.roomHelper.registerUsername(videoState.name)
        }
    }, [janusState, videoState.name])

    // console.log("state: ------------- ", janusState, videoState)
    return (
        status1.includes(janusState.status) && (
            <div id="videos" style={{ width: "100%", height: "100%", position: "relative" }}>
                {(janusState.stream.local || janusState.stream.sharedLocal) && (
                    <LocalRoomVideo
                        index={videoState.index}
                        pluginType={janusState.pluginType}
                        select={videoState.select}
                        janusState={janusState.status}
                        videoState={videoState.video}
                        showChatPanel={chatState.showPanel}
                        stream={janusState.stream}
                        video={videoState.video}
                    />
                )}
                {/* <div className="remoteContainer"> */}
                {(janusState.stream.remote || janusState.stream.sharedRemote) &&
                    janusState.stream.remote.map((session, i) => {
                        if (session)
                            return (
                                <RemoteRoomVideo
                                    key={i}
                                    index={videoState.index}
                                    session={session}
                                    showChatPanel={chatState.showPanel}
                                    status={janusState.status}
                                    videoLength={janusState.stream.remote.length}
                                />
                            )
                    })}
                {/* </div> */}
            </div>
        )
    )
}
