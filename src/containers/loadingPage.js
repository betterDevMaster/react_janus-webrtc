import React, { useEffect } from "react"
import { useHistory } from "react-router-dom"

export default function LoadingPage(props) {
    const history = useHistory()

    useEffect(() => setTimeout(reDirectLandingPage, 3000))

    const reDirectLandingPage = () => {
        history.push("/landing")
    }
    return (
        <div className="loading-Container">
            <div className="loading-Content">
                <div className="nb-spinner"></div>
                <img className="loader" src="https://dxnqsgisijbjj.cloudfront.net/webrtc/img/talklogo.png" alt="logo" />
            </div>
            <div className="loading-Footer">
                <h1>
                    <span> Janus WebRTC</span>
                </h1>
                <span>Published by Sonny. 2020</span>
            </div>
        </div>
    )
}
