import * as Constraint from "../constraint"

const common = (state = {}, action) => {
    switch (action.type) {
        case Constraint.SUCCESS_ATTACH_JANUS:
            console.log("reduer: success attach: ------ ;", {
                ...state,
                ...action.value,
            })
            return {
                ...state,
                ...action.value,
            }
        default:
            return state
    }
}

export default common
