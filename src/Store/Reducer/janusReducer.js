import * as Constraint from "../constraint"

const initialState = {
    attachSuccess: false,
    attachError: false,
    attachConsentDialog: false,
    attachIceState: false,
    attachMediaState: false,
    webrtcState: false,
    onMessage: false,
    onLocalstream: false,
    onRemotestream: false,
    onDataOpen: false,
    onData: false,
    onCleanUp: false,
}

const clearAll = (state, action) => {
    return {
        ...state,
        attachSuccess: false,
        attachError: false,
        attachConsentDialog: false,
        attachIceState: false,
        attachMediaState: false,
        webrtcState: false,
        onMessage: false,
        onLocalstream: false,
        onRemotestream: false,
        onDataOpen: false,
        onData: false,
        onCleanUp: false,
    }
}

const janusReducer = (state = initialState, action) => {
    switch (action.type) {
        // case actionTypes.ATTACH_CLEAR_ALL:
        //     return clearAll(state, action)
        default:
            // console.log("janusReducer: before: ----------- ", state)
            const clearState = clearAll(state, action)
            // console.log("janusReducer: after: ----------- ", clearState, state)
            return {
                ...clearState,
                ...action.value,
            }
    }
}

export default janusReducer
