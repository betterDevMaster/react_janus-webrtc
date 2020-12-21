import { combineReducers } from "redux"
import janus from "./janus"
import video from "./video"

const rootReducer = combineReducers({
    janus,
    video,
})

export default rootReducer
