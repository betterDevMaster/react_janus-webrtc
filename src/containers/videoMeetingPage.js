import React, { useState } from "react"
import "../assets/videoMeeting.css"
import TopBar from "../component/videoMeetingTopbar"
import FooterBar from "../component/videoMeetingFooterbar"
import MeetingVideos from "../component/videoMeetingContent"
import { FullScreen, useFullScreenHandle } from "react-full-screen"

export default function VideoMeeingPage(props) {
    const handle = useFullScreenHandle()
    const [contextInfo, setContextInfo] = useState({ type: "", display: "", mute: false })
    const handleContextMenuInfo = (type, display, mute) => {
        setContextInfo({ ...contextInfo, type: type, display: display, mute: mute })
    }

    return (
        <FullScreen handle={handle}>
            <div className="meeting_container">
                <TopBar fullscreen={handle} onContextMenuInfo={handleContextMenuInfo} />
                <MeetingVideos contextInfo={contextInfo} />
                <FooterBar />
            </div>
        </FullScreen>
    )
}
