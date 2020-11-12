// import $ from "jquery"
import * as $ from "jquery"
import * as Constraint from "../store/constraint"

class WebRTC {
    static _instance = null

    server = "https://janusserver.simportal.net:8089/janus"

    janus = null
    videocall = null
    opaqueId = ""

    bitrateTimer = null
    spinner = null

    audioenabled = false
    videoenabled = false

    myusername = null
    yourusername = null

    doSimulcast = false
    doSimulcast2 = false
    simulcastStarted = false

    eventListners = {}

    static getInstance() {
        if (WebRTC._instance === null) {
            WebRTC._instance = new WebRTC()
        }
        return WebRTC._instance
    }

    constructor() {
        console.log("WebRTC class was initialized.")
    }

    initJanus(pType) {
        this.opaqueId = pType + "-" + window.Janus.randomString(12)
        this.doSimulcast =
            this.getQueryStringValue("simulcast") === "yes" ||
            this.getQueryStringValue("simulcast") === "true"
        this.doSimulcast2 =
            this.getQueryStringValue("simulcast2") === "yes" ||
            this.getQueryStringValue("simulcast2") === "true"

        window.Janus.init({
            debug: true,
            callback: function () {
                console.log("initJanus: ---------- ")
                // Use a button to start the demo
                // WebRTC.getInstance().startJanus(dispatch, pType)
            },
        })
    }

    startJanus(dispatch, pType) {
        console.log("startJanus: ---------- ", dispatch, pType)
        $(this).attr("disabled", true).unbind("click")
        // Make sure the browser supports WebRTC
        if (!window.Janus.isWebrtcSupported()) {
            window.bootbox.alert("No WebRTC support... ")
            return
        }
        // Create session
        window.janus = new window.Janus({
            server: WebRTC.getInstance().server,
            success: function () {
                console.log("startJanus success: ---------- ", this)
                // Attach to VideoCall plugin
                WebRTC.getInstance().attachJanus(dispatch, pType)
            },
            error: function (error) {
                console.log("janus init error: ----------")
                window.Janus.error(error)
                window.bootbox.alert(error, function () {
                    window.location.reload()
                })
            },
            destroyed: function () {
                console.log("janus init destroyed: ----------")
                window.location.reload()
            },
        })
    }

    attachJanus(dispatch, pType) {
        window.janus.attach({
            plugin: "janus.plugin.videocall",
            opaqueId: WebRTC.getInstance().opaqueId,
            success: function (pluginHandle) {
                console.log(
                    "attach success: ---------- ",
                    pluginHandle,
                    pType,
                    Constraint.VIDEO_CALL
                )
                if (pType === Constraint.VIDEO_CALL) {
                    WebRTC.getInstance().videocall = pluginHandle
                    window.Janus.log(
                        "Plugin attached! (" +
                            WebRTC.getInstance().videocall.getPlugin() +
                            ", id=" +
                            WebRTC.getInstance().videocall.getId() +
                            ")"
                    )
                    dispatch({
                        type: Constraint.SUCCESS_ATTACH_JANUS,
                        value: {
                            attach: true,
                        },
                    })
                }

                // $("#details").remove()
                // WebRTC.getInstance().videocall = pluginHandle
                // window.Janus.log(
                //     "Plugin attached! (" +
                //         WebRTC.getInstance().videocall.getPlugin() +
                //         ", id=" +
                //         WebRTC.getInstance().videocall.getId() +
                //         ")"
                // )
                // // Prepare the username registration
                // $("#videocall").removeClass("hide").show()
                // $("#login").removeClass("hide").show()
                // $("#registernow").removeClass("hide").show()
                // $("#register").click(WebRTC.getInstance().registerUsername)
                // $("#username").focus()
                // $("#start")
                //     .removeAttr("disabled")
                //     .html("Stop")
                //     .click(function () {
                //         $(this).attr("disabled", true)
                //         window.janus.destroy()
                //     })
            },
            error: function (error) {
                window.Janus.error("  -- Error attaching plugin...", error)
                window.bootbox.alert("  -- Error attaching plugin... " + error)
            },
            consentDialog: function (on) {
                window.Janus.debug(
                    "Consent dialog should be " + (on ? "on" : "off") + " now"
                )
                console.log("consentDialog: ---------- ", on)

                if (on) {
                    // Darken screen and show hint
                    window.$.blockUI({
                        message: '<div><img src="img/up_arrow.png"/></div>',
                        css: {
                            border: "none",
                            padding: "15px",
                            backgroundColor: "transparent",
                            color: "#aaa",
                            top: "10px",
                            left: navigator.mozGetUserMedia
                                ? "-100px"
                                : "300px",
                        },
                    })
                } else {
                    // Restore screen
                    window.$.unblockUI()
                }
            },
            iceState: function (state) {
                console.log("iceState: ---------- ", state)
                window.Janus.log("ICE state changed to " + state)
            },
            mediaState: function (medium, on) {
                console.log("mediaState: ---------- ", medium, on)
                window.Janus.log(
                    "Janus " +
                        (on ? "started" : "stopped") +
                        " receiving our " +
                        medium
                )
            },
            webrtcState: function (on) {
                console.log("webrtcState: ---------- ", on)
                window.Janus.log(
                    "Janus says our WebRTC PeerConnection is " +
                        (on ? "up" : "down") +
                        " now"
                )
                window.$.unblockUI()
                // $("#videoleft").parent().unblock()
            },
            onmessage: function (msg, jsep) {
                window.Janus.debug(" ::: Got a message :::", msg)
                console.log("onmessage: ---------- ", msg, jsep)
                var result = msg["result"]
                if (result) {
                    if (result["list"]) {
                        var list = result["list"]
                        window.Janus.debug(
                            "Got a list of registered peers:",
                            list
                        )
                        for (var mp in list) {
                            window.Janus.debug("  >> [" + list[mp] + "]")
                        }
                    } else if (result["event"]) {
                        var event = result["event"]
                        if (event === "registered") {
                            WebRTC.getInstance().myusername = result["username"]
                            window.Janus.log(
                                "Successfully registered as " +
                                    WebRTC.getInstance().myusername +
                                    "!"
                            )
                            $("#youok")
                                .removeClass("hide")
                                .show()
                                .html(
                                    "Registered as '" +
                                        WebRTC.getInstance().myusername +
                                        "'"
                                )
                            // Get a list of available peers, just for fun
                            WebRTC.getInstance().videocall.send({
                                message: {
                                    request: "list",
                                },
                            })
                            // Enable buttons to call now
                            $("#phone").removeClass("hide").show()
                            console.log("event: registered: ------------ ")
                            // $("#call")
                            //     .unbind("click")
                            //     .click(WebRTC.getInstance().doCall)
                            $("#peer").focus()
                        } else if (event === "calling") {
                            window.Janus.log(
                                "Waiting for the peer to answer..."
                            )
                            // TODO Any ringtone?
                            window.bootbox.alert(
                                "Waiting for the peer to answer..."
                            )
                        } else if (event === "incomingcall") {
                            window.Janus.log(
                                "Incoming call from " + result["username"] + "!"
                            )
                            WebRTC.getInstance().yourusername =
                                result["username"]
                            // Notify user
                            window.bootbox.hideAll()
                            WebRTC.getInstance().incoming = window.bootbox.dialog(
                                {
                                    message:
                                        "Incoming call from " +
                                        WebRTC.getInstance().yourusername +
                                        "!",
                                    title: "Incoming call",
                                    closeButton: false,
                                    buttons: {
                                        success: {
                                            label: "Answer",
                                            className: "btn-success",
                                            callback: function () {
                                                WebRTC.getInstance().incoming = null
                                                $("#peer")
                                                    .val(result["username"])
                                                    .attr("disabled", true)
                                                WebRTC.getInstance().videocall.createAnswer(
                                                    {
                                                        jsep: jsep,
                                                        // No media provided: by default, it's sendrecv for audio and video
                                                        media: {
                                                            data: true,
                                                        }, // Let's negotiate data channels as well
                                                        // If you want to test simulcasting (Chrome and Firefox only), then
                                                        // pass a ?simulcast=true when opening this demo page: it will turn
                                                        // the following 'simulcast' property to pass to janus.js to true
                                                        simulcast: WebRTC.getInstance()
                                                            .doSimulcast,
                                                        success: function (
                                                            jsep
                                                        ) {
                                                            window.Janus.debug(
                                                                "Got SDP!",
                                                                jsep
                                                            )
                                                            var body = {
                                                                request:
                                                                    "accept",
                                                            }
                                                            WebRTC.getInstance().videocall.send(
                                                                {
                                                                    message: body,
                                                                    jsep: jsep,
                                                                }
                                                            )
                                                            $("#peer").attr(
                                                                "disabled",
                                                                true
                                                            )
                                                            $("#call")
                                                                .removeAttr(
                                                                    "disabled"
                                                                )
                                                                .html("Hangup")
                                                                .removeClass(
                                                                    "btn-success"
                                                                )
                                                                .addClass(
                                                                    "btn-danger"
                                                                )
                                                                .unbind("click")
                                                                .click(
                                                                    WebRTC.getInstance()
                                                                        .doHangup
                                                                )
                                                        },
                                                        error: function (
                                                            error
                                                        ) {
                                                            window.Janus.error(
                                                                "WebRTC error:",
                                                                error
                                                            )
                                                            window.bootbox.alert(
                                                                "WebRTC error... " +
                                                                    error.message
                                                            )
                                                        },
                                                    }
                                                )
                                            },
                                        },
                                        danger: {
                                            label: "Decline",
                                            className: "btn-danger",
                                            callback: function () {
                                                WebRTC.getInstance().doHangup()
                                            },
                                        },
                                    },
                                }
                            )
                        } else if (event === "accepted") {
                            window.bootbox.hideAll()
                            var peer = result["username"]
                            if (!peer) {
                                window.Janus.log("Call started!")
                            } else {
                                window.Janus.log(peer + " accepted the call!")
                                WebRTC.getInstance().yourusername = peer
                            }
                            // Video call can start
                            if (jsep)
                                WebRTC.getInstance().videocall.handleRemoteJsep(
                                    {
                                        jsep: jsep,
                                    }
                                )
                            $("#call")
                                .removeAttr("disabled")
                                .html("Hangup")
                                .removeClass("btn-success")
                                .addClass("btn-danger")
                                .unbind("click")
                                .click(WebRTC.getInstance().doHangup)
                        } else if (event === "update") {
                            // An 'update' event may be used to provide renegotiation attempts
                            if (jsep) {
                                if (jsep.type === "answer") {
                                    WebRTC.getInstance().videocall.handleRemoteJsep(
                                        { jsep: jsep }
                                    )
                                } else {
                                    WebRTC.getInstance().videocall.createAnswer(
                                        {
                                            jsep: jsep,
                                            media: {
                                                data: true,
                                            }, // Let's negotiate data channels as well
                                            success: function (jsep) {
                                                window.Janus.debug(
                                                    "Got SDP!",
                                                    jsep
                                                )
                                                var body = {
                                                    request: "set",
                                                }
                                                WebRTC.getInstance().videocall.send(
                                                    {
                                                        message: body,
                                                        jsep: jsep,
                                                    }
                                                )
                                            },
                                            error: function (error) {
                                                window.Janus.error(
                                                    "WebRTC error:",
                                                    error
                                                )
                                                window.bootbox.alert(
                                                    "WebRTC error... " +
                                                        error.message
                                                )
                                            },
                                        }
                                    )
                                }
                            }
                        } else if (event === "hangup") {
                            window.Janus.log(
                                "Call hung up by " +
                                    result["username"] +
                                    " (" +
                                    result["reason"] +
                                    ")!"
                            )
                            // Reset status
                            window.bootbox.hideAll()
                            WebRTC.getInstance().videocall.hangup()
                            if (WebRTC.getInstance().spinner)
                                WebRTC.getInstance().spinner.stop()
                            $("#waitingvideo").remove()
                            $("#videos").hide()
                            $("#peer").removeAttr("disabled").val("")
                            console.log("event: hangup: ------------ ")

                            // $("#call")
                            //     .removeAttr("disabled")
                            //     .html("Call")
                            //     .removeClass("btn-danger")
                            //     .addClass("btn-success")
                            //     .unbind("click")
                            //     .click(WebRTC.getInstance().doCall)
                            $("#toggleaudio").attr("disabled", true)
                            $("#togglevideo").attr("disabled", true)
                            $("#bitrate").attr("disabled", true)
                            $("#curbitrate").hide()
                            $("#curres").hide()
                        } else if (event === "simulcast") {
                            // Is simulcast in place?
                            var substream = result["substream"]
                            var temporal = result["temporal"]
                            if (
                                (substream !== null &&
                                    substream !== undefined) ||
                                (temporal !== null && temporal !== undefined)
                            ) {
                                if (!WebRTC.getInstance().simulcastStarted) {
                                    WebRTC.getInstance().simulcastStarted = true
                                    WebRTC.getInstance().addSimulcastButtons(
                                        result["videocodec"] === "vp8" ||
                                            result["videocodec"] === "h264"
                                    )
                                }
                                // We just received notice that there's been a switch, update the buttons
                                WebRTC.getInstance().updateSimulcastButtons(
                                    substream,
                                    temporal
                                )
                            }
                        }
                    }
                } else {
                    // FIXME Error?
                    var error = msg["error"]
                    window.bootbox.alert(error)
                    if (error.indexOf("already taken") > 0) {
                        // FIXME Use status codes...
                        $("#username").removeAttr("disabled").val("")
                        $("#register")
                            .removeAttr("disabled")
                            .unbind("click")
                            .click(WebRTC.getInstance().registerUsername)
                    }
                    // TODO Reset status
                    WebRTC.getInstance().videocall.hangup()
                    if (WebRTC.getInstance().spinner)
                        WebRTC.getInstance().spinner.stop()
                    $("#waitingvideo").remove()
                    $("#videos").hide()
                    $("#peer").removeAttr("disabled").val("")
                    console.log("event: result: null: ------------ ")

                    // $("#call")
                    //     .removeAttr("disabled")
                    //     .html("Call")
                    //     .removeClass("btn-danger")
                    //     .addClass("btn-success")
                    //     .unbind("click")
                    //     .click(WebRTC.getInstance().doCall)
                    $("#toggleaudio").attr("disabled", true)
                    $("#togglevideo").attr("disabled", true)
                    $("#bitrate").attr("disabled", true)
                    $("#curbitrate").hide()
                    $("#curres").hide()
                    if (WebRTC.getInstance().bitrateTimer)
                        clearInterval(WebRTC.getInstance().bitrateTimer)
                    WebRTC.getInstance().bitrateTimer = null
                }
            },
            onlocalstream: function (stream) {
                window.Janus.debug(" ::: Got a local stream :::", stream)
                $("#videos").removeClass("hide").show()
                if ($("#myvideo").length === 0)
                    $("#videoleft").append(
                        '<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>'
                    )
                window.Janus.attachMediaStream($("#myvideo").get(0), stream)
                $("#myvideo").get(0).muted = "muted"
                if (
                    WebRTC.getInstance().videocall.webrtcStuff.pc
                        .iceConnectionState !== "completed" &&
                    WebRTC.getInstance().videocall.webrtcStuff.pc
                        .iceConnectionState !== "connected"
                ) {
                    window.$.blockUI({
                        message: "<b>Publishing...</b>",
                        css: {
                            border: "none",
                            backgroundColor: "transparent",
                            color: "white",
                        },
                    })
                    // No remote video yet
                    $("#videoright").append(
                        '<video class="rounded centered" id="waitingvideo" width="100%" height="100%" />'
                    )
                    if (WebRTC.getInstance().spinner === null) {
                        var target = document.getElementById("videoright")
                        WebRTC.getInstance().spinner = new window.Spinner({
                            top: 100,
                        }).spin(target)
                    } else {
                        WebRTC.getInstance().spinner.spin()
                    }
                }
                var videoTracks = stream.getVideoTracks()
                if (!videoTracks || videoTracks.length === 0) {
                    // No webcam
                    $("#myvideo").hide()
                    if ($("#videoleft .no-video-container").length === 0) {
                        $("#videoleft").append(
                            '<div class="no-video-container">' +
                                '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                '<span class="no-video-text">No webcam available</span>' +
                                "</div>"
                        )
                    }
                } else {
                    $("#videoleft .no-video-container").remove()
                    $("#myvideo").removeClass("hide").show()
                }
            },
            onremotestream: function (stream) {
                window.Janus.debug(" ::: Got a remote stream :::", stream)
                var addButtons = false
                if ($("#remotevideo").length === 0) {
                    addButtons = true
                    $("#videoright").append(
                        '<video class="rounded centered hide" id="remotevideo" width="100%" height="100%" autoplay playsinline/>'
                    )
                    // Show the video, hide the spinner and show the resolution when we get a playing event
                    $("#remotevideo").bind("playing", function () {
                        $("#waitingvideo").remove()
                        if (this.videoWidth)
                            $("#remotevideo").removeClass("hide").show()
                        if (WebRTC.getInstance().spinner)
                            WebRTC.getInstance().spinner.stop()
                        WebRTC.getInstance().spinner = null
                        var width = this.videoWidth
                        var height = this.videoHeight
                        $("#curres")
                            .removeClass("hide")
                            .text(width + "x" + height)
                            .show()
                    })
                    $("#callee")
                        .removeClass("hide")
                        .html(WebRTC.getInstance().yourusername)
                        .show()
                }
                window.Janus.attachMediaStream($("#remotevideo").get(0), stream)
                var videoTracks = stream.getVideoTracks()
                if (!videoTracks || videoTracks.length === 0) {
                    // No remote video
                    $("#remotevideo").hide()
                    if ($("#videoright .no-video-container").length === 0) {
                        $("#videoright").append(
                            '<div class="no-video-container">' +
                                '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                '<span class="no-video-text">No remote video available</span>' +
                                "</div>"
                        )
                    }
                } else {
                    $("#videoright .no-video-container").remove()
                    $("#remotevideo").removeClass("hide").show()
                }
                if (!addButtons) return
                // Enable audio/video buttons and bitrate limiter
                WebRTC.getInstance().audioenabled = true
                WebRTC.getInstance().videoenabled = true
                $("#toggleaudio")
                    .html("Disable audio")
                    .removeClass("btn-success")
                    .addClass("btn-danger")
                    .unbind("click")
                    .removeAttr("disabled")
                    .click(function () {
                        WebRTC.getInstance().audioenabled = !WebRTC.getInstance()
                            .audioenabled
                        if (WebRTC.getInstance().audioenabled)
                            $("#toggleaudio")
                                .html("Disable audio")
                                .removeClass("btn-success")
                                .addClass("btn-danger")
                        else
                            $("#toggleaudio")
                                .html("Enable audio")
                                .removeClass("btn-danger")
                                .addClass("btn-success")
                        WebRTC.getInstance().videocall.send({
                            message: {
                                request: "set",
                                audio: WebRTC.getInstance().audioenabled,
                            },
                        })
                    })
                $("#togglevideo")
                    .html("Disable video")
                    .removeClass("btn-success")
                    .addClass("btn-danger")
                    .unbind("click")
                    .removeAttr("disabled")
                    .click(function () {
                        WebRTC.getInstance().videoenabled = !WebRTC.getInstance()
                            .videoenabled
                        if (WebRTC.getInstance().videoenabled)
                            $("#togglevideo")
                                .html("Disable video")
                                .removeClass("btn-success")
                                .addClass("btn-danger")
                        else
                            $("#togglevideo")
                                .html("Enable video")
                                .removeClass("btn-danger")
                                .addClass("btn-success")
                        WebRTC.getInstance().videocall.send({
                            message: {
                                request: "set",
                                video: WebRTC.getInstance().videoenabled,
                            },
                        })
                    })
                $("#toggleaudio").parent().removeClass("hide").show()
                $("#bitrateset").html("Bandwidth")
                $("#bitrate a")
                    .unbind("click")
                    .removeAttr("disabled")
                    .click(function () {
                        var id = $(this).attr("id")
                        var bitrate = parseInt(id) * 1000
                        if (bitrate === 0) {
                            window.Janus.log("Not limiting bandwidth via REMB")
                        } else {
                            window.Janus.log(
                                "Capping bandwidth to " + bitrate + " via REMB"
                            )
                        }
                        $("#bitrateset")
                            .html($(this).html())
                            .parent()
                            .removeClass("open")
                        WebRTC.getInstance().videocall.send({
                            message: {
                                request: "set",
                                bitrate: bitrate,
                            },
                        })
                        return false
                    })
                if (
                    window.Janus.webRTCAdapter.browserDetails.browser ===
                        "chrome" ||
                    window.Janus.webRTCAdapter.browserDetails.browser ===
                        "firefox" ||
                    window.Janus.webRTCAdapter.browserDetails.browser ===
                        "safari"
                ) {
                    $("#curbitrate").removeClass("hide").show()
                    WebRTC.getInstance().bitrateTimer = setInterval(
                        function () {
                            // Display updated bitrate, if supported
                            var bitrate = WebRTC.getInstance().videocall.getBitrate()
                            $("#curbitrate").text(bitrate)
                            // Check if the resolution changed too
                            var width = $("#remotevideo").get(0).videoWidth
                            var height = $("#remotevideo").get(0).videoHeight
                            if (width > 0 && height > 0)
                                $("#curres")
                                    .removeClass("hide")
                                    .text(width + "x" + height)
                                    .show()
                        },
                        1000
                    )
                }
            },
            ondataopen: function (data) {
                console.log("ondataopen: ---------- ", data)
                window.Janus.log("The DataChannel is available!")
                $("#videos").removeClass("hide").show()
                $("#datasend").removeAttr("disabled")
            },
            ondata: function (data) {
                console.log("ondata: ---------- ", data)
                window.Janus.debug("We got data from the DataChannel!", data)
                $("#datarecv").val(data)
            },
            oncleanup: function () {
                window.Janus.log(" ::: Got a cleanup notification :::")
                $("#myvideo").remove()
                $("#remotevideo").remove()
                // $("#videoleft").parent().unblock()
                window.$.unblockUI()
                $(".no-video-container").remove()
                $("#callee").empty().hide()
                WebRTC.getInstance().yourusername = null
                $("#curbitrate").hide()
                $("#curres").hide()
                $("#videos").hide()
                $("#toggleaudio").attr("disabled", true)
                $("#togglevideo").attr("disabled", true)
                $("#bitrate").attr("disabled", true)
                $("#curbitrate").hide()
                $("#curres").hide()
                if (WebRTC.getInstance().bitrateTimer)
                    clearInterval(WebRTC.getInstance().bitrateTimer)
                WebRTC.getInstance().bitrateTimer = null
                $("#waitingvideo").remove()
                $("#videos").hide()
                WebRTC.getInstance().simulcastStarted = false
                $("#simulcast").remove()
                $("#peer").removeAttr("disabled").val("")
                console.log("oncleanup: ------------ ")

                // $("#call")
                //     .removeAttr("disabled")
                //     .html("Call")
                //     .removeClass("btn-danger")
                //     .addClass("btn-success")
                //     .unbind("click")
                //     .click(WebRTC.getInstance().doCall)
            },
        })
    }

    // checkEnter(event) {
    //     console.log("checkEnter: ------------- ", event.target.id)
    //     var theCode = event.keyCode
    //         ? event.keyCode
    //         : event.which
    //         ? event.which
    //         : event.charCode
    //     if (theCode === 13) {
    //         if (event.target.id === "username")
    //             WebRTC.getInstance().registerUsername()
    //         else if (event.target.id === "peer") WebRTC.getInstance().doCall()
    //         else if (event.target.id === "datasend")
    //             WebRTC.getInstance().sendData()
    //         return false
    //     } else {
    //         return true
    //     }
    // }

    registerUsername(username) {
        // Try a registration
        // $("#username").attr("disabled", true)
        // $("#register").attr("disabled", true).unbind("click")
        // var username = $("#username").val()
        // if (username === "") {
        //     window.bootbox.alert("Insert a username to register (e.g., pippo)")
        //     $("#username").removeAttr("disabled")
        //     $("#register")
        //         .removeAttr("disabled")
        //         .click(WebRTC.getInstance().registerUsername)
        //     return
        // }
        // if (/[^a-zA-Z0-9]/.test(username)) {
        //     window.bootbox.alert("Input is not alphanumeric")
        //     $("#username").removeAttr("disabled").val("")
        //     $("#register")
        //         .removeAttr("disabled")
        //         .click(WebRTC.getInstance().registerUsername)
        //     return
        // }
        var register = { request: "register", username: username }

        WebRTC.getInstance().videocall.send({ message: register })
    }

    doCall(username) {
        // Call someone
        // $("#peer").attr("disabled", true)
        // $("#call").attr("disabled", true).unbind("click")
        // var username = $("#peer").val()
        // if (username === "") {
        //     window.bootbox.alert("Insert a username to call (e.g., pluto)")
        //     $("#peer").removeAttr("disabled")
        //     $("#call").removeAttr("disabled").click(WebRTC.getInstance().doCall)
        //     return
        // }
        // if (/[^a-zA-Z0-9]/.test(username)) {
        //     window.bootbox.alert("Input is not alphanumeric")
        //     $("#peer").removeAttr("disabled").val("")
        //     $("#call").removeAttr("disabled").click(WebRTC.getInstance().doCall)
        //     return
        // }
        // Call this user
        // WebRTC.getInstance().videocall.createOffer({
        //     // By default, it's sendrecv for audio and video...
        //     media: { data: true }, // ... let's negotiate data channels as well
        //     // If you want to test simulcasting (Chrome and Firefox only), then
        //     // pass a ?simulcast=true when opening this demo page: it will turn
        //     // the following 'simulcast' property to pass to janus.js to true
        //     simulcast: WebRTC.getInstance().doSimulcast,
        //     success: function (jsep) {
        //         window.Janus.debug("Got SDP!", jsep)
        //         var body = { request: "call", username: username }
        //         console.log("doCall: ---------- ", body)
        //         WebRTC.getInstance().videocall.send({
        //             message: body,
        //             jsep: jsep,
        //         })
        //     },
        //     error: function (error) {
        //         window.Janus.error("WebRTC error...", error)
        //         window.bootbox.alert("WebRTC error... " + error.message)
        //     },
        // })
    }

    doHangup() {
        // Hangup a call
        $("#call").attr("disabled", true).unbind("click")
        var hangup = { request: "hangup" }
        WebRTC.getInstance().videocall.send({ message: hangup })
        WebRTC.getInstance().videocall.hangup()
        WebRTC.getInstance().yourusername = null
    }

    // sendData() {
    //     var data = $("#datasend").val()
    //     if (data === "") {
    //         window.bootbox.alert(
    //             "Insert a message to send on the DataChannel to your peer"
    //         )
    //         return
    //     }
    //     WebRTC.getInstance().videocall.data({
    //         text: data,
    //         error: function (reason) {
    //             window.bootbox.alert(reason)
    //         },
    //         success: function () {
    //             $("#datasend").val("")
    //         },
    //     })
    // }

    // Helper to parse query string
    getQueryStringValue(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(window.location.search)

        return results === null
            ? ""
            : decodeURIComponent(results[1].replace(/\+/g, " "))
    }

    // Helpers to create Simulcast-related UI, if enabled
    addSimulcastButtons(temporal) {
        $("#curres")
            .parent()
            .append(
                '<div id="simulcast" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
                    '	<div class"row">' +
                    '		<div class="btn-group btn-group-xs" style="width: 100%">' +
                    '			<button id="sl-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
                    '			<button id="sl-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
                    '			<button id="sl-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
                    "		</div>" +
                    "	</div>" +
                    '	<div class"row">' +
                    '		<div class="btn-group btn-group-xs hide" style="width: 100%">' +
                    '			<button id="tl-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
                    '			<button id="tl-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
                    '			<button id="tl-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
                    "		</div>" +
                    "	</div>" +
                    "</div>"
            )
        // Enable the simulcast selection buttons
        $("#sl-0")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                window.toastr.info(
                    "Switching simulcast substream, wait for it... (lower quality)",
                    null,
                    { timeOut: 2000 }
                )
                if (!$("#sl-2").hasClass("btn-success"))
                    $("#sl-2")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                if (!$("#sl-1").hasClass("btn-success"))
                    $("#sl-1")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                $("#sl-0")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info")
                WebRTC.getInstance().videocall.send({
                    message: { request: "set", substream: 0 },
                })
            })
        $("#sl-1")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                window.toastr.info(
                    "Switching simulcast substream, wait for it... (normal quality)",
                    null,
                    { timeOut: 2000 }
                )
                if (!$("#sl-2").hasClass("btn-success"))
                    $("#sl-2")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                $("#sl-1")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info")
                if (!$("#sl-0").hasClass("btn-success"))
                    $("#sl-0")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                WebRTC.getInstance().videocall.send({
                    message: { request: "set", substream: 1 },
                })
            })
        $("#sl-2")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                window.toastr.info(
                    "Switching simulcast substream, wait for it... (higher quality)",
                    null,
                    { timeOut: 2000 }
                )
                $("#sl-2")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info")
                if (!$("#sl-1").hasClass("btn-success"))
                    $("#sl-1")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                if (!$("#sl-0").hasClass("btn-success"))
                    $("#sl-0")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                WebRTC.getInstance().videocall.send({
                    message: { request: "set", substream: 2 },
                })
            })
        if (!temporal)
            // No temporal layer support
            return
        $("#tl-0").parent().removeClass("hide")
        $("#tl-0")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                window.toastr.info(
                    "Capping simulcast temporal layer, wait for it... (lowest FPS)",
                    null,
                    { timeOut: 2000 }
                )
                if (!$("#tl-2").hasClass("btn-success"))
                    $("#tl-2")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                if (!$("#tl-1").hasClass("btn-success"))
                    $("#tl-1")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                $("#tl-0")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info")
                WebRTC.getInstance().videocall.send({
                    message: { request: "set", temporal: 0 },
                })
            })
        $("#tl-1")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                window.toastr.info(
                    "Capping simulcast temporal layer, wait for it... (medium FPS)",
                    null,
                    { timeOut: 2000 }
                )
                if (!$("#tl-2").hasClass("btn-success"))
                    $("#tl-2")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                $("#tl-1")
                    .removeClass("btn-primary btn-info")
                    .addClass("btn-info")
                if (!$("#tl-0").hasClass("btn-success"))
                    $("#tl-0")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                WebRTC.getInstance().videocall.send({
                    message: { request: "set", temporal: 1 },
                })
            })
        $("#tl-2")
            .removeClass("btn-primary btn-success")
            .addClass("btn-primary")
            .unbind("click")
            .click(function () {
                window.toastr.info(
                    "Capping simulcast temporal layer, wait for it... (highest FPS)",
                    null,
                    { timeOut: 2000 }
                )
                $("#tl-2")
                    .removeClass("btn-primary btn-info btn-success")
                    .addClass("btn-info")
                if (!$("#tl-1").hasClass("btn-success"))
                    $("#tl-1")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                if (!$("#tl-0").hasClass("btn-success"))
                    $("#tl-0")
                        .removeClass("btn-primary btn-info")
                        .addClass("btn-primary")
                WebRTC.getInstance().videocall.send({
                    message: { request: "set", temporal: 2 },
                })
            })
    }

    updateSimulcastButtons(substream, temporal) {
        // Check the substream
        if (substream === 0) {
            window.toastr.success(
                "Switched simulcast substream! (lower quality)",
                null,
                {
                    timeOut: 2000,
                }
            )
            $("#sl-2")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
            $("#sl-1")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
            $("#sl-0")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success")
        } else if (substream === 1) {
            window.toastr.success(
                "Switched simulcast substream! (normal quality)",
                null,
                {
                    timeOut: 2000,
                }
            )
            $("#sl-2")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
            $("#sl-1")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success")
            $("#sl-0")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
        } else if (substream === 2) {
            window.toastr.success(
                "Switched simulcast substream! (higher quality)",
                null,
                {
                    timeOut: 2000,
                }
            )
            $("#sl-2")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success")
            $("#sl-1")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
            $("#sl-0")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
        }
        // Check the temporal layer
        if (temporal === 0) {
            window.toastr.success(
                "Capped simulcast temporal layer! (lowest FPS)",
                null,
                {
                    timeOut: 2000,
                }
            )
            $("#tl-2")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
            $("#tl-1")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
            $("#tl-0")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success")
        } else if (temporal === 1) {
            window.toastr.success(
                "Capped simulcast temporal layer! (medium FPS)",
                null,
                {
                    timeOut: 2000,
                }
            )
            $("#tl-2")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
            $("#tl-1")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success")
            $("#tl-0")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
        } else if (temporal === 2) {
            window.toastr.success(
                "Capped simulcast temporal layer! (highest FPS)",
                null,
                {
                    timeOut: 2000,
                }
            )
            $("#tl-2")
                .removeClass("btn-primary btn-info btn-success")
                .addClass("btn-success")
            $("#tl-1")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
            $("#tl-0")
                .removeClass("btn-primary btn-success")
                .addClass("btn-primary")
        }
    }
}
export default WebRTC
