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
        // Try a registration
        const myid = window.Janus.randomString(12)
        var transaction = window.Janus.randomString(12)
        var register = {
            textroom: "join",
            transaction: transaction,
            room: this.myroom,
            username: myid,
            display: username,
        }
        this.myusername = username
        this.transactions[transaction] = function (response) {
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
            console.log("Participants: ---------------- ", response.participants)
            if (response.participants && response.participants.length > 0) {
                for (var i in response.participants) {
                    var p = response.participants[i]
                    this.participants[p.username] = p.display ? p.display : p.username
                    // if (p.username !== myid && $("#rp" + p.username).length === 0) {
                    //     // Add to the participants list
                    //     $("#list").append('<li id="rp' + p.username + '" class="list-group-item">' + participants[p.username] + "</li>")
                    //     $("#rp" + p.username)
                    //         .css("cursor", "pointer")
                    //         .click(function () {
                    //             var username = $(this).attr("id").split("rp")[1]
                    //             sendPrivateMsg(username)
                    //         })
                    // }
                    // $("#chatroom").append(
                    //     '<p style="color: green;">[' + getDateString() + "] <i>" + participants[p.username] + " joined</i></p>"
                    // )
                    // $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
                }
            }
        }
        this.janusPlugin.data({
            text: JSON.stringify(register),
            error: function (reason) {
                window.bootbox.alert(reason)
            },
        })

        super.registerUsername(username, register)
    }
    onAttach(pluginHandle) {
        const createTextRoom = {
            textroom: "create",
            room: this.myroom,
            description: "New TextRoom",
            secret: "adminpwd",
        }

        pluginHandle.send({ message: createTextRoom })

        const body = { request: "setup" }
        window.Janus.debug("Sending message:", body)
        pluginHandle.send({ message: body })
        super.onAttach(pluginHandle)
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
        }
        // super.onMessage(msg, jsep, null)
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
        this.dispatch({ type: "JANUS_STATE", message: what })
        // this.dispatch(({type: 'JANUS_STATE', message: {whisper: whisper}}))

        // if (what === "message") {
        //     // Incoming message: public or private?
        //     var msg = json["text"]
        //     msg = msg.replace(new RegExp("<", "g"), "&lt")
        //     msg = msg.replace(new RegExp(">", "g"), "&gt")
        //     var from = json["from"]
        //     var dateString = getDateString(json["date"])
        //     var whisper = json["whisper"]
        //     // if (whisper === true) {
        //     //     // Private message
        //     //     $("#chatroom").append(
        //     //         '<p style="color: purple;">[' + dateString + "] <b>[whisper from " + this.participants[from] + "]</b> " + msg
        //     //     )
        //     //     $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        //     // } else {
        //     //     // Public message
        //     //     $("#chatroom").append("<p>[" + dateString + "] <b>" + this.this.participants[from] + ":</b> " + msg)
        //     //     $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        //     // }
        // } else if (what === "announcement") {
        //     // Room announcement
        //     var msg = json["text"]
        //     msg = msg.replace(new RegExp("<", "g"), "&lt")
        //     msg = msg.replace(new RegExp(">", "g"), "&gt")
        //     var dateString = getDateString(json["date"])
        //     $("#chatroom").append('<p style="color: purple;">[' + dateString + "] <i>" + msg + "</i>")
        //     $("#chatroom").get(0).scrollTop = $("#chatroom").get(0).scrollHeight
        // }
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
        console.log("textRoom: webrtcStateChange: ----------------- ", on)
        // this.dispatch({ type: "JANUS_STATE", value: "CONNECTED" })
        // this.dispatch({ type: "JANUS_STATE", value: on ? "CONNECTED" : "DISCONNECTED" })
    }
    // // Just an helper to generate random usernames
    // randomString(len, charSet) {
    //     charSet = charSet || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    //     var randomString = ""
    //     for (var i = 0; i < len; i++) {
    //         var randomPoz = Math.floor(Math.random() * charSet.length)
    //         randomString += charSet.substring(randomPoz, randomPoz + 1)
    //     }
    //     return randomString
    // }
}
