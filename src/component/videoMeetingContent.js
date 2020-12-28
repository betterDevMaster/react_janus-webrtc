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

    // console.log("state: ------------- ", janusState, videoState, chatState, status1.includes(janusState.status))
    return (
        status1.includes(janusState.status) && (
            <div id="videos" style={{ width: "100%", height: "100%", position: "relative" }}>
                {janusState.stream.local && (
                    <LocalRoomVideo
                        index={videoState.index}
                        select={videoState.select}
                        video={videoState.video}
                        pluginType={janusState.pluginType}
                        janusState={janusState.status}
                        stream={janusState.stream}
                        showChatPanel={chatState.showPanel}
                    />
                )}
                {/* <div className="remoteContainer"> */}
                {janusState.stream.remote &&
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
