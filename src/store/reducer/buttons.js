import {CLICK_CAMERA, CLICK_CHAT, CLICK_FULLSCREEN, CLICK_MIC, CLICK_SCREEN_SHARING} from './../constraint/constraint';

const buttons = (
    state = {
        chat: "on",
        camera: "on",
        fullscreen: "on",
        mic: "on",
        screenshare: "off",
    },
    action
) => {
    switch (action.type) {
        case CLICK_CHAT:
            return {
                ...state,
                chat: action.value,
            }
        case CLICK_CAMERA:
            return {
                ...state,
                camera: action.value,
            }
        case CLICK_FULLSCREEN:
            return {
                ...state,
                fullscreen: action.value,
            }
        case CLICK_MIC:
            return {
                ...state,
                mic: action.value,
            }
        case CLICK_SCREEN_SHARING:
            return {
                ...state,
                screenshare: action.value,
            }
        default:
            return state
    }
}

export default buttons
