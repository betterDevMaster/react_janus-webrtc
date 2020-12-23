import JanusHelper from "./janusHelper"
import $ from "jquery"

export default class JanusHeloperTextRoom extends JanusHelper {
    static getInstance() {
        if (!JanusHeloperTextRoom._inst) {
            JanusHeloperTextRoom._inst = new JanusHeloperTextRoom()
        }
        return JanusHeloperTextRoom._inst
    }
    init(dispatch, roomType, pluginName) {
        super.init(dispatch, roomType, pluginName)
    }
    start(roomName) {
        this.myroom = roomName // Demo room
        super.start()
    }
    stop() {
        super.stop()
    }
    onAttach(pluginHandle) {
        const body = { request: "setup" }
        window.Janus.debug("Sending message:", body)
        pluginHandle.send({ message: body })

        const createRoom = {
            request: "create",
            // textroom: "create",
            room: this.myroom,
            description: "New TextRoom",
            // secret: "adminpwd",
        }

        pluginHandle.send({ message: createRoom })

        super.onAttach(pluginHandle)
    }
    registerUsername(username) {
        if ($("#username").length === 0) {
            // Create fields to register
            $("#register").click(this.registerUsername)
            $("#username").focus()
        } else {
            // Try a registration
            $("#username").attr("disabled", true)
            $("#register").attr("disabled", true).unbind("click")
            if (username === "") {
                $("#you").removeClass().addClass("label label-warning").html("Insert your display name (e.g., pippo)")
                $("#username").removeAttr("disabled")
                $("#register").removeAttr("disabled").click(this.registerUsername)
                return
            }

            this.myid = window.Janus.randomString(12)
            var transaction = window.Janus.randomString(12)
            var register = {
                textroom: "join",
                transaction: transaction,
                room: this.myroom,
                username: this.myid,
                display: username,
            }
            this.myusername = username
            this.transactions[transaction] = (response) => {
                if (response["textroom"] === "error") {
                    // Something went wrong
                    if (response["error_code"] === 417) {
                        // This is a "no such room" error: give a more meaningful description
                        window.bootbox.alert(
                            "<p>Apparently room <code>" +
                                this.myroom +
                                "</code> (the one this demo uses as a test room) " +
                                "does not exist...</p><p>Do you have an updated <code>janus.plugin.textroom.jcfg</code> " +
                                "configuration file? If not, make sure you copy the details of room <code>" +
                                this.myroom +
                                "</code> " +
                                "from that sample in your current configuration file, then restart Janus and try again."
                        )
                    } else {
                        window.bootbox.alert(response["error"])
                    }
                    $("#username").removeAttr("disabled").val("")
                    $("#register").removeAttr("disabled").click(this.registerUsername)
                    return
                }
                // We're in
                $("#roomjoin").hide()
                $("#room").removeClass("hide").show()
                $("#participant").removeClass("hide").html(this.myusername).show()
                $("#chatroom").css("height", $(window).height() - 420 + "px")
                $("#datasend").removeAttr("disabled")
                // Any participants already in?
                var _this = this

                if (response.participants && response.participants.length > 0) {
                    for (var i in response.participants) {
                        var p = response.participants[i]
                        this.participants[p.username] = p.display ? p.display : p.username
                        // console.log("Participants: ----------------------- ", this.participants, p, this.myid, $("#rp" + p.username).length)
                        if (p.username !== this.myid && $("#rp" + p.username).length === 0) {
                            // Add to the participants list
                            $("#list").append(
                                '<li id="rp' + p.username + '" class="list-group-item">' + this.participants[p.username] + "</li>"
                            )
                            $("#rp" + p.username)
                                .css("cursor", "pointer")
                                .click(function () {
                                    // console.log('$(this).attr("id"): ----------- ', $(this).attr("id"))
                                    var username = $(this).attr("id").split("rp")[1]
                                    _this.sendPrivateMsg(username)
                                })
                        }
                        $("#chatroom").append(
                            '<p style="color: green;">[' +
                                this.getDateString() +
                                "] <i>" +
                                this.participants[p.username] +
                                " joined</i></p>"
                        )
                        // $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
                    }
                }
            }
            this.janusPlugin.data({
                text: JSON.stringify(register),
                error: (reason) => {
                    window.bootbox.alert(reason)
                    $("#username").removeAttr("disabled").val("")
                    $("#register").removeAttr("disabled").click(this.registerUsername)
                },
            })
        }

        super.registerUsername(username, register)
    }
    onMessage(msg, jsep) {
        console.log("textRoom: Message: -------------- ", msg, jsep)
        var plugin = this.janusPlugin

        window.Janus.debug(" ::: Got a message :::", msg)
        if (msg["error"]) {
            window.bootbox.alert(msg["error"])
        }
        if (jsep) {
            this.janusPlugin.createAnswer({
                jsep: jsep,
                media: { audio: false, video: false, data: true }, // We only use datachannels
                success: (jsep) => {
                    window.Janus.debug("Got SDP!", jsep)
                    var body = { request: "ack" }
                    plugin.send({ message: body, jsep: jsep })
                },
                error: (error) => {
                    window.Janus.error("WebRTC error:", error)
                    window.bootbox.alert("WebRTC error... " + error.message)
                },
            })
        }
    }
    onData(data) {
        window.Janus.debug("We got data from the DataChannel!", data)
        var json = JSON.parse(data)
        var transaction = json["transaction"]
        if (this.transactions[transaction]) {
            // Someone was waiting for this
            this.transactions[transaction](json)
            delete this.transactions[transaction]
            return
        }
        var what = json["textroom"]
        console.log("onData: ---------------- ", this.participants, json["display"], what)
        var _this = this
        var msg = json["text"]
        var dateString = this.getDateString(json["date"])
        var username = json["username"]
        // var when = new Date()
        if (what === "message") {
            // Incoming message: public or private?
            msg = msg.replace(new RegExp("<", "g"), "&lt")
            msg = msg.replace(new RegExp(">", "g"), "&gt")
            var from = json["from"]
            var whisper = json["whisper"]
            if (whisper === true) {
                // Private message
                $("#chatroom").append(
                    '<p style="color: purple;">[' + dateString + "] <b>[whisper from " + this.participants[from] + "]</b> " + msg
                )
            } else {
                // Public message
                $("#chatroom").append("<p>[" + dateString + "] <b>" + this.participants[from] + ":</b> " + msg)
            }
        } else if (what === "announcement") {
            // Room announcement
            msg = msg.replace(new RegExp("<", "g"), "&lt")
            msg = msg.replace(new RegExp(">", "g"), "&gt")
            $("#chatroom").append('<p style="color: purple;">[' + dateString + "] <i>" + msg + "</i>")
        } else if (what === "join") {
            // Somebody joined
            var display = json["display"]
            this.participants[username] = display ? display : username

            if (username !== this.myid && $("#rp" + username).length === 0) {
                // Add to the participants list
                $("#list").append('<li id="rp' + username + '" class="list-group-item">' + this.participants[username] + "</li>")
                $("#rp" + username)
                    .css("cursor", "pointer")
                    .click(function () {
                        var username = $(this).attr("id").split("rp")[1]
                        _this.sendPrivateMsg(username)
                    })
            }
            $("#chatroom").append(
                '<p style="color: green;">[' + this.getDateString() + "] <i>" + this.participants[username] + " joined</i></p>"
            )
        } else if (what === "leave") {
            // Somebody left
            $("#rp" + username).remove()
            $("#chatroom").append(
                '<p style="color: green;">[' + this.getDateString() + "] <i>" + this.participants[username] + " left</i></p>"
            )
            delete this.participants[username]
        } else if (what === "kicked") {
            // Somebody was kicked
            $("#rp" + username).remove()
            $("#chatroom").append(
                '<p style="color: green;">[' +
                    this.getDateString() +
                    "] <i>" +
                    this.participants[username] +
                    " was kicked from the room</i></p>"
            )
            // $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
            delete this.participants[username]
            if (username === this.myid) {
                window.bootbox.alert("You have been kicked from the room", () => {
                    window.location.reload()
                })
            }
        } else if (what === "destroyed") {
            if (json["room"] !== this.myroom) return
            // Room was destroyed, goodbye!
            window.Janus.warn("The room has been destroyed!")
            window.bootbox.alert("The room has been destroyed", () => {
                window.location.reload()
            })
        }
    }
    onWebrtcStateChange(on) {}
    getDateString(jsonDate) {
        var when = new Date()
        if (jsonDate) {
            when = new Date(Date.parse(jsonDate))
        }
        var dateString =
            ("0" + when.getUTCHours()).slice(-2) +
            ":" +
            ("0" + when.getUTCMinutes()).slice(-2) +
            ":" +
            ("0" + when.getUTCSeconds()).slice(-2)
        return dateString
    }
    sendPrivateMsg(username) {
        var display = this.participants[username]
        if (!display) return
        window.bootbox.prompt("Private message to " + display, (result) => {
            if (result && result !== "") {
                var message = {
                    textroom: "message",
                    transaction: window.Janus.randomString(12),
                    room: this.myroom,
                    to: username,
                    text: result,
                }
                this.janusPlugin.data({
                    text: JSON.stringify(message),
                    error: (reason) => {
                        window.bootbox.alert(reason)
                    },
                    success: () => {
                        $("#chatroom").append(
                            '<p style="color: purple;">[' + this.getDateString() + "] <b>[whisper to " + display + "]</b> " + result
                        )
                        // $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
                    },
                })
            }
        })
        return
    }

    sendData() {
        var data = $("#datasend").val()
        if (data === "") {
            window.bootbox.alert("Insert a message to send on the DataChannel")
            return
        }
        var message = {
            textroom: "message",
            transaction: window.Janus.randomString(12),
            room: this.myroom,
            text: data,
        }
        this.janusPlugin.data({
            text: JSON.stringify(message),
            error: function (reason) {
                this.bootbox.alert(reason)
            },
            success: function () {
                $("#datasend").val("")
            },
        })
    }
}
