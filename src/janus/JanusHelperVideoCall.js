import JanusHelper from "./janusHelper"

export default class JanusHelperVideoCall extends JanusHelper {
    static getInstance() {
        if (!JanusHelperVideoCall._inst) {
            JanusHelperVideoCall._inst = new JanusHelperVideoCall()
        }
        return JanusHelperVideoCall._inst
    }
    init(dispatch, roomType, pluginName) {
        super.init(dispatch, roomType, pluginName)
    }
    start(roomName) {
        this.myroom = roomName // Demo room
        super.start()
    }
    stop() {
        if (this.session) this.session.destroy()
    }
}
