const chat = (state = { showPanel: false, users: [], contents: [] }, action) => {
    switch (action.type) {
        case "CHAT_SHOWPANEL":
            return { ...state, showPanel: action.showPanel }
        case "CHAT_USERS":
            return { ...state, users: action.users }
        case "CHAT_MESSAGE":
            if (state.contents.length > 0) {
                const lastContent = state.contents[state.contents.length - 1]
                if (lastContent.kind === action.kind && lastContent.sender === action.sender) {
                    state.contents[state.contents.length - 1].message = lastContent.message + "\n" + action.message
                    return { ...state, state }
                }
            }
            return {
                ...state,
                contents: [
                    ...state.contents,
                    { kind: action.kind, message: action.message, sender: action.sender, receiver: action.receiver },
                ],
            }
        default:
            return state
    }
}

export default chat
