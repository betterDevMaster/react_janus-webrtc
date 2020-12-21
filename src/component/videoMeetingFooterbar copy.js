import React from "react"

export default function VideoMeetingFooterbar(props) {
    return (
        <div className="meeting_footer_container">
            <div className="meeting_footer_left_content">
                <button className="meeting_footer_left_button" aria-label="Share call link">
                    <i className="fa fa-share-alt" aria-hidden="true"></i>
                    <span dir="auto">Share</span>
                </button>
                <button className="meeting_footer_left_button" aria-label="Start recording">
                    <i className="fa fa-play-circle" aria-hidden="true"></i>
                    <span dir="auto">Record</span>
                </button>
            </div>
            <div className="meeting_footer_middle_content">
                <button className="meeting_footer_unmute" title="Unmute (Ctrl+M)" aria-label="Unmute">
                    <i className="fa fa-microphone" aria-hidden="true"></i>
                </button>
                <button className="meeting_footer_unmute" title="Unmute (Ctrl+M)" aria-label="Unmute">
                    <i className="fa fa-video-camera" aria-hidden="true"></i>
                </button>
                <button className="meeting_footer_unmute" title="Unmute (Ctrl+M)" aria-label="Unmute">
                    <i className="fa fa-stop-circle" aria-hidden="true"></i>
                </button>
            </div>
            <div className="meeting_footer_right_content">
                <button className="meeting_footer_right_button" aria-label="Open Conversation">
                    <i className="fa fa-weixin" aria-hidden="true"></i>
                    <span dir="auto">Chat</span>
                </button>
                <button className="meeting_footer_right_button" aria-label="Share screen">
                    <i className="fa fa-share-square" aria-hidden="true"></i>
                    <span dir="auto">Share screen</span>
                </button>
                <button className="meeting_footer_right_button" aria-label="Raise your hand">
                    <i className="fa fa-hand-paper-o" aria-hidden="true"></i>
                    <span dir="auto">Raise Hand</span>
                </button>
                <button className="meeting_footer_right_button" aria-label="Show reactions">
                    <i className="fa fa-thumbs-o-up" aria-hidden="true"></i>
                    <span dir="auto">React</span>
                </button>
                <button className="meeting_footer_right_button" aria-label="More Options">
                    <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                    <span dir="auto">More</span>
                </button>
            </div>
        </div>
    )
}
