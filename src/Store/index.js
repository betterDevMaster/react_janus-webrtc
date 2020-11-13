import { createStore, applyMiddleware, compose } from "redux"
import thunk from "redux-thunk"
import allReducers from "./reducer/index.js"

const composeEnhancers = //compose;
    process.env.NODE_ENV === "development"
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        : null || compose
const store = createStore(
    allReducers,
    {},
    composeEnhancers(applyMiddleware(thunk))
)

export default store
