import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import demosPage from "./Containers/demosPage"
import videoRoomPage from "./Containers/videoRoomPage"
import videoCallPage from "./Containers/videoCallPage"
import screenSharePage from "./Containers/screenSharePage"

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={demosPage} />
                <Route path="/videoRoom" exact component={videoRoomPage} />
                <Route path="/videoCall" exact component={videoCallPage} />
                <Route path="/screenShare" exact component={screenSharePage} />
            </Switch>
        </Router>
    )
}

export default App
