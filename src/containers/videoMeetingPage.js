import React, { useState, useContext, useEffect } from "react"
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import * as qs from "query-string"

import TopBar from "../component/videoMeetingTopbar"
import FooterBar from "../component/videoMeetingFooterbar"
import MeetingVideos from "../component/videoMeetingContent"

import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"
import JanusHelperScreenShare from "../janus/janusHelperScreenShare"
import JanusHelperTextRoom from "../janus/janusHelperTextRoom"

import "../assets/videoMeeting2.css"
import { useDispatch, useSelector } from "react-redux"

export default function VideoMeeingPage(props) {
    const dispatch = useDispatch()
    const handle = useFullScreenHandle()
    const [showFooterBar, setShowFooterBar] = useState(false)
    const videoState = useSelector((state) => state.video)
    const query = qs.parse(window.location.search)

    useEffect(() => {
        if (!window.screenShareHelper) {
            window.screenShareHelper = new JanusHelperScreenShare()
            window.screenShareHelper.init(dispatch, "screenShare", "janus.plugin.videoroom")
            window.screenShareHelper.start(videoState.name + "_screenShare")
        }
        if (!window.textRoomHelper) {
            window.textRoomHelper = new JanusHelperTextRoom()
            window.textRoomHelper.init(dispatch, "textRoom", "janus.plugin.textroom")
            window.textRoomHelper.start(videoState.name + "_textRoom")
        }
        if (!window.roomHelper) {
            window.roomHelper = new JanusHelperVideoRoom()
            window.roomHelper.init(dispatch, "videoRoom", "janus.plugin.videoroom")
            window.roomHelper.start(videoState.name)
        }
    }, [])

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
                                type="button"
                                aria-label="Meeting information"
                                aria-expanded="false"
                            >
                                <i className="meeting-info-icon__icon"></i>
                            </button>
                            <i className="e2e-encryption-indicator__encrypt-indicator e2e-encryption-indicator__encrypt-indicator--2"></i>
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
                                <div className="sharing-layout" style={{ display: "none" }}>
                                    <div className="sharee-container">
                                        <div className="sharee-container__indicator">
                                            <div
                                                className="react-draggable"
                                                style={{ touchAction: "none", transform: "translate(0px, 0px)" }}
                                            >
                                                <div className="sharee-sharing-indicator" role="presentation">
                                                    <div className="sharee-sharing-indicator__tip">You are viewing {0}'s screen</div>
                                                    <div className="sharee-sharing-indicator__dropdown dropdown btn-group">
                                                        <button
                                                            aria-label="sharing view options"
                                                            id="sharingViewOptions"
                                                            role="button"
                                                            aria-haspopup="true"
                                                            aria-expanded="false"
                                                            type="button"
                                                            className="sharee-sharing-indicator__dropdown-button dropdown-toggle btn btn-default"
                                                        >
                                                            View Options<i className="sharee-sharing-indicator__dropdown-icon"></i>
                                                        </button>
                                                        <ul
                                                            role="menu"
                                                            className="sharee-sharing-indicator__menu dropdown-menu"
                                                            aria-labelledby="sharingViewOptions"
                                                        >
                                                            <li
                                                                role="presentation"
                                                                className="sharee-sharing-indicator__item sharee-sharing-indicator__item--checked"
                                                            >
                                                                <a
                                                                    aria-label="Fit to Window selected"
                                                                    role="menuitem"
                                                                    tabIndex="-1"
                                                                    href="#"
                                                                >
                                                                    Fit to Window
                                                                </a>
                                                            </li>
                                                            <li role="presentation" className="sharee-sharing-indicator__item">
                                                                <a aria-label="Original Size " role="menuitem" tabIndex="-1" href="#">
                                                                    Original Size
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="sharee-container__viewport react-draggable"
                                            role="presentation"
                                            style={{
                                                touchAction: "none",
                                                marginTop: "70.5312px",
                                                height: "795.938px",
                                                width: "1415px",
                                                transform: "translate(0px, 0px)",
                                            }}
                                        >
                                            <canvas className="sharee-container__canvas" width="1920" height="1080"></canvas>
                                            <div className="sharee-container__canvas-outline"></div>
                                        </div>
                                    </div>
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
                        </div>
                    </div>
                </div>
            </div>
        </FullScreen>
    )
}
