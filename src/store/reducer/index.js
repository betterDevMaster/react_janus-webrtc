import { combineReducers } from "redux"
import janusReducer from "./janusReducer"
import janus from "./janus"
// import videoCall from "./videoCall"
// import chats from './chats'
// import screens from './screen'
// import mediadevices from './medias'

const rootReducer = combineReducers({
    janus,
    janusReducer,
    // janusState: janus,
    // videoCall,
    // chats,
    // screens
})

export default rootReducer
