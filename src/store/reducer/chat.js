const chat = (
    state = {
        name: "",
        audio: false,
        video: false,
        select: false,
        index: 0,
    },
    action
) => {
    switch (action.type) {
        case "VIDEO_INIT":
            return { ...state, name: action.name, video: action.video, audio: action.audio }
        case "VIDEO_ASTATE":
            return { ...state, audio: action.audio }
        case "VIDEO_VSTATE":
            return { ...state, video: action.video }
        case "VIDEO_SELECT":
            return { ...state, name: action.name, select: action.select, index: action.index }
        default:
            return state
    }
}

export default chat
