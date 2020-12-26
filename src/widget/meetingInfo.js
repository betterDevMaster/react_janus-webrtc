import React, { useRef, useEffect, useState } from "react"

export default function MeetingInfo(props) {
    const infoPanel = useRef(null)
    const [copy, setCopy] = useState(false)

    useEffect(() => {
        window.addEventListener("click", isAnOutsideClick)
        window.addEventListener("keyup", onPickerkeypress)
    }, [])

    const isAnOutsideClick = (e) => {
        let shouldClose
        if (props.showMeetingInfo) shouldClose = !infoPanel || !infoPanel.current.contains(e.target)
        if (shouldClose) closePicker()
    }
    const onPickerkeypress = (e) => {
        if (e.keyCode === 27 || e.which === 27 || e.key === "Escape" || e.code === "Escape") {
            closePicker()
        }
    }
    const closePicker = () => {
        window.removeEventListener("click", isAnOutsideClick)
        window.removeEventListener("keyup", onPickerkeypress)
        props.reverseShowMeetingInfo(props.showMeetingInfo)
    }
    const handleCopy = () => {
        setCopy(!copy)
        navigator.clipboard.writeText(
            `${window.location.protocol}://${window.location.hostname}/landing?room=${props.query.room}&name=${props.query.name}`
        )
    }

    return (
        <div role="presentation" ref={infoPanel}>
            <div data-focus-lock-disabled="false">
                <div data-focus-lock-disabled="false">
                    <div className="zmu-paper meeting-info-icon__recreate-paper">
                        <div className="meeting-info-icon__meeting-topic-text">{props.query.name}'s Meeting</div>
                        <div className="meeting-info-icon__info-row ax-outline-blue">
                            <div className="meeting-info-icon__row-title">Invite Link</div>
                            <div className="meeting-info-icon__meeting-url ">
                                {`${window.location.protocol}://${window.location.hostname}/landing?room=${props.query.room}&name=${props.query.name}`}
                            </div>
                        </div>
                        <div className="meeting-info-icon__copy-button-row">
                            <button
                                className="meeting-info-icon__copy-button ax-outline-blue"
                                onClick={handleCopy}
                                style={{ display: copy ? "none" : "block" }}
                            >
                                <span className="meeting-info-icon__copy-url-icon"></span>Copy link
                            </button>
                            <div style={{ display: !copy ? "none" : "block" }}>
                                <span className="meeting-info-icon__checked-icon"></span>
                                <span className="meeting-info-icon__copied-text">Copied to Clipboard</span>
                            </div>
                        </div>
                        <div className="meeting-info-icon__info-row ax-outline-blue meeting-info-icon__info-dc">
                            You are connected to the Sonny Global Network via a janus server.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
