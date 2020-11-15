import {
    CLICK_CAMERA,
    CLICK_CHAT,
    CLICK_FULLSCREEN,
    CLICK_MIC,
    CLICK_SCREEN_SHARING,
} from "../constraint"
export function onClickChat(data) {
    return (dispatch) => {
        dispatch({
            type: CLICK_CHAT,
            value: data,
        })
    }
}
export function onClickCamera(data) {
    return (dispatch) => {
        dispatch({
            type: CLICK_CAMERA,
            value: data,
        })
    }
}
export function onClickFullScreen(data) {
    return (dispatch) => {
        dispatch({
            type: CLICK_FULLSCREEN,
            value: data,
        })
    }
}
export function onClickMic(data) {
    return (dispatch) => {
        dispatch({
            type: CLICK_MIC,
            value: data,
        })
    }
}
export function onClickScreenShare(data) {
    return (dispatch) => {
        dispatch({
            type: CLICK_SCREEN_SHARING,
            value: data,
        })
    }
}
