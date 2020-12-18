import React, { useRef, useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import * as qs from "query-string"
import "../assets/landing.css"

export default function LandingPage(props) {
    const [meeting, setMeeting] = useState(false)
    const meetingInput = useRef(null)
    const [copy, setCopy] = useState(false)
    const [invite, setInvite] = useState(false)
    const [roomName, setRoomName] = useState("")
    const [meetingValue, setMeetingValue] = useState("")
    const [showVideo, setShowVidoe] = useState(false)
    const history = useHistory()
    const query = qs.parse(window.location.search)

    useEffect(() => {
        query.room ? setRoomName(query.room) : setRoomName(makeRoom(7))
    }, [query.room])

    const handleChange = (e) => {
        setMeetingValue(e.target.value)
    }
    const handleMeeting = () => {
        meetingInput.current.focus()
        setMeeting(true)
    }
    const handleCopy = () => {
        if (meetingValue === "") window.bootbox.alert("Please enter the meeting name.")
        else {
            // navigator.clipboard.writeText(`http://localhost:3000/landing?room=${roomName}`)
            navigator.clipboard.writeText(`${window.location.protocol}://${window.location.hostname}/landing?room=${roomName}`)
            setCopy(true)
            setTimeout(function () {
                setCopy(false)
            }, 2000)
        }
    }
    const makeRoom = (length) => {
        var result = ""
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        var charactersLength = characters.length
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    }
    const InviteModal = () => (
        <div className="inviteModal">
            <div className="outerContent">
                <svg height="197" width="150" role="img">
                    <path
                        fill="#FFFFFF"
                        fillOpacity="1"
                        stroke="#F1F1F4"
                        strokeOpacity="1"
                        strokeWidth="1"
                        d="M5.5,0 l82.5,0 l0,0 l0,0 l82.5,0 c3,0 3,3 3,3 l0,191 c0,3 -3,3 -3,3 l-165,0 c-3,0 -3,-3 -3,-3 l0,-191 c0,-3 3,-3 3,-3 z"
                    ></path>
                </svg>
                <div className="innerContent">
                    <div>
                        <button>
                            <img src="img/CopyLink.png" alt="Copy link" />
                            <span>Copy link</span>
                        </button>
                        <button>
                            <img src="img/SkypeContacts.png" alt="Skype contacts" />
                            <span>Skype contacts</span>
                        </button>
                        <button>
                            <img src="img/Mail.png" alt="Default email" />
                            <span>Default email</span>
                        </button>
                        <button>
                            <img src="img/Outlook.png" alt="Outlook Mail" />
                            <span>Outlook Mail</span>
                        </button>
                        <button>
                            <img src="img/Gmail.png" alt="Gmail" />
                            <span>Gmail</span>
                        </button>
                        <button>
                            <img src="img/Facebook.png" alt="Facebook" />
                            <span>Facebook</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
    const handleStartMeeting = () => {
        // meetingValue === ""
        //     ? window.bootbox.alert("Please enter the meeting name.")
        //     : history.push(`/videoMeeting?room=${roomName}&name=${meetingValue}`)
        // : history.push(`/videoRoom?room=${roomName}&name=${meetingValue}`)
    }
    const handleVideoClick = () => {
        var video = document.querySelector("#videoEle")
        if (!video) {
            setTimeout(() => {
                handleVideoClick()
            }, 10)
        }
        //access webcam script
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(function (stream) {
                    video.srcObject = stream
                })
                .catch(function (error) {
                    console.log("Something went wrong!")
                })
        }
        setShowVidoe(!showVideo)
    }

    return (
        <div className="landing-container">
            <div className="wrap-container">
                <div className="leftPanel">
                    <div className="meetingTitle">
                        <h4>Ready for your meeting?</h4>
                        <p>This meeting will not expire and you can enjoy unlimited calls.</p>
                    </div>
                    <div className="meetingContent">
                        <p>WHAT IS THIS MEETING ABOUT?</p>
                        <div className="meetingInput">
                            <div>
                                <input
                                    ref={meetingInput}
                                    type="text"
                                    value={meetingValue}
                                    dir="auto"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    maxLength="50"
                                    placeholder="Type a meeting name."
                                    size="1"
                                    onChange={handleChange}
                                    onMouseDown={() => setMeeting(true)}
                                    onBlur={() => setMeeting(false)}
                                    className="leftInput1"
                                />
                            </div>
                            <button title={!meeting ? "Edit text" : "OK"} className="leftBtn1" onClick={handleMeeting}>
                                <i className={!meeting ? "fa fa-pencil" : "fa fa-check"} aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div className="meetingLink">
                        <div className="linkContent">
                            <p>SHARE LINK AND INVITE OTHERS</p>
                            <div className="copyLink">
                                <button onClick={handleCopy}>
                                    <i className="fa fa-gg" aria-hidden="true"></i>
                                    <span>
                                        {window.location.hostname}/{roomName}
                                    </span>
                                    <i
                                        className={!copy ? "fa fa-files-o" : "fa fa-check"}
                                        aria-hidden="true"
                                        style={{ color: copy ? "rgb(76, 175, 80)" : "inherit" }}
                                    ></i>
                                </button>
                                <span>{copy ? "Link copied!" : null}</span>
                            </div>
                            <div className="shareLink">
                                <button title="Share invite" onClick={() => setInvite(!invite)}>
                                    <div className="outerContent">
                                        <div className="innerContent">
                                            <span>Share invite</span>
                                            <i className="fa fa-angle-down" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                </button>
                                {invite ? <InviteModal /> : null}
                            </div>
                        </div>
                    </div>
                    <div className="startMeeting">
                        <button title="Start Meeting" onClick={handleStartMeeting}>
                            <div className="outerContent">
                                <div className="innerContent">
                                    <i className="fa fa-video-camera" aria-hidden="true"></i>
                                    <span>Start Meeting</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
                <div className="rightPanel">
                    <div className="rightContent">
                        <div className="outerContent">
                            <div className="videoContent">
                                {showVideo ? (
                                    <div className="videoSection">
                                        <video id="videoEle" autoPlay={true}></video>
                                    </div>
                                ) : (
                                    <div className="noneVideoSection">
                                        <div className="avatar">
                                            <span>NICK</span>
                                            <div aria-hidden="true" data-text-as-pseudo-element="DN" dir="auto"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="topContent">
                                <div className="topSection"></div>
                            </div>
                            <div className="bottomContent">
                                <div className="bottomSection">
                                    <button className="video" title="Video, On/Off" onClick={handleVideoClick}>
                                        <div className="videoWrap">
                                            <img src={!showVideo ? "img/webcam-off.png" : "img/webcam-on.png"} alt="Video Icon" />
                                            <div className="switchContent">
                                                <div className="switchSection">
                                                    <div className={!showVideo ? "switchBackOff" : "switchBackOn"}></div>
                                                </div>
                                                <div className={!showVideo ? "switchBarOff" : "switchBarOn"}></div>
                                            </div>
                                        </div>
                                    </button>
                                    <button className="video" title="Microphone, On/Off">
                                        <div className="videoWrap">
                                            <img src="img/mic-off.png" alt="Video Icon" />
                                            <div className="switchContent">
                                                <div className="switchSection">
                                                    <div className="switchBackOff"></div>
                                                </div>
                                                <div className="switchBarOff"></div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
