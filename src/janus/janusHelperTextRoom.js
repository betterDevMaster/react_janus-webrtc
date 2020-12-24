import JanusHelper from "./janusHelper"
import $ from "jquery"

export default class JanusHeloperTextRoom extends JanusHelper {
    init(dispatch, roomType, pluginName) {
        super.init(dispatch, roomType, pluginName)
    }
    start(roomName, username) {
        this.myroom = roomName // Demo room
        this.myusername = username

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
            room: this.myroom,
            description: "New TextRoom",
        }
        pluginHandle.send({ message: createRoom })
        super.onAttach(pluginHandle, this.pluginName)
    }
    registerUsername(username) {
        this.myid = window.Janus.randomString(12)
        var transaction = window.Janus.randomString(12)
        var register = {
            textroom: "join",
            transaction: transaction,
            room: this.myroom,
            username: this.myid,
            display: username,
        }

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
                return
            }
            // Any participants already in?
            // var _this = this
            if (response.participants && response.participants.length > 0) {
                for (var i in response.participants) {
                    var p = response.participants[i]
                    this.participants[p.username] = p.display ? p.display : p.username
                }
            }
        }

        this.janusPlugin.data({
            text: JSON.stringify(register),
            error: (reason) => {
                window.bootbox.alert(reason)
            },
        })
    }
    onMessage(msg, jsep) {
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
                    this.janusPlugin.send({ message: body, jsep: jsep })
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
        var msg = json["text"]
        var username = json["username"]

        // console.log("onData: ---------------- ", data, this.participants, msg, what)
        if (msg && this.isJson(msg)) {
            var parseData = JSON.parse(msg)
            if (parseData.room === "screenShare" && parseData.type === "all") {
                window.screenShareHelper.joinScreen(parseData.roomId)
            }
            if (parseData.room === "textRoom" && parseData.type === "all") {
                this.dispatch({ type: "CHAT_MESSAGE", kind: parseData.type, message: parseData.message, sender: parseData.sender })
            }
        }
        // var when = new Date()
        if (what === "message") {
            // Incoming message: public or private?
            msg = msg.replace(new RegExp("<", "g"), "&lt")
            msg = msg.replace(new RegExp(">", "g"), "&gt")
            var from = json["from"]
            // var to = json["to"]
            var whisper = json["whisper"]
            // console.log("onData: whisper: ---------------- ", msg, from, whisper, this.participants[from])
            if (whisper === true) {
                // Private message
                this.dispatch({ type: "CHAT_MESSAGE", kind: "private", message: msg, sender: this.participants[from] })
            } else {
                // Public message
            }
        } else if (what === "announcement") {
            // Room announcement
            msg = msg.replace(new RegExp("<", "g"), "&lt")
            msg = msg.replace(new RegExp(">", "g"), "&gt")
            // console.log("announcement: ============== ", msg)
            // $("#chatroom").append('<p style="color: purple;">[' + dateString + "] <i>" + msg + "</i>")
        } else if (what === "join") {
            // Somebody joined
            var display = json["display"]
            this.participants[username] = display ? display : username
            // console.log("join: participants: ============== ", this.participants)
            this.dispatch({ type: "CHAT_USERS", users: this.participants })
        } else if (what === "leave") {
            // Somebody left
            // console.log("text: helper: leave: ================ ", this.participants)
            delete this.participants[username]
        } else if (what === "kicked") {
            // Somebody was kicked
            // console.log("text: helper: kicked: ================ ", this.participants)
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
    onWebrtcStateChange(on) {
        if (on) this.registerUsername(this.myusername)
    }
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
    sendPrivateMsg(sendername, username, message) {
        var display = this.participants[username]
        if (!display) return
        var content = {
            textroom: "message",
            transaction: window.Janus.randomString(12),
            room: this.myroom,
            from: sendername,
            to: username,
            text: message,
        }
        this.janusPlugin.data({
            text: JSON.stringify(content),
            error: (reason) => {
                window.bootbox.alert(reason)
            },
            success: () => {
                this.dispatch({ type: "CHAT_MESSAGE", kind: "private", message: message, sender: sendername, receiver: display })
            },
        })
    }

    sendData(userdata) {
        var data = userdata ? userdata : $("#datasend").val()
        // var data = "sdfsdfsdf"
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
                window.bootbox.alert(reason)
            },
            success: function () {},
        })
    }

    isJson(str) {
        try {
            JSON.parse(str)
        } catch (e) {
            return false
        }
        return true
    }
}
