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
    const chatState = useSelector((state) => state.chat)
    const query = qs.parse(window.location.search)

    useEffect(() => {
        if (!window.screenShareHelper) {
            window.screenShareHelper = new JanusHelperScreenShare()
            window.screenShareHelper.init(dispatch, "screenShare", "janus.plugin.videoroom")
            window.screenShareHelper.start(query.room + "_screenShare", query.name)
        }
        if (!window.textRoomHelper) {
            window.textRoomHelper = new JanusHelperTextRoom()
            window.textRoomHelper.init(dispatch, "textRoom", "janus.plugin.textroom")
            window.textRoomHelper.start(query.room + "_textRoom", query.name)
        }
        if (!window.roomHelper) {
            window.roomHelper = new JanusHelperVideoRoom()
            window.roomHelper.init(dispatch, "videoRoom", "janus.plugin.videoroom")
            window.roomHelper.start(query.room + "_videoRoom", query.name)
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
                            {chatState.showPanel ? (
                                <div id="wc-container-right" style={{ width: "400px" }}>
                                    <div className="chat-container">
                                        <div role="presentation" className="chat-header__header">
                                            <div className="dropdown btn-group">
                                                <button
                                                    aria-label="Manage Chat Panel"
                                                    id="chatSectionMenu"
                                                    role="button"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                    type="button"
                                                    className="chat-header__chat-pop-btn ax-outline-blue-important dropdown-toggle btn btn-default"
                                                ></button>
                                                <ul
                                                    role="menu"
                                                    className="chat-header__dropdown-menu dropdown-menu"
                                                    aria-labelledby="chatSectionMenu"
                                                >
                                                    <li role="presentation" className="chat-header__menu">
                                                        <a role="menuitem" tabIndex="-1" href="#">
                                                            <i className="chat-header__close-icon"></i>Close
                                                        </a>
                                                    </li>
                                                    <li role="presentation" className="chat-header__menu">
                                                        <a role="menuitem" tabIndex="-1" href="#">
                                                            <i className="chat-header__pop-out-icon"></i>Pop Out
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="chat-header__title">Zoom Group Chat</div>
                                        </div>
                                        <div className="chat-container__chat-list">
                                            <div className="chat-content__chat-scrollbar">
                                                <div>
                                                    <div
                                                        aria-label="Chat Message List"
                                                        aria-readonly="true"
                                                        className="ReactVirtualized__Grid ReactVirtualized__List chat-virtualized-list ax-outline-blue"
                                                        role="application"
                                                        tabIndex="0"
                                                        style={{
                                                            boxSizing: "border-box",
                                                            direction: "ltr",
                                                            height: "827px",
                                                            position: "relative",
                                                            width: "400px",
                                                            willChange: "inherit",
                                                            overflow: "auto",
                                                        }}
                                                    >
                                                        <div
                                                            className="ReactVirtualized__Grid__innerScrollContainer"
                                                            role="rowgroup"
                                                            // style="width: auto; height: 1522px; max-width: 400px; max-height: 1522px; overflow: hidden; position: relative;"
                                                        >
                                                            <div
                                                                role="presentation"
                                                                style={{
                                                                    height: "94px",
                                                                    left: "0px",
                                                                    position: "absolute",
                                                                    top: "0px",
                                                                    width: "380px",
                                                                    paddingLeft: "2px",
                                                                    paddingRight: "2px",
                                                                    border: "1px solid white",
                                                                }}
                                                            >
                                                                <div role="presentation" className="chat-item__chat-info">
                                                                    <div className="chat-item__chat-info-header">
                                                                        <div className="chat-item__left-container">
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__sender chat-item__chat-info-header--can-select"
                                                                                title="DDTYS"
                                                                                data-userid="16780288"
                                                                                data-name="DDTYS"
                                                                            >
                                                                                DDTYS
                                                                            </span>
                                                                            <span className="chat-item__to"> To </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="Everyone"
                                                                                data-userid="0"
                                                                                data-name="Everyone"
                                                                            >
                                                                                Everyone
                                                                            </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="hidden chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="All panelists"
                                                                                data-userid="1"
                                                                                data-name="All panelists"
                                                                            >
                                                                                All panelists
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <pre className="chat-item__chat-info-msg">sdfsdf SDS</pre>
                                                                </div>
                                                            </div>
                                                            <div
                                                                role="presentation"
                                                                style={{
                                                                    height: "94px",
                                                                    left: "0px",
                                                                    position: "absolute",
                                                                    top: "94px",
                                                                    width: "380px",
                                                                    paddingLeft: "2px",
                                                                    paddingRight: "2px",
                                                                    border: "1px solid white",
                                                                }}
                                                            >
                                                                <div role="presentation" className="chat-item__chat-info">
                                                                    <div className="chat-item__chat-info-header">
                                                                        <div className="chat-item__left-container">
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__sender"
                                                                                title="Me"
                                                                                data-userid="16778240"
                                                                                data-name="Me"
                                                                            >
                                                                                Me
                                                                            </span>
                                                                            <span className="chat-item__to"> To </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="Everyone"
                                                                                data-userid="0"
                                                                                data-name="Everyone"
                                                                            >
                                                                                Everyone
                                                                            </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="hidden chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="All panelists"
                                                                                data-userid="1"
                                                                                data-name="All panelists"
                                                                            >
                                                                                All panelists
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <pre className="chat-item__chat-info-msg">dfgdfg eer</pre>
                                                                </div>
                                                            </div>
                                                            <div
                                                                role="presentation"
                                                                style={{
                                                                    height: "328px",
                                                                    left: "0px",
                                                                    position: "absolute",
                                                                    top: "188px",
                                                                    width: "380px",
                                                                    paddingLeft: "2px",
                                                                    paddingRight: "2px",
                                                                    border: "1px solid white",
                                                                }}
                                                            >
                                                                <div role="presentation" className="chat-item__chat-info">
                                                                    <div className="chat-item__chat-info-header">
                                                                        <div className="chat-item__left-container">
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__sender"
                                                                                title="Me"
                                                                                data-userid="16778240"
                                                                                data-name="Me"
                                                                            >
                                                                                Me
                                                                            </span>
                                                                            <span className="chat-item__to"> To </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__chat-info-header--can-select"
                                                                                title="DDTYS"
                                                                                data-userid="16780288"
                                                                                data-name="DDTYS"
                                                                            >
                                                                                DDTYS
                                                                            </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="hidden chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="All panelists"
                                                                                data-userid="1"
                                                                                data-name="All panelists"
                                                                            >
                                                                                All panelists
                                                                            </span>
                                                                            <span className="chat-privately" style={{ padding: "0px" }}>
                                                                                (Privately)
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <pre className="chat-item__chat-info-msg">
                                                                        dfgdfg xcvxcv sdfgsdfg ert ert ert ert er ter t df g dfg df g
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                            <div
                                                                role="presentation"
                                                                style={{
                                                                    height: "418px",
                                                                    left: "0px",
                                                                    position: "absolute",
                                                                    top: "516px",
                                                                    width: "380px",
                                                                    paddingLeft: "2px",
                                                                    paddingRight: "2px",
                                                                    border: "1px solid white",
                                                                }}
                                                            >
                                                                <div role="presentation" className="chat-item__chat-info">
                                                                    <div className="chat-item__chat-info-header">
                                                                        <div className="chat-item__left-container">
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__sender"
                                                                                title="Me"
                                                                                data-userid="16778240"
                                                                                data-name="Me"
                                                                            >
                                                                                Me
                                                                            </span>
                                                                            <span className="chat-item__to"> To </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="Everyone"
                                                                                data-userid="0"
                                                                                data-name="Everyone"
                                                                            >
                                                                                Everyone
                                                                            </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="hidden chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="All panelists"
                                                                                data-userid="1"
                                                                                data-name="All panelists"
                                                                            >
                                                                                All panelists
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <pre className="chat-item__chat-info-msg">
                                                                        xcvbxcv bcvb cv bc vb dfgb rftg hrt r th rt h rth rth rth r th rth
                                                                        rt hrth
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                            <div
                                                                role="presentation"
                                                                // style="height: 238px; left: 0px; position: absolute; top: 934px; width: 380px; paddingLeft: 2px; paddingRight: 2px; border: 1px solid white;"
                                                            >
                                                                <div role="presentation" className="chat-item__chat-info">
                                                                    <div className="chat-item__chat-info-header">
                                                                        <div className="chat-item__left-container">
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__sender chat-item__chat-info-header--can-select"
                                                                                title="DDTYS"
                                                                                data-userid="16780288"
                                                                                data-name="DDTYS"
                                                                            >
                                                                                DDTYS
                                                                            </span>
                                                                            <span className="chat-item__to"> To </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="Everyone"
                                                                                data-userid="0"
                                                                                data-name="Everyone"
                                                                            >
                                                                                Everyone
                                                                            </span>
                                                                            <span
                                                                                role="presentation"
                                                                                className="hidden chat-item__chat-info-header--can-select chat-item__chat-info-header--everyone"
                                                                                title="All panelists"
                                                                                data-userid="1"
                                                                                data-name="All panelists"
                                                                            >
                                                                                All panelists
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <pre className="chat-item__chat-info-msg">
                                                                        cvbcvb vbn vbn vbn vbn vbn fgn fg fgn fgn
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="chat-container__chat-control">
                                                <div className="chat-receiver-list">
                                                    <span className="chat-receiver-list__to-text">To: </span>
                                                    <div className="chat-receiver-list__menu dropup btn-group">
                                                        <button
                                                            aria-label="Send chat to Everyone please select a receiver"
                                                            id="chatReceiverMenu"
                                                            role="button"
                                                            aria-haspopup="true"
                                                            aria-expanded="false"
                                                            type="button"
                                                            className="chat-receiver-list__receiver dropdown-toggle btn btn-default"
                                                        >
                                                            Everyone
                                                        </button>
                                                        <ul role="menu" className="dropdown-menu" aria-labelledby="chatReceiverMenu">
                                                            <section
                                                                data-scrollbar="true"
                                                                tabIndex="0"
                                                                className="chat-receiver-list__scrollbar"
                                                                style={{ overflow: "hidden" }}
                                                            >
                                                                <div className="scroll-content">
                                                                    <div>
                                                                        <li
                                                                            role="presentation"
                                                                            className="chat-receiver-list__menu-item chat-receiver-list__menu-item--checked"
                                                                        >
                                                                            <a aria-selected="true" role="menuitem" tabIndex="-1" href="#">
                                                                                Everyone
                                                                                <span className="chat-receiver-list__appendix">
                                                                                    (in Meeting)
                                                                                </span>
                                                                            </a>
                                                                        </li>
                                                                        <li role="presentation" className="chat-receiver-list__menu-item">
                                                                            <a aria-selected="false" role="menuitem" tabIndex="-1" href="#">
                                                                                DDTYS
                                                                            </a>
                                                                        </li>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="scrollbar-track scrollbar-track-x"
                                                                    style={{ display: "none" }}
                                                                >
                                                                    <div
                                                                        className="scrollbar-thumb scrollbar-thumb-x"
                                                                        style={{
                                                                            width: "200px",
                                                                            transform: "translate3d(0px, 0px, 0px)",
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <div
                                                                    className="scrollbar-track scrollbar-track-y"
                                                                    style={{ display: "none" }}
                                                                >
                                                                    <div
                                                                        className="scrollbar-thumb scrollbar-thumb-y"
                                                                        style={{
                                                                            height: "48px",
                                                                            transform: "translate3d(0px, 0px, 0px)",
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </section>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="dropup btn-group btn-group-default">
                                                    <button
                                                        aria-label="More chat options"
                                                        role="button"
                                                        aria-haspopup="true"
                                                        aria-expanded="false"
                                                        type="button"
                                                        className="chat-more-options__chat-control-more ax-outline-blue-important dropdown-toggle btn btn-default"
                                                    >
                                                        ···
                                                    </button>
                                                    <ul role="menu" className="dropdown-menu dropdown-menu-right">
                                                        <div>
                                                            <li role="heading" className="dropdown-header">
                                                                Allow attendees to chat with
                                                            </li>
                                                            <li role="presentation" className="">
                                                                <a
                                                                    aria-label="Allow attendees to chat with  No one unselect"
                                                                    role="menuitem"
                                                                    tabIndex="-1"
                                                                    href="#"
                                                                >
                                                                    No one
                                                                </a>
                                                            </li>
                                                            <li role="presentation" className="">
                                                                <a
                                                                    aria-label="Allow attendees to chat with  Host only unselect"
                                                                    role="menuitem"
                                                                    tabIndex="-1"
                                                                    href="#"
                                                                >
                                                                    Host only
                                                                </a>
                                                            </li>
                                                            <li role="presentation" className="">
                                                                <a
                                                                    aria-label="Allow attendees to chat with  Everyone publicly unselect"
                                                                    role="menuitem"
                                                                    tabIndex="-1"
                                                                    href="#"
                                                                >
                                                                    Everyone publicly
                                                                </a>
                                                            </li>
                                                            <li role="presentation" className="selected">
                                                                <a
                                                                    aria-label="Allow attendees to chat with  Everyone publicly and privately selected"
                                                                    role="menuitem"
                                                                    tabIndex="-1"
                                                                    href="#"
                                                                >
                                                                    Everyone publicly and privately
                                                                </a>
                                                            </li>
                                                        </div>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div data-no-focus-lock="true">
                                                <textarea
                                                    className="chat-box__chat-textarea"
                                                    tabIndex="0"
                                                    type="text"
                                                    maxLength="1024"
                                                    title="chat message"
                                                    rows="3"
                                                    placeholder="Type message here ..."
                                                    spellCheck="false"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </FullScreen>
    )
}
