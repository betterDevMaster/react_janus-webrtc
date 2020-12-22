const janus = (
    state = {
        message: {},
        status: "UNINITIALIZED",
        pluginType: "",
        stream: {
            local: null,
            sharedLocal: null,
            remote: [],
            sharedRemote: [],
        },
    },
    action
) => {
    console.log("janus reducer: -------------- ", state, action)
    switch (action.type) {
        case "JANUS_STATE":
            return { ...state, status: action.value, pluginType: action.pluginType }
        case "JANUS_MESSAGE":
            return { ...state, message: action.message, status: action.status }
        case "JANUS_LOCALSTREAM":
            return {
                ...state,
                stream: {
                    local: action.local,
                    sharedLocal: state.stream.sharedLocal,
                    remote: state.stream.remote,
                    sharedRemote: state.stream.sharedRemote,
                },
            }
        case "JANUS_SHAREDLOCALSTREAM":
            return {
                ...state,
                stream: {
                    local: state.stream.local,
                    sharedLocal: action.sharedLocal,
                    remote: state.stream.remote,
                    sharedRemote: state.stream.sharedRemote,
                },
            }
        case "JANUS_REMOTESTREAM":
            return {
                ...state,
                stream: {
                    local: state.stream.local,
                    sharedLocal: state.stream.sharedLocal,
                    remote: action.remote,
                    sharedRemote: state.stream.sharedRemote,
                },
            }
        case "JANUS_SHAREDREMOTESTREAM":
            return {
                ...state,
                stream: {
                    local: state.stream.local,
                    sharedLocal: state.stream.sharedLocal,
                    remote: state.stream.remote,
                    sharedRemote: action.sharedRemote,
                },
            }
        case "JANUS_PATICIPAINTS":
            return {
                ...state,
                participant: action.value,
            }
        case "JANUS_DESTROYED":
            return {
                ...state,
                message: {},
                status: "UNINITIALIZED",
                stream: {
                    local: null,
                },
            }
        default:
            return state
    }
}

export default janus
