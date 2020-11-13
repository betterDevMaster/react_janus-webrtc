import * as Constraint from "../constraint"

const videoCall = (state = {}, action) => {
    switch (action.type) {
        case Constraint.EVENT_REGISTERED:
            return {
                ...state,
                ...action.value,
            }
        case Constraint.EVENT_CALLING:
            return {
                ...state,
                ...action.value,
            }
        case Constraint.EVENT_INCOMINGCALL:
            return {
                ...state,
                ...action.value,
            }
        case Constraint.EVENT_ACCEPTED:
            return {
                ...state,
                ...action.value,
            }
        case Constraint.EVENT_UPDATE:
            return {
                ...state,
                ...action.value,
            }
        case Constraint.EVENT_HANGUP:
            return {
                ...state,
                ...action.value,
            }
        case Constraint.EVENT_SIMULCAST:
            return {
                ...state,
                ...action.value,
            }
        default:
            return state
    }
}

export default videoCall
