import { combineReducers } from "redux"
import janusReducer from "./janusReducer"
// import videoCall from "./videoCall"
// import chats from './chats'
// import screens from './screen'
// import mediadevices from './medias'

const rootReducer = combineReducers({
    janusReducer,
    // videoCall,
    // chats,
    // screens
})

export default rootReducer
