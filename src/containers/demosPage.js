import React from "react"
import Header from "../widget/header"
import Footer from "../widget/footer"
import { Link } from "react-router-dom"
import * as qs from "query-string"

export default function DemosPage(props) {
    const query = qs.parse(props.location.search)
    const [room, name] = [query.room, query.name]

    return (
        <div>
            <a href="https://github.com/meetecho/janus-gateway">
                <img
                    style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        border: "0",
                        zIndex: "1001",
                    }}
                    src="https://s3.amazonaws.com/github/ribbons/forkme_left_darkblue_121621.png"
                    alt="Fork me on GitHub"
                />
            </a>

            <nav className="navbar navbar-default navbar-static-top">
                <Header />
            </nav>

            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="page-header">
                            <h1>Janus WebRTC Server: Demo Tests</h1>
                        </div>
                        <table className="table table-striped">
                            <tbody>
                                <tr>
                                    <td colSpan="2">
                                        <h3>Plugin demos</h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="echotest.html">Echo Test</a>
                                    </td>
                                    <td>A simple Echo Test demo, with knobs to control the bitrate.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="streamingtest.html">Streaming</a>
                                    </td>
                                    <td>A media Streaming demo, with sample live and on-demand streams.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <Link to={`/videoCall?room=${room}&name=${name}`}>Video Call</Link>
                                    </td>
                                    <td>A Video Call demo, a bit like AppRTC but with media passing through Janus.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="siptest.html">SIP Gateway</a>
                                    </td>
                                    <td>A SIP Gateway demo, allowing you to register at a SIP server and start/receive calls.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <Link to={`/videoRoom?room=${room}&name=${name}`}>Video Room</Link>
                                    </td>
                                    <td>A videoconferencing demo, allowing you to join a video room with up to six users.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="audiobridgetest.html">Audio Room</a>
                                    </td>
                                    <td>An audio mixing/bridge demo, allowing you join an Audio Room.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <Link to={`/textRoom?room=${room}&name=${name}`}>Text Room</Link>
                                    </td>
                                    <td>A text room demo, using DataChannels only.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="voicemailtest.html">Voice Mail</a>
                                    </td>
                                    <td>A simple audio recorder demo, returning an .opus file after 10 seconds.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="recordplaytest.html">Recorder/Playout</a>
                                    </td>
                                    <td>A demo to record audio/video messages, and subsequently replay them through WebRTC.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <Link to={`/screenShare?room=${room}&name=${name}`}>Screen Sharing</Link>
                                    </td>
                                    <td>A webinar-like screen sharing session, based on the Video Room plugin.</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="table table-striped">
                            <tbody>
                                <tr>
                                    <td colSpan="2">
                                        <h3>Other legacy demos</h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="nosiptest.html">NoSIP (SDP/RTP)</a>
                                    </td>
                                    <td>A legacy interop demo (e.g., with a SIP peer) where signalling is up to the application.</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="table table-striped">
                            <tbody>
                                <tr>
                                    <td colSpan="2">
                                        <h3>Advanced demos</h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="devicetest.html">Device Selection</a>
                                    </td>
                                    <td>A variant of the Echo Test demo, that allows you to choose a specific capture device.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="e2etest.html">End-to-end Encryption</a>
                                    </td>
                                    <td>
                                        A variant of the Echo Test demo, that allows you to encrypt the video in a way that Janus can't
                                        access it, but can still route it.
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="multiopus.html">Multichannel Opus (surround)</a>
                                    </td>
                                    <td>A variant of the Echo Test demo, that shows multichannel/surround Opus support.</td>
                                </tr>
                                <tr>
                                    <td>
                                        <Link to={`/lecture?room=${room}&name=${name}`}>Lecture</Link>
                                    </td>
                                    <td>
                                        A variant of the Echo Test demo, that shows how to use a canvas element as a WebRTC media source.
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="vp9svctest.html">VP9-SVC Video Room</a>
                                    </td>
                                    <td>
                                        A variant of the Video Room demo, that allows you to test the VP9 SVC layer selection, if available.
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="admin.html">Admin/Monitor</a>
                                    </td>
                                    <td>A simple page showcasing how you can use the Janus Admin/Monitor API.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr />
                <Footer />
            </div>
        </div>
    )
}
