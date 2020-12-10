import React, { useRef, useState, useEffect } from "react"
import { useHistory } from "react-router-dom"

export default function LandingPage(props) {
    const [meeting, setMeeting] = useState(false)
    const meetingInput = useRef(null)
    const [meetingValue, setMeetingValue] = useState("")
    const [copy, setCopy] = useState(false)
    const [invite, setInvite] = useState(false)
    const [roomName, setRoomName] = useState("")
    const history = useHistory()

    useEffect(() => {
        setRoomName(makeRoom(7))
    }, [])
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
            navigator.clipboard.writeText(`http://localhost:3000/videoRoom?room=${roomName}&name=${meetingValue}`)
            setCopy(true)
            setTimeout(() => {
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
                <svg height="197" width="176" role="img">
                    <title></title>
                    <path
                        fill="#FFFFFF"
                        fill-opacity="1"
                        stroke="#F1F1F4"
                        stroke-opacity="1"
                        stroke-width="1"
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
        meetingValue === ""
            ? window.bootbox.alert("Please enter the meeting name.")
            : history.push(`/videoRoom?room=${roomName}&name=${meetingValue}`)
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
                                    <span>{roomName}</span>
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
                                <div className="videoSection"></div>
                                <div className="noneVideoSection">
                                    {/* <div style="position: relative; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: visible; align-items: stretch; width: 160px; height: 160px; justify-content: center;">
                                        <div style="position: absolute; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: center; left: 0px; right: 0px; top: 0px; bottom: 0px; justify-content: center;"> */}
                                    <div className="avatar">
                                        <span>DN</span>
                                        <div aria-hidden="true" data-text-as-pseudo-element="DN" dir="auto"></div>
                                    </div>
                                    {/* </div>
                                    </div> */}
                                </div>
                            </div>
                            <div className="topContent">
                                <div className="topSection"></div>
                            </div>
                            <div className="bottomContent">
                                <div className="bottomSection">
                                    <button className="video" title="Video, Off" aria-label="Video, Off" aria-disabled="false">
                                        <div className="videoWrap">
                                            <i className="fa fa-video-camera" aria-hidden="true"></i>
                                            <div className="switchContent">
                                                <div className="switchSection">
                                                    <div className="switchBack"></div>
                                                </div>
                                                <div className="switchBar"></div>
                                            </div>
                                        </div>
                                    </button>
                                    {/* <button title="Microphone, Off" aria-label="Microphone, Off" aria-disabled="true" disabled="" style="position: relative; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: stretch; justify-content: center; background-color: transparent; border-color: transparent; text-align: left; border-width: 0px; align-self: stretch; margin: 2px; padding: 0px; opacity: 0.5; cursor: default; border-style: solid;">
                                        <div aria-hidden="true" style="position: relative; display: flex; flex-direction: row; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: center; justify-content: space-between; margin-right: 20px;">
                                            <div aria-hidden="true" data-text-as-pseudo-element="" dir="auto" style="position: relative; display: inline; flex-grow: 0; flex-shrink: 0; overflow: hidden; white-space: pre-wrap; overflow-wrap: break-word; height: 24px; font-size: 24px; color: rgb(255, 255, 255); background-color: rgba(0, 0, 0, 0); font-family: SkypeAssets-Light; padding: 0px; margin-right: 5px; cursor: inherit;"></div>
                                            <div style="position: relative; display: flex; flex-direction: row; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: center; border-radius: 0px; height: 30px; width: 50px; background-color: rgba(0, 0, 0, 0); margin-top: 8px; margin-bottom: 8px; justify-content: center; opacity: 1; transform: scale(1) translateX(0px) translateY(0px);">
                                                <div style="position: absolute; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: stretch; top: 6px; left: 5px; width: 40px; height: 18px;">
                                                    <div style="position: absolute; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: stretch; top: 0px; bottom: 0px; left: 0px; right: 0px; border-radius: 10px; background-color: rgb(138, 141, 145);"></div>
                                                </div>
                                                <div style="position: relative; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: stretch; top: 2px; height: 10px; width: 10px; border-radius: 5px; background-color: rgb(255, 255, 255); opacity: 1; transform: scale(1) translateX(-11px) translateY(-2px);"></div>
                                            </div>
                                        </div>
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
