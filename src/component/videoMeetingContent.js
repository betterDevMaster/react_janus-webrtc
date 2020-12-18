import React, { useState, useMemo, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as qs from "query-string"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"
import LocalRoomVideo from "../component/localRoomVideo"
import RemoteRoomVideo from "../component/remoteRoomVideo"

export default function VideoMeetingContent(props) {
    const dispatch = useDispatch()
    const janusState = useSelector((state) => state.janus)
    const [userName, setUserName] = useState("")
    const query = qs.parse(window.location.search)

    const status1 = useMemo(() => ["RUNNING", "CONNECTED", "DISCONNECTED"], [])

    useEffect(() => {
        JanusHelperVideoRoom.getInstance().init(dispatch, "videoRoom", "janus.plugin.videoroom")
        JanusHelperVideoRoom.getInstance().start(query.room)
    }, [dispatch])

    useEffect(() => {
        if (janusState.status === "ATTACHED") JanusHelperVideoRoom.getInstance().registerUsername(query.name)
    }, [janusState])

    return (
        status1.includes(janusState.status) && (
            <div className="container" id="videos">
                <div className="row">
                    {janusState.stream.local && (
                        <LocalRoomVideo stream={janusState.stream.local} userName={userName} state={janusState.status} />
                    )}

                    {janusState.stream.remote &&
                        janusState.stream.remote.map((session, i) => {
                            if (session)
                                return <RemoteRoomVideo key={i} session={session} status={janusState.status} muteInfo={props.contextInfo} />
                        })}
                </div>
            </div>
        )
    )
}
