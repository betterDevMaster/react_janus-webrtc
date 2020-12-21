const video = (
    state = {
        name: "",
        audio: false,
        video: false,
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
        default:
            return state
    }
}

export default video
