import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import JanusHelperScreenShare from "../janus/janusHelperScreenShare"

import "../assets/videoMeeting2.css"

export default function VideoMeetingFooterbar(props) {
    const videoState = useSelector((state) => state.video)
    const dispatch = useDispatch()

    useEffect(() => {
        window.screenShareHelper = new JanusHelperScreenShare()
        window.screenShareHelper.init(dispatch, "screenShare", "janus.plugin.videoroom")
        window.screenShareHelper.start(props.room)
    }, [])
    const handleToggleAudio = () => {
        dispatch({ type: "VIDEO_ASTATE", audio: !videoState.audio })
    }
    const handleToggleVideo = () => {
        dispatch({ type: "VIDEO_VSTATE", video: !videoState.video })
    }
    const handleScreenShare = () => {
        // window.screenShareHelper.preShareScreen(videoState.name)
        window.screenShareHelper.preShareScreen("tester")
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
                    <button tabIndex="0" className="footer-button__button ax-outline" type="button" aria-label="open the chat pane">
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
                        >
                            Leave
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}
