import React from "react"

export default function Header(props) {
    return (
        <div className="container">
            <div className="navbar-header">
                <a className="navbar-brand" href="index.html">
                    Janus
                </a>
                <button
                    type="button"
                    className="navbar-toggle"
                    data-toggle="collapse"
                    data-target=".navbar-collapse"
                >
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
            </div>
            <div className="navbar-collapse collapse">
                <ul className="nav navbar-nav">
                    <li>
                        <a href="index.html">Home</a>
                    </li>
                    <li className="dropdown">
                        <a
                            href="#"
                            className="dropdown-toggle"
                            data-toggle="dropdown"
                        >
                            Demos <b className="caret"></b>
                        </a>
                        <ul className="dropdown-menu">
                            <li>
                                <a href="demos.html">Index</a>
                            </li>
                            <li className="divider"></li>
                            <li>
                                <a href="echotest.html">Echo Test</a>
                            </li>
                            <li>
                                <a href="streamingtest.html">Streaming</a>
                            </li>
                            <li>
                                <a href="videocalltest.html">Video Call</a>
                            </li>
                            <li>
                                <a href="siptest.html">SIP Gateway</a>
                            </li>
                            <li>
                                <a href="videoroomtest.html">Video Room</a>
                            </li>
                            <li>
                                <a href="audiobridgetest.html">Audio Bridge</a>
                            </li>
                            <li>
                                <a href="textroomtest.html">Text Room</a>
                            </li>
                            <li>
                                <a href="voicemailtest.html">Voice Mail</a>
                            </li>
                            <li>
                                <a href="recordplaytest.html">
                                    Recorder/Playout
                                </a>
                            </li>
                            <li className="divider"></li>
                            <li>
                                <a href="screensharingtest.html">
                                    Screen Sharing
                                </a>
                            </li>
                            <li>
                                <a href="nosiptest.html">NoSIP (SDP/RTP)</a>
                            </li>
                            <li className="divider"></li>
                            <li>
                                <a href="devicetest.html">Device Selection</a>
                            </li>
                            <li>
                                <a href="e2etest.html">End-to-end Encryption</a>
                            </li>
                            <li>
                                <a href="multiopus.html">
                                    Multichannel Opus (surround)
                                </a>
                            </li>
                            <li>
                                <a href="canvas.html">Canvas Capture</a>
                            </li>
                            <li>
                                <a href="vp9svctest.html">VP9-SVC Video Room</a>
                            </li>
                            <li className="divider"></li>
                            <li>
                                <a href="admin.html">Admin/Monitor</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="docs">Documentation</a>
                    </li>
                    <li>
                        <a href="citeus.html">Papers</a>
                    </li>
                    <li>
                        <a href="support.html">Need help?</a>
                    </li>
                    <li>
                        <a
                            className="januscon"
                            target="_blank"
                            href="https://januscon.it"
                        >
                            JanusCon!
                        </a>
                    </li>
                </ul>
                <div className="navbar-header navbar-right">
                    <ul className="nav navbar-nav">
                        <li>
                            <a
                                target="_blank"
                                href="http://www.meetecho.com"
                                className="navbar-link meetecho-logo"
                            >
                                <img src="img/meetecho-logo.png" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
