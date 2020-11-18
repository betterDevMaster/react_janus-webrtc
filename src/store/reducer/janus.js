const janus = (
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
    // console.log("janus reducer: -------------- ", state, action)
    switch (action.type) {
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
        case "JANUS_REMOTESTREAM":
            return {
                ...state,
                stream: {
                    local: state.stream.local,
                    remote: [...action.value],
                },
            }
        default:
            return state
    }
}

export default janus
