import * as Constraint from "../constraint"

const videoCall = (state = {}, action) => {
    switch (action.type) {
        case Constraint.EVENT_REGISTERED:
            return {
                ...state,
                ...action.value,
            }
        default:
            return state
    }
}

export default videoCall
