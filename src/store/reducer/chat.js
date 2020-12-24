const chat = (state = { status: "UNINITIALIZED", showPanel: false }, action) => {
    switch (action.type) {
        case "CHAT_SHOWPANEL":
            return { ...state, showPanel: action.showPanel }
        // case "CHAT_STATE":
        //     return { ...state, status: action.value, showPanel: action.showPanel }
        default:
            return state
    }
}

export default chat
