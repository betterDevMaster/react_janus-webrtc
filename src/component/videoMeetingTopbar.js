import React, { useState } from "react"

export default function VideoMeetingTopbar(props) {
    const [showFullscreen, setShowFullscreen] = useState(false)

    return (
        <div className="meeting_top_container">
            <div className="meeting_top_left_content">
                <i className="fa fa-align-justify" aria-hidden="true"></i>
                <span>Meet Now</span>
            </div>
            <div className="meeting_top_right_content">
                <button
                    className="meeting_top_right_call"
                    title="Call layout"
                    aria-label="Call layout"
                    onClick={() => setShowFullscreen(!showFullscreen)}
                >
                    <i className="fa fa-desktop" aria-hidden="true"></i>
                    <i className="fa fa-angle-down" aria-hidden="true"></i>
                </button>
                <button className="meeting_top_right_addpeople" title="Add people to the call" aria-label="Add people">
                    <i className="fa fa-user-plus" aria-hidden="true"></i>
                </button>
                <button className="meeting_top_right_me" title="You" aria-label="You">
                    <p>DN</p>
                    <i className="fa fa-microphone-slash" aria-hidden="true"></i>
                </button>
            </div>
            <div className="meeting_top_right_fullscreen" style={{ display: !showFullscreen ? "none" : "inherit" }}>
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
                <button tabIndex="0" aria-label="Enter full-screen" onClick={props.fullscreen.enter}>
                    Enter full-screen
                </button>
            </div>
        </div>
    )
}
