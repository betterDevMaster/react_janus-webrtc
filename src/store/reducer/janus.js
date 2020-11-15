export default janus = (
    state = {
        message: {},
        status: "UNINITIALIZED",
        stream: {
            local: null,
            remote: [],
        },
    },
    action
) => {
    console.log(action)
    switch (action.type) {
        // case actionTypes.ATTACH_CLEAR_ALL:
        //     return clearAll(state, action)
        case "JANUS_STATE":
            return { ...state, status: action.value }
        case "JANUS_MESSAGE":
            return { ...state, message: action.value }
        case "JANUS_LOCALSTREAM":
            return {
                ...state,
                stream: {
                    local: action.value,
                    remote: state.stream.remote,
                },
            }
        case "JANUS_ADDREMOTESTREAM":
            return {
                ...state,
                stream: {
                    local: state.stream.local,
                    remote: [...state.stream.remote, action.value],
                },
            }
        case "JANUS_REMOVEREMOTESTREAM":

        default:
            return state
    }
}
