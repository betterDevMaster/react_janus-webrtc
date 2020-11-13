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
                // console.log("initJanus: ---------- ")
                // Use a button to start the demo
                // WebRTC.getInstance().startJanus(dispatch, pType)
            },
        })
    }

    startJanus(dispatch, pType) {
        // console.log("startJanus: ---------- ", dispatch, pType)
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
                // console.log("startJanus success: ---------- ", this)
                // Attach to VideoCall plugin
                WebRTC.getInstance().attachJanus(dispatch, pType)
            },
            error: function (error) {
                // console.log("janus init error: ----------")
                window.Janus.error(error)
                window.bootbox.alert(error, function () {
                    window.location.reload()
                })
            },
            destroyed: function () {
                // console.log("janus init destroyed: ----------")
                window.location.reload()
            },
        })
    }

    attachJanus(dispatch, pType) {
        window.janus.attach({
            plugin: "janus.plugin.videocall",
            opaqueId: WebRTC.getInstance().opaqueId,
            success: function (pluginHandle) {
                if (pType === Constraint.VIDEO_CALL) {
                    dispatch({
                        type: Constraint.ATTACH_SUCCESS,
                        value: {
                            attachSuccess: true,
                            pluginHandle: pluginHandle,
                        },
                    })
                }
            },
            error: function (error) {
                dispatch({
                    type: Constraint.ATTACH_ERROR,
                    value: {
                        attachError: true,
                        error: error,
                    },
                })
            },
            consentDialog: function (on) {
                dispatch({
                    type: Constraint.ATTACH_CONSENTDIALOG,
                    value: {
                        attachConsentDialog: true,
                        on: on,
                    },
                })
            },
            iceState: function (state) {
                dispatch({
                    type: Constraint.ATTACH_ICESTATE,
                    value: {
                        attachIceState: true,
                        state: state,
                    },
                })
            },
            mediaState: function (medium, on) {
                dispatch({
                    type: Constraint.ATTACH_MEDEIASTATE,
                    value: {
                        attachMediaState: true,
                        medium: medium,
                        on: on,
                    },
                })
            },
            webrtcState: function (on) {
                dispatch({
                    type: Constraint.ATTACH_WEBRTCSTATE,
                    value: {
                        webrtcState: true,
                        on: on,
                    },
                })
            },
            onmessage: function (msg, jsep) {
                dispatch({
                    type: Constraint.ATTACH_ONMESSAGE,
                    value: {
                        onMessage: true,
                        msg: msg,
                        jsep: jsep,
                    },
                })
            },
            onlocalstream: function (stream) {
                dispatch({
                    type: Constraint.ATTACH_ONLOCALSTREAM,
                    value: {
                        onLocalstream: true,
                        stream: stream,
                    },
                })
            },
            onremotestream: function (stream) {
                dispatch({
                    type: Constraint.ATTACH_ONREMOTESTREAM,
                    value: {
                        onRemotestream: true,
                        stream: stream,
                    },
                })
            },
            ondataopen: function (data) {
                dispatch({
                    type: Constraint.ATTACH_ONDATAOPEN,
                    value: {
                        onDataOpen: true,
                        data: data,
                    },
                })
            },
            ondata: function (data) {
                dispatch({
                    type: Constraint.ATTACH_ONDATA,
                    value: {
                        onData: true,
                        data: data,
                    },
                })
            },
            oncleanup: function () {
                dispatch({
                    type: Constraint.ATTACH_ONCLEANUP,
                    value: {
                        onCleanUp: true,
                    },
                })
            },
        })
    }

    doHangup() {
        // Hangup a call
        $("#call").attr("disabled", true).unbind("click")
        var hangup = { request: "hangup" }
        WebRTC.getInstance().videocall.send({ message: hangup })
        WebRTC.getInstance().videocall.hangup()
        WebRTC.getInstance().yourusername = null
    }

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
