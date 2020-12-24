const chat = (
    state = { status: "UNINITIALIZED", showPanel: false, users: [], kind: "all", message: "", sender: "", contents: [] },
    action
) => {
    switch (action.type) {
        case "CHAT_SHOWPANEL":
            return { ...state, showPanel: action.showPanel }
        case "CHAT_USERS":
            return { ...state, users: action.users }
        case "CHAT_MESSAGE":
            return { ...state, contents: [...state.contents, { kind: action.kind, message: action.message, sender: action.sender }] }
        // return { ...state, kind: action.kind, message: action.message, sender: action.sender }
        default:
            return state
    }
}

export default chat
