import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import demosPage from "./containers/demosPage"
import videoRoomPage from "./containers/videoRoomPage"
import videoCallPage from "./containers/videoCallPage"
// import screenSharePage from "./containers/screenSharePage"

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={demosPage} />
                <Route path="/videoRoom" exact component={videoRoomPage} />
                <Route path="/videoCall" exact component={videoCallPage} />
                {/* <Route path="/screenShare" exact component={screenSharePage} /> */}
            </Switch>
        </Router>
    )
}

export default App
