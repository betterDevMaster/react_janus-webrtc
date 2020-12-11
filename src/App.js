import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import loadingPage from "./containers/loadingPage"
import landingPage from "./containers/landingPage"
import lecturePage from "./containers/lecturePage"
import textRoomPage from "./containers/textRoomPage"
// import demosPage from "./containers/demosPage"
import videoRoomPage from "./containers/videoRoomPage"
import videoCallPage from "./containers/videoCallPage"
// import screenSharePage from "./containers/screenSharePage"

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={loadingPage} />
                <Route path="/landing" exact component={landingPage} />
                <Route path="/lecture" exact component={lecturePage} />
                <Route path="/textRoom" exact component={textRoomPage} />
                {/* <Route path="/" exact component={demosPage} /> */}
                <Route path="/videoRoom" exact component={videoRoomPage} />
                <Route path="/videoCall" exact component={videoCallPage} />
                {/* <Route path="/screenShare" exact component={screenSharePage} /> */}
            </Switch>
        </Router>
    )
}

export default App
