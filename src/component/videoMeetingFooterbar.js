import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as qs from "query-string"

import "../assets/videoMeeting2.css"
import JanusHelperScreenShare from "../janus/janusHelperScreenShare"
import JanusHelperVideoRoom from "../janus/janusHelperVideoRoom"

export default function VideoMeetingFooterbar(props) {
    const videoState = useSelector((state) => state.video)
    const chatState = useSelector((state) => state.chat)
    const janusState = useSelector((state) => state.janus)
    const dispatch = useDispatch()
    const query = qs.parse(window.location.search)

    useEffect(() => {
        if (janusState.status === "CONNECTED") {
            JanusHelperVideoRoom.getInstance().toggleAudioMute(videoState.audio)
            JanusHelperVideoRoom.getInstance().toggleVideoMute(videoState.video)
        }
    }, [janusState.status])

    const handleToggleAudio = () => {
        dispatch({ type: "VIDEO_ASTATE", audio: !videoState.audio })
        JanusHelperVideoRoom.getInstance().toggleAudioMute(!videoState.audio)
    }
    const handleToggleVideo = () => {
        dispatch({ type: "VIDEO_VSTATE", video: !videoState.video })
        JanusHelperVideoRoom.getInstance().toggleVideoMute(!videoState.video)
    }
    const handleScreenShare = () => {
        // window.screenShareHelper.preShareScreen(videoState.name)
        JanusHelperScreenShare.getInstance().preShareScreen(query.name)
    }
    const handleShowChat = () => {
        dispatch({ type: "CHAT_SHOWPANEL", showPanel: !chatState.showPanel })
    }
    const handleLeave = () => {
        window.location.href = "/landing"
    }
    return (
        <footer
            role="presentation"
            id="wc-footer"
            className={props.showFooterBar ? "footer" : "footer footer--hidden"}
            style={{ width: "100%" }}
        >
            <div className="footer__inner">
                <div>
                    <div className="join-audio-container">
                        <button
                            tabIndex="0"
                            type="button"
                            className="zm-btn join-audio-container__btn zm-btn--default zm-btn__outline--blue zm-btn-icon"
                            aria-label="mute my microphone"
                            onClick={handleToggleAudio}
                        >
                            <i className={videoState.audio ? "zm-icon zm-icon-voip-unmuted" : "zm-icon zm-icon-voip-muted"}></i>
                            {videoState.audio ? "Mute" : "Unmute"}
                        </button>
                    </div>
                    <div className="send-video-container">
                        <button
                            tabIndex="0"
                            type="button"
                            className="zm-btn send-video-container__btn zm-btn--default zm-btn__outline--blue zm-btn-icon"
                            aria-label="stop sending my video"
                            onClick={handleToggleVideo}
                        >
                            <i className={videoState.video ? "zm-icon zm-icon-stop-video" : "zm-icon zm-icon-start-video"}></i>
                            {videoState.video ? "Stop Video" : "Start Video"}
                        </button>
                    </div>
                </div>
                <div className="footer__btns-container">
                    <button
                        tabIndex="0"
                        className="footer-button__button ax-outline"
                        type="button"
                        aria-label="Share Screen"
                        onClick={handleScreenShare}
                    >
                        <div className="footer-button__img-layer">
                            <div className="footer-button__share-icon"></div>
                        </div>
                        <span className="footer-button__button-label">Share Screen</span>
                    </button>
                    <div style={{ display: "inline-block" }}>
                        <aside className="sharing-entry-button-container__mask"></aside>
                    </div>
                    <button
                        tabIndex="0"
                        className="footer-button__button ax-outline"
                        type="button"
                        aria-label="open the chat pane"
                        onClick={handleShowChat}
                    >
                        <div className="footer-button__img-layer">
                            <div className="footer-button__chat-icon"></div>
                        </div>
                        <span className="footer-button__button-label">Chat</span>
                    </button>
                </div>
                <div>
                    <div className="footer__leave-btn-container">
                        <button
                            tabIndex="0"
                            type="button"
                            className="zmu-btn footer__leave-btn ax-outline ellipsis zmu-btn--danger zmu-btn__outline--blue"
                            aria-label=""
                            onClick={handleLeave}
                        >
                            Leave
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}
