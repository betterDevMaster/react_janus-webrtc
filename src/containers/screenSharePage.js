import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Header from "../widget/header"
// import Banner from "../Components/Widget/HomeWidget/Banner"
// import ItemSec from "../Components/Widget/HomeWidget/ItemSec"
import Footer from "../widget/footer"
// import * as ActionTypes from "../Store/Action/ActionTypes"

export default function screenSharePage(props) {
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
                            <h1>
                                Plugin Demo: Screen Sharing
                                <button
                                    className="btn btn-default"
                                    autoComplete="off"
                                    id="start"
                                >
                                    Start
                                </button>
                            </h1>
                        </div>
                        <div className="container" id="details">
                            <div className="row">
                                <div className="col-md-12">
                                    <h3>Demo details</h3>
                                    <p>
                                        This demo, as the Video Conferencing
                                        one, makes use of the Video Room plugin.
                                        Unlike the video conferencing scenario,
                                        though, this demo implements a webinar
                                        kind of scenario: that is, it allows a
                                        single user to share their screen with a
                                        set of passive viewers.
                                    </p>
                                    <p>
                                        When started, the demo asks you whether
                                        you want to be the one sharing the
                                        screen (or an application you're using,
                                        if your browser version is recent
                                        enough) or a viewer to an existing
                                        session. When sharing your
                                        screen/application, an ID will be
                                        returned that you'll be able to share
                                        with other people to act as viewers.
                                    </p>
                                    <div className="alert alert-info">
                                        <b>Note well!</b> If you want to share
                                        your screen, you may need to open the{" "}
                                        <b>HTTPS</b> version of this page. If
                                        Janus is not behind the same webserver
                                        as the pages that are served (that is,
                                        you didn't configure a proxying of HTTP
                                        requests to Janus via a web frontend,
                                        e.g., Apache HTTPD), make sure you
                                        started it with HTTPS support as well,
                                        since for security reasons you cannot
                                        contact an HTTP backend if the page has
                                        been served via HTTPS. Besides, if you
                                        configured Janus to make use of
                                        self-signed certificates, try and open a
                                        generic link served by Janus in the
                                        browser itself, or otherwise AJAX
                                        requests to it will fail due to the
                                        unsafe nature of the certificate.
                                    </div>
                                    <p>
                                        Press the <code>Start</code> button
                                        above to launch the demo.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="container hide" id="screenmenu">
                            <div className="row">
                                <div
                                    className="input-group margin-bottom-md hide"
                                    id="createnow"
                                >
                                    <span className="input-group-addon">
                                        <i className="fa fa-users fa-1"></i>
                                    </span>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Insert a title for the session"
                                        autoComplete="off"
                                        id="desc"
                                        onKeyPress="return checkEnterShare(this, event);"
                                    />
                                    <span className="input-group-btn">
                                        <button
                                            className="btn btn-success"
                                            autoComplete="off"
                                            id="create"
                                        >
                                            Share your screen
                                        </button>
                                    </span>
                                </div>
                            </div>
                            <div className="divider col-md-12">
                                <hr className="pull-left" />
                                or
                                <hr className="pull-right" />
                            </div>
                            <div className="row">
                                <div
                                    className="input-group margin-bottom-md hide"
                                    id="joinnow"
                                >
                                    <span className="input-group-addon">
                                        <i className="fa fa-play-circle-o fa-1"></i>
                                    </span>
                                    <input
                                        className="form-control"
                                        type="text"
                                        placeholder="Insert the numeric session identifier"
                                        autoComplete="off"
                                        id="roomid"
                                        onKeyPress="return checkEnterJoin(this, event);"
                                    />
                                    <span className="input-group-btn">
                                        <button
                                            className="btn btn-success"
                                            autoComplete="off"
                                            id="join"
                                        >
                                            Join an existing session
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="container hide" id="room">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="panel panel-default">
                                        <div className="panel-heading">
                                            <h3 className="panel-title">
                                                Screen Capture{" "}
                                                <span
                                                    className="label label-info"
                                                    id="title"
                                                ></span>{" "}
                                                <span
                                                    className="label label-success"
                                                    id="session"
                                                ></span>
                                            </h3>
                                        </div>
                                        <div
                                            className="panel-body"
                                            id="screencapture"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr />
                <div className="footer"></div>
            </div>
        </div>
    )
}
