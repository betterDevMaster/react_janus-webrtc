import JanusHelper from "./janusHelper"

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
    registerUsername(username) {
        var register = {
            request: "join",
            room: this.myroom,
            ptype: "publisher",
            display: username,
        }
        super.registerUsername(username, register)
    }
    onMessage(msg, jsep) {
        var plugin = this.janusPlugin
        console.log("textRoom: Message: -------------- ", msg, jsep)
        this.janusPlugin.createAnswer({
            jsep: jsep,
            media: { audio: false, video: false, data: true }, // We only use datachannels
            success: function (jsep) {
                window.Janus.debug("Got SDP!", jsep)
                var body = { request: "ack" }
                plugin.send({ message: body, jsep: jsep })
            },
            error: function (error) {
                window.Janus.error("WebRTC error:", error)
                window.bootbox.alert("WebRTC error... " + error.message)
            },
        })
        super.onMessage(msg, jsep)
    }
    onData(data) {
        //~ $('#datarecv').val(data);
        console.log("textRoom: onData: -------------------- ", data)
        var json = JSON.parse(data)
        var transaction = json["transaction"]
        if (this.transactions[transaction]) {
            // Someone was waiting for this
            this.transactions[transaction](json)
            delete this.transactions[transaction]
            return
        }
        var what = json["textroom"]
        // if (what === "message") {
        //     // Incoming message: public or private?
        //     var msg = json["text"]
        //     msg = msg.replace(new RegExp("<", "g"), "&lt")
        //     msg = msg.replace(new RegExp(">", "g"), "&gt")
        //     var from = json["from"]
        //     var dateString = getDateString(json["date"])
        //     var whisper = json["whisper"]
        //     if (whisper === true) {
        //         // Private message
        //         $("#chatroom").append(
        //             '<p style="color: purple;">[' + dateString + "] <b>[whisper from " + this.participants[from] + "]</b> " + msg
        //         )
        //         $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        //     } else {
        //         // Public message
        //         $("#chatroom").append("<p>[" + dateString + "] <b>" + this.this.participants[from] + ":</b> " + msg)
        //         $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        //     }
        // } else if (what === "announcement") {
        //     // Room announcement
        //     var msg = json["text"]
        //     msg = msg.replace(new RegExp("<", "g"), "&lt")
        //     msg = msg.replace(new RegExp(">", "g"), "&gt")
        //     var dateString = getDateString(json["date"])
        //     $("#chatroom").append('<p style="color: purple;">[' + dateString + "] <i>" + msg + "</i>")
        //     $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        // } else if (what === "join") {
        //     // Somebody joined
        //     var username = json["username"]
        //     var display = json["display"]
        //     this.participants[username] = display ? display : username
        //     if (username !== myid && $("#rp" + username).length === 0) {
        //         // Add to the this.participants list
        //         $("#list").append('<li id="rp' + username + '" class="list-group-item">' + this.participants[username] + "</li>")
        //         $("#rp" + username)
        //             .css("cursor", "pointer")
        //             .click(function () {
        //                 var username = $(this).attr("id").split("rp")[1]
        //                 sendPrivateMsg(username)
        //             })
        //     }
        //     $("#chatroom").append(
        //         '<p style="color: green;">[' + getDateString() + "] <i>" + this.participants[username] + " joined</i></p>"
        //     )
        //     $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        // } else if (what === "leave") {
        //     // Somebody left
        //     var username = json["username"]
        //     var when = new Date()
        //     $("#rp" + username).remove()
        //     $("#chatroom").append('<p style="color: green;">[' + getDateString() + "] <i>" + this.participants[username] + " left</i></p>")
        //     $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        //     delete this.participants[username]
        // } else if (what === "kicked") {
        //     // Somebody was kicked
        //     var username = json["username"]
        //     var when = new Date()
        //     $("#rp" + username).remove()
        //     $("#chatroom").append(
        //         '<p style="color: green;">[' + getDateString() + "] <i>" + this.participants[username] + " was kicked from the room</i></p>"
        //     )
        //     $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        //     delete this.participants[username]
        //     if (username === myid) {
        //         bootbox.alert("You have been kicked from the room", function () {
        //             window.location.reload()
        //         })
        //     }
        // } else if (what === "destroyed") {
        //     if (json["room"] !== myroom) return
        //     // Room was destroyed, goodbye!
        //     Janus.warn("The room has been destroyed!")
        //     bootbox.alert("The room has been destroyed", function () {
        //         window.location.reload()
        //     })
        // }
        super.onData(data)
    }
    onWebrtcStateChange(on) {
        // this.dispatch({ type: "JANUS_STATE", value: "CONNECTED" })
        this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED" })
    }
}
