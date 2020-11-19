import JanusHelper from "./janusHelper"

export default class JanusHelperVideoRoom extends JanusHelper {
    static getInstance() {
        if (!JanusHelperVideoRoom._inst) {
            JanusHelperVideoRoom._inst = new JanusHelperVideoRoom()
        }
        return JanusHelperVideoRoom._inst
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
}
