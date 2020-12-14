import { act } from "react-dom/test-utils"

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
            return { ...state, message: action.message, status: action.status }
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
                    remote: action.value,
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
