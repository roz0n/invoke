import "./App.css";
import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const authEndpoint = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86n2guu7lpgeen&redirect_uri=http://localhost:3000/auth&state=fooobar&scope=r_liteprofile%20r_emailaddress%20w_member_social`;

function App() {
  return (
    <Router>
      <Routes />
    </Router>
  );
}

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Invoke (α)</p>
        <small>Enter your LinkedIn credentials below to get started</small>
      </header>

      <section>
        <a href={authEndpoint}>
          <button>Sign in with LinkedIn</button>
        </a>
      </section>
    </div>
  );
}

function Auth() {
  const style = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    height: "100vh",
    width: "100%"
  };

  return (
    <div className="Auth" style={style}>
      Authenticating with LinkedIn...
    </div>
  );
}

function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/auth" component={Auth} />
    </Switch>
  );
}

export default App;

// http://localhost:3000/auth/linkedin/cb?code=AQShMMEdfWNPAJs-_jaKXAri9vfV9CNjdDr6fk7zO9Q_5_gi5AcbawT-Z0aZHlkXJJjXfMNJYAiFEprQrOSZiChodFLpoX-mNn5X4AFeefTQ0noCBSZdprumuqMTYRwEO2c_X7hU8-1U4td0iPKZXLwywvZomYDbbDXSspd1S2trlettqmAN-XZDh5g7-Q&state=fooobar
