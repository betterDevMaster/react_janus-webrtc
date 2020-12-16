import React from "react"
import "../assets/videoMeeting.css"
import TopBar from "../component/videoMeetingTopbar"
import FooterBar from "../component/videoMeetingFooterbar"
import { FullScreen, useFullScreenHandle } from "react-full-screen"

export default function VideoMeeingPage(props) {
    const handle = useFullScreenHandle()
    return (
        <FullScreen handle={handle}>
            <div className="meeting_container">
                <TopBar fullscreen={handle} />
                <FooterBar />
            </div>
        </FullScreen>
    )
}
