import * as Constraint from "../constraint"

const common = (state = {}, action) => {
    switch (action.type) {
        case Constraint.SUCCESS_ATTACH_JANUS:
            return {
                ...state,
                ...action.value,
            }
        default:
            return state
    }
}

export default common
