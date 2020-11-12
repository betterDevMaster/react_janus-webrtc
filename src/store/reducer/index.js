import { combineReducers } from "redux"
import common from "./common"
import videoCall from "./videoCall"
// import chats from './chats'
// import screens from './screen'
// import mediadevices from './medias'

const rootReducer = combineReducers({
    common,
    videoCall,
    // chats,
    // screens
})

export default rootReducer
