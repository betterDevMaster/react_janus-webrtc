import React, { useState } from "react"
import "../assets/videoMeeting2.css"
import TopBar from "../component/videoMeetingTopbar"
import FooterBar from "../component/videoMeetingFooterbar"
import MeetingVideos from "../component/videoMeetingContent"
import { FullScreen, useFullScreenHandle } from "react-full-screen"

export default function VideoMeeingPage(props) {
    const handle = useFullScreenHandle()
    // const [contextInfo, setContextInfo] = useState({ type: "", display: "", mute: false })
    // const handleContextMenuInfo = (type, display, mute) => {
    //     setContextInfo({ ...contextInfo, type: type, display: display, mute: mute })
    // }
    const [showFooterBar, setShowFooterBar] = useState(true)
    return (
        <FullScreen handle={handle}>
            <div className="meeting-app">
                <div></div>
                <span></span>
                <div
                    role="presentation"
                    className="meeting-client"
                    // onMouseEnter={() => setShowFooterBar(!showFooterBar)}
                    // onMouseLeave={() => setShowFooterBar(!showFooterBar)}
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
                                    <button type="button" className="full-screen-widget" aria-label=" Enter Full Screen">
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
                                <div className="main-layout" style={{ display: "block" }}>
                                    <div className="active-video-container">
                                        <div className="active-video-container__wrap" style={{ width: "1415px", height: "795.938px" }}>
                                            <canvas
                                                id="main-video"
                                                className="active-video-container__canvas"
                                                style={{ display: "none" }}
                                            ></canvas>
                                            <canvas
                                                id="my-video"
                                                className="active-video-container__canvas"
                                                style={{ display: "block" }}
                                            ></canvas>
                                            <div className="active-video-container__avatar">
                                                <div className="active-video-container__avatar-footer" style={{ bottom: "0px" }}>
                                                    Senior Dev
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <footer
                                    role="presentation"
                                    id="wc-footer"
                                    className={showFooterBar ? "footer" : "footer footer--hidden"}
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
                                                >
                                                    <i className="zm-icon zm-icon-voip-unmuted"></i>Mute
                                                    <span className="loading" style={{ display: "none" }}></span>
                                                </button>
                                                <div className="audio-option-menu dropup btn-group">
                                                    <button
                                                        aria-label="More audio controls"
                                                        id="audioOptionMenu"
                                                        role="button"
                                                        aria-haspopup="true"
                                                        aria-expanded="false"
                                                        type="button"
                                                        className="audio-option-menu__button dropdown-toggle btn btn-default"
                                                    >
                                                        <i className="audio-option-menu__icon"></i>
                                                    </button>
                                                    <ul
                                                        role="menu"
                                                        className="audio-option-menu__pop-menu dropdown-menu"
                                                        aria-labelledby="audioOptionMenu"
                                                    >
                                                        <li role="heading" className="dropdown-header">
                                                            Select a Microphone
                                                        </li>
                                                        <li role="presentation" className="audio-option-menu__pop-menu--checked">
                                                            <a
                                                                aria-label="Select a microphone selected"
                                                                role="menuitem"
                                                                tabIndex="-1"
                                                                href="#"
                                                            >
                                                                Same as System
                                                            </a>
                                                        </li>
                                                        <li role="presentation" className="">
                                                            <a
                                                                aria-label="Select a microphone unselect"
                                                                role="menuitem"
                                                                tabIndex="-1"
                                                                href="#"
                                                            >
                                                                Microphone (High Definition Audio Device)
                                                            </a>
                                                        </li>
                                                        <div className="common-ui-component__dropdown-divider"></div>
                                                        <li role="heading" className="dropdown-header">
                                                            Select a Speaker
                                                        </li>
                                                        <li role="presentation" className="audio-option-menu__pop-menu--checked">
                                                            <a
                                                                aria-label="Select a speaker selected"
                                                                role="menuitem"
                                                                tabIndex="-1"
                                                                href="#"
                                                            >
                                                                Same as System
                                                            </a>
                                                        </li>
                                                        <li role="presentation" className="">
                                                            <a
                                                                aria-label="Select a speaker unselect"
                                                                role="menuitem"
                                                                tabIndex="-1"
                                                                href="#"
                                                            >
                                                                Speakers (High Definition Audio Device)
                                                            </a>
                                                        </li>
                                                        <div className="common-ui-component__dropdown-divider"></div>
                                                        <li role="presentation" className="">
                                                            <a role="menuitem" tabIndex="-1" href="#">
                                                                Leave Computer Audio
                                                            </a>
                                                        </li>
                                                        <li role="presentation" className="">
                                                            <a role="menuitem" tabIndex="-1" href="#">
                                                                Audio Options
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="send-video-container">
                                                <button
                                                    tabIndex="0"
                                                    type="button"
                                                    className="zm-btn send-video-container__btn zm-btn--default zm-btn__outline--blue zm-btn-icon"
                                                    aria-label="stop sending my video"
                                                >
                                                    <i className="zm-icon zm-icon-stop-video"></i>Stop Video
                                                    <span className="loading" style={{ display: "none" }}></span>
                                                </button>
                                                <div className="video-option-menu dropup btn-group">
                                                    <button
                                                        aria-label="More video controls"
                                                        id="videoOptionMenu"
                                                        role="button"
                                                        aria-haspopup="true"
                                                        aria-expanded="false"
                                                        type="button"
                                                        className="video-option-menu__button dropdown-toggle btn btn-default"
                                                    >
                                                        <i className="video-option-menu__icon"></i>
                                                    </button>
                                                    <ul
                                                        role="menu"
                                                        className="video-option-menu__pop-menu dropdown-menu"
                                                        aria-labelledby="videoOptionMenu"
                                                    >
                                                        <li role="heading" className="dropdown-header">
                                                            Select a Camera
                                                        </li>
                                                        <li role="presentation" className="">
                                                            <a
                                                                aria-label="Select a Camera USB Camera (0c45:62c0) unselect"
                                                                role="menuitem"
                                                                tabIndex="-1"
                                                                href="#"
                                                            >
                                                                USB Camera (0c45:62c0)
                                                            </a>
                                                        </li>
                                                        <li role="presentation" className="video-option-menu__pop-menu--checked">
                                                            <a
                                                                aria-label="Select a Camera Same as System selected"
                                                                role="menuitem"
                                                                tabIndex="-1"
                                                                href="#"
                                                            >
                                                                Same as System
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="footer__btns-container">
                                            <div className="security-option-menu dropup btn-group">
                                                <button
                                                    aria-label="more security options"
                                                    id="securityOptionMenu"
                                                    role="button"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                    type="button"
                                                    className="security-option-menu__button dropdown-toggle btn btn-default"
                                                >
                                                    <i className="security-option-menu__button-icon"></i>
                                                    <span className="security-option-menu__button-text">Security</span>
                                                </button>
                                                <ul
                                                    role="menu"
                                                    className="security-option-menu__pop-menu dropdown-menu"
                                                    aria-labelledby="securityOptionMenu"
                                                >
                                                    <li role="presentation" className="">
                                                        <a
                                                            aria-label="Lock Meeting unselect"
                                                            aria-selected="false"
                                                            role="menuitem"
                                                            tabIndex="-1"
                                                            href="#"
                                                        >
                                                            Lock Meeting
                                                        </a>
                                                    </li>
                                                    <li role="presentation" className="security-option-menu__pop-menu--checked">
                                                        <a
                                                            aria-label="Enable Waiting Room selected"
                                                            aria-selected="true"
                                                            role="menuitem"
                                                            tabIndex="-1"
                                                            href="#"
                                                        >
                                                            Enable Waiting Room
                                                        </a>
                                                    </li>
                                                    <div className="common-ui-component__dropdown-divider"></div>
                                                    <li role="heading" className="dropdown-header">
                                                        Allow participants to:
                                                    </li>
                                                    <li role="presentation" className="security-option-menu__pop-menu--checked">
                                                        <a
                                                            aria-label="allow participant to Share Screen selected"
                                                            aria-selected="true"
                                                            role="menuitem"
                                                            tabIndex="-1"
                                                            href="#"
                                                        >
                                                            Share Screen
                                                        </a>
                                                    </li>
                                                    <li role="presentation" className="security-option-menu__pop-menu--checked">
                                                        <a
                                                            aria-label="allow participant to Chat selected"
                                                            aria-selected="true"
                                                            role="menuitem"
                                                            tabIndex="-1"
                                                            href="#"
                                                        >
                                                            Chat
                                                        </a>
                                                    </li>
                                                    <li role="presentation" className="security-option-menu__pop-menu--checked">
                                                        <a
                                                            aria-label="allow participant to Rename Themselves selected"
                                                            aria-selected="true"
                                                            role="menuitem"
                                                            tabIndex="-1"
                                                            href="#"
                                                        >
                                                            Rename Themselves
                                                        </a>
                                                    </li>
                                                    <li role="presentation" className="security-option-menu__pop-menu--checked">
                                                        <a
                                                            aria-label="allow participant to Unmute Themselves selected"
                                                            aria-selected="true"
                                                            role="menuitem"
                                                            tabIndex="-1"
                                                            href="#"
                                                        >
                                                            Unmute Themselves
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <button
                                                tabIndex="0"
                                                className="footer-button__button ax-outline"
                                                type="button"
                                                aria-label="open the participants list pane,[2] particpants"
                                            >
                                                <div className="footer-button__img-layer">
                                                    <div className="footer-button__participants-icon">
                                                        <span className="footer-button__number-counter">
                                                            <span>2</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="footer-button__button-label">Participants</span>
                                            </button>
                                            <button
                                                tabIndex="0"
                                                className="footer-button__button ax-outline"
                                                type="button"
                                                aria-label="Share Screen"
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
                                            >
                                                <div className="footer-button__img-layer">
                                                    <div className="footer-button__chat-icon"></div>
                                                </div>
                                                <span className="footer-button__button-label">Chat</span>
                                            </button>
                                            <div className="more-button">
                                                <div className="dropup btn-group">
                                                    <button
                                                        aria-label="More meeting control"
                                                        id="moreButton"
                                                        role="button"
                                                        aria-haspopup="true"
                                                        aria-expanded="false"
                                                        type="button"
                                                        className="more-button__button ax-outline-important
                 dropdown-toggle btn btn-default"
                                                    >
                                                        <div className="more-button__img-layer">
                                                            <span className="more-button__more-icon"></span>
                                                        </div>
                                                        <div className="more-button__button-label">More</div>
                                                    </button>
                                                    <ul
                                                        role="menu"
                                                        className="more-button__pop-menu dropdown-menu"
                                                        aria-labelledby="moreButton"
                                                    >
                                                        <li role="presentation" className="">
                                                            <a aria-label="Disable video receiving" role="menuitem" tabIndex="-1" href="#">
                                                                Disable video receiving
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="footer__leave-btn-container">
                                                <button
                                                    tabIndex="0"
                                                    type="button"
                                                    className="zmu-btn footer__leave-btn ax-outline ellipsis zmu-btn--danger zmu-btn__outline--blue"
                                                    aria-label=""
                                                >
                                                    Leave<span className="loading" style={{ display: "none" }}></span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FullScreen>
    )
}
