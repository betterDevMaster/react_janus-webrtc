import { combineReducers } from "redux"
import janus from "./janus"
import video from "./video"
import chat from "./chat"

const rootReducer = combineReducers({
    janus,
    video,
    chat,
})

export default rootReducer
