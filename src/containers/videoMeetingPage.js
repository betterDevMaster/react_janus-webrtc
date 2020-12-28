import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import * as qs from "query-string"

import FooterBar from "../component/videoMeetingFooterbar"
import MeetingVideos from "../component/videoMeetingContent"
import ChatPanel from "../widget/chat"
import MeetingInfo from "../widget/meetingInfo"

import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"
import JanusHelperScreenShare from "../janus/janusHelperScreenShare"
import JanusHelperTextRoom from "../janus/janusHelperTextRoom"

import "../assets/videoMeeting2.css"

export default function VideoMeeingPage(props) {
    const dispatch = useDispatch()
    const handle = useFullScreenHandle()
    const [showFooterBar, setShowFooterBar] = useState(false)
    const [showMeetingInfo, setShowMeetingInfo] = useState(false)
    const videoState = useSelector((state) => state.video)
    const chatState = useSelector((state) => state.chat)
    const query = qs.parse(window.location.search)

    // useEffect(() => {
    //     JanusHelperVideoRoom.getInstance().init(dispatch, query.room + "_videoRoom", query.name, "videoRoom", "janus.plugin.videoroom")
    //     JanusHelperScreenShare.getInstance().init(
    //         dispatch,
    //         query.room + "_screenShare",
    //         query.name,
    //         "screenShare",
    //         "janus.plugin.videoroom"
    //     )
    //     JanusHelperTextRoom.getInstance().init(dispatch, query.room + "_textRoom", query.name, "textRoom", "janus.plugin.textroom")
    // }, [])

    return (
        <FullScreen handle={handle}>
            <div className="meeting-app">
                <div
                    role="presentation"
                    className="meeting-client"
                    onMouseEnter={() => setShowFooterBar(true)}
                    onMouseLeave={() => setShowFooterBar(false)}
                >
                    <div className="meeting-client-inner">
                        <div id="wc-content">
                            <button
                                className="meeting-info-icon__icon-wrap  ax-outline-blue"
                                onClick={() => setShowMeetingInfo(!showMeetingInfo)}
                            >
                                <i className="meeting-info-icon__icon"></i>
                            </button>
                            {showMeetingInfo ? (
                                <MeetingInfo
                                    showMeetingInfo={showMeetingInfo}
                                    reverseShowMeetingInfo={() => setShowMeetingInfo(!showMeetingInfo)}
                                    query={query}
                                />
                            ) : null}

                            <div id="wc-container-left" className="" style={{ width: "100%" }}>
                                <div className="notification-manager"></div>
                                <div className="full-screen-icon">
                                    <button
                                        type="button"
                                        className="full-screen-widget"
                                        aria-label=" Enter Full Screen"
                                        onClick={handle.enter}
                                    >
                                        <i className="full-screen-widget__icon"></i>
                                        <div className="full-screen-widget__tooltip">
                                            <div
                                                className="global-popover full-screen-widget__tooltip__container"
                                                tabIndex="0"
                                                role="presentation"
                                                aria-labelledby="global-popover__header"
                                                aria-describedby="global-popover__body"
                                            >
                                                <div id="global-popover__body" className="global-popover__body">
                                                    FullScreen
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                                <div className="main-layout" style={{ display: "block", width: "100%", height: "100%" }}>
                                    <div className="active-video-container">
                                        <div className="active-video-container__wrap" style={{ width: "100%", height: "100%" }}>
                                            <MeetingVideos room={query.room} />
                                            <div className="active-video-container__avatar">
                                                <div
                                                    className="active-video-container__avatar-footer"
                                                    style={{ left: "10px", bottom: "20px" }}
                                                >
                                                    {videoState.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <FooterBar showFooterBar={showFooterBar} room={query.room} />
                            </div>
                            {chatState.showPanel ? <ChatPanel chatState={chatState} query={query} /> : null}
                        </div>
                    </div>
                </div>
            </div>
        </FullScreen>
    )
}
