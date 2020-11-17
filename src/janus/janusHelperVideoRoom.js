import JanusHelper from "./janusHelper"
import * as $ from "jquery"

export default class JanusHelperVideoRoom extends JanusHelper {
    static getInstance() {
        if (!JanusHelperVideoRoom._inst) {
            JanusHelperVideoRoom._inst = new JanusHelperVideoRoom()
        }
        return JanusHelperVideoRoom._inst
    }
    init(dispatch) {
        super.init(dispatch, "janus.plugin.videoroom")
    }
    start(roomName) {
        this.myroom = roomName // Demo room
        super.start()
    }
    stop() {
        if (this.session) this.session.destroy()
    }
}
