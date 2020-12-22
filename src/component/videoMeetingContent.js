import React, { useState, useMemo, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as qs from "query-string"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"
import LocalRoomVideo from "../component/localRoomVideo"
import RemoteRoomVideo from "../component/remoteRoomVideo"

export default function VideoMeetingContent(props) {
    const dispatch = useDispatch()
    const janusState = useSelector((state) => state.janus)
    const videoState = useSelector((state) => state.video)
    const query = qs.parse(window.location.search)

    const status1 = useMemo(() => ["RUNNING", "CONNECTED", "DISCONNECTED"], [])

    useEffect(() => {
        JanusHelperVideoRoom.getInstance().init(dispatch, "videoRoom", "janus.plugin.videoroom")
        JanusHelperVideoRoom.getInstance().start(query.room)
    }, [dispatch])

    useEffect(() => {
        // if (janusState.status === "ATTACHED") JanusHelperVideoRoom.getInstance().registerUsername(videoState.name)
        if (janusState.status === "ATTACHED") JanusHelperVideoRoom.getInstance().registerUsername("test")
    }, [janusState])

    // console.log("state: ------------- ", janusState, videoState)
    return (
        status1.includes(janusState.status) && (
            <div id="videos" style={{ width: "100%", height: "100%", position: "relative" }}>
                {janusState.stream.local && (
                    <LocalRoomVideo
                        index={videoState.index}
                        select={videoState.select}
                        state={janusState.status}
                        stream={janusState.stream.local}
                        video={videoState.video}
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
