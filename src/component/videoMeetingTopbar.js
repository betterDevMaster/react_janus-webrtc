import React, { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"
import * as qs from "query-string"

export default function VideoMeetingTopbar(props) {
    const janusState = useSelector((state) => state.janus)
    const query = qs.parse(window.location.search)
    const [showFullscreenPos, setShowFullscreenPos] = useState({ top: 0, left: 0 })
    const [showFullscreenOpen, setShowFullscreenOpen] = useState(false)
    const _fullScreen = useRef(null)
    const [contextMenuPos, setContextMenuPos] = useState({ top: 0, left: 0 })
    const [contextMenuOpen, setContextMenuOpen] = useState(false)
    const _contextMenu = useRef(null)
    const [cameraInfo, setCameraInfo] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchDevice()
            setCameraInfo(data[0].label)
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (contextMenuOpen || showFullscreenOpen) {
            setTimeout(function () {
                window.addEventListener("click", isAnOutsideClick)
                window.addEventListener("keyup", onPickerkeypress)
            })
        }
    }, [contextMenuOpen, showFullscreenOpen])

    async function fetchDevice() {
        const data = await navigator.mediaDevices
            .enumerateDevices()
            .then(function (devices) {
                var audio = devices.filter((device) => device.kind === "audioinput")
                var video = devices.filter((device) => device.kind === "videoinput")
                return video
            })
            .catch(function (error) {
                // pluginHandle.consentDialog(false)
                return error
            })
        return data
    }

    const handleFullscreen = (e) => {
        setShowFullscreenPos({ left: e.clientX - 80, top: e.clientY })
        e.preventDefault()
        e.stopPropagation()
        showFullscreenOpen ? closePicker("FullScreen") : openPicker("FullScreen")
    }
    const handleSetFullScreen = () => {
        setShowFullscreenOpen(false)
        props.fullscreen.enter()
    }
    const handleContextMenu = (e) => {
        setContextMenuPos({ left: e.clientX - 216, top: e.clientY })

        e.preventDefault()
        e.stopPropagation()
        contextMenuOpen ? closePicker("ContextMenu") : openPicker("ContextMenu")
    }
    const isAnOutsideClick = (e) => {
        let shouldClose
        if (contextMenuOpen) {
            shouldClose = !_contextMenu || !_contextMenu.current.contains(e.target)
            if (shouldClose) {
                closePicker("ContextMenu")
            }
        }
        if (showFullscreenOpen) {
            shouldClose = !_fullScreen || !_fullScreen.current.contains(e.target)
            if (shouldClose) {
                closePicker("FullScreen")
            }
        }
    }
    const onPickerkeypress = (e) => {
        if (e.keyCode === 27 || e.which === 27 || e.key === "Escape" || e.code === "Escape") {
            closePicker()
        }
    }
    const closePicker = (type) => {
        type === "ContextMenu" ? setContextMenuOpen(false) : setShowFullscreenOpen(false)

        window.removeEventListener("click", isAnOutsideClick)
        window.removeEventListener("keyup", onPickerkeypress)
    }
    const openPicker = (type) => {
        type === "ContextMenu" ? setContextMenuOpen(true) : setShowFullscreenOpen(true)

        window.addEventListener("click", isAnOutsideClick)
        window.addEventListener("keyup", onPickerkeypress)
    }

    console.log("janusState: ============== ", janusState)
    return (
        <div className="meeting_top_container">
            <div className="meeting_top_left_content">
                <i className="fa fa-align-justify" aria-hidden="true"></i>
                <span>'{query.name}' Meet</span>
            </div>
            <div className="meeting_top_right_content">
                <button className="meeting_top_right_call" title="Call layout" aria-label="Call layout" onClick={handleFullscreen}>
                    <i className="fa fa-desktop" aria-hidden="true"></i>
                    <i className="fa fa-angle-down" aria-hidden="true"></i>
                </button>
                {/* <button className="meeting_top_right_addpeople" title="Add people to the call" aria-label="Add people">
                    <i className="fa fa-user-plus" aria-hidden="true"></i>
                </button> */}
                <button className="meeting_top_right_me" title="You" aria-label="You" onContextMenu={handleContextMenu}>
                    <p>{query.name}</p>
                    <i className="fa fa-microphone-slash" aria-hidden="true"></i>
                </button>
                {janusState.stream.remote &&
                    janusState.stream.remote.map((session, i) => {
                        return (
                            <button
                                className="meeting_top_right_me"
                                title={session.rfdisplay}
                                aria-label={session.rfdisplay}
                                onContextMenu={handleContextMenu}
                            >
                                <p>{session.rfdisplay}</p>
                                <i className="fa fa-microphone-slash" aria-hidden="true"></i>
                            </button>
                        )
                    })}
            </div>
            <div
                className="meeting_top_right_fullscreen"
                ref={_fullScreen}
                style={{ left: showFullscreenPos.left, top: showFullscreenPos.top, display: showFullscreenOpen ? "flex" : "none" }}
            >
                <svg height="47" width="163" role="img">
                    <path
                        fill="#FFFFFF"
                        fillOpacity="1"
                        stroke="#F1F1F4"
                        strokeOpacity="1"
                        strokeWidth="1"
                        d="M5.5,0 l76,0 l0,0 l0,0 l76,0 c3,0 3,3 3,3 l0,41 c0,3 -3,3 -3,3 l-152,0 c-3,0 -3,-3 -3,-3 l0,-41 c0,-3 3,-3 3,-3 z"
                    ></path>
                </svg>
                <button tabIndex="0" aria-label="Enter full-screen" onClick={handleSetFullScreen}>
                    Enter full-screen
                </button>
            </div>
            <div
                className="meeting_top_right_contextmenu"
                ref={_contextMenu}
                style={{ left: contextMenuPos.left, top: contextMenuPos.top, display: contextMenuOpen ? "flex" : "none" }}
            >
                <svg height="118" width="216" role="img">
                    <path
                        fill="#FFFFFF"
                        fillOpacity="1"
                        stroke="#F1F1F4"
                        strokeOpacity="1"
                        strokeWidth="1"
                        d="M5.5,0 l183,0 l0,0 l0,0 l22,0 c3,0 3,3 3,3 l0,112 c0,3 -3,3 -3,3 l-205,0 c-3,0 -3,-3 -3,-3 l0,-112 c0,-3 3,-3 3,-3 z"
                    ></path>
                </svg>
                <div className="meeting_top_right_contextmenu_content_dialog" tabIndex="-1" aria-label="More options">
                    <div className="meeting_top_right_contextmenu_camera_menu">
                        <button className="video_on" tabIndex="0" aria-label={cameraInfo}>
                            <span>{cameraInfo}</span>
                        </button>
                        <button className="video_off" tabIndex="-1" aria-label="Turn video off, selected">
                            <span>Turn video off</span>
                            <i className="fa fa-angle-down" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div className="meeting_top_right_contextmenu_mic">
                        <button tabIndex="-1" aria-label="Unmute microphone">
                            <span>Unmute microphone</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
