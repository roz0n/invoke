import "./App.css";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
const GET = "GET";
const POST = "POST";
const SECRET = "Arnaldo was here";

const authEndpoint = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86n2guu7lpgeen&redirect_uri=http://localhost:3000/auth&state=${SECRET}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;

const fullPageStyle = {
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "space-around",
  height: "100vh",
  width: "100%"
};

async function mockRequest(setError, setValue, options = { method: GET }) {
  switch (options.method) {
    case "GET":
      return fetch("https://swapi.co/api/planets/", { ...options })
        .then(res => res.json())
        .then(data => setValue(data))
        .catch(() => setError(true));
    case "POST":
      return fetch("/auth/linkedin", { ...options })
        .then(res => res.json())
        .then(data => setValue(data))
        .catch(() => setError(true));
    default:
      break;
  }
}

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

function Auth({ location }) {
  const { search: searchParams } = location;
  const [error, setError] = useState(false);
  const [userData, setUserData] = useState(null);

  const authorizationCode =
    searchParams.split("code=")[1] &&
    searchParams.split("code=")[1].split("&")[0];

  useEffect(() => {
    if (authorizationCode) {
      const reqBody = {
        authorizationCode,
        secret: SECRET
      };

      mockRequest(setError, setUserData, {
        method: POST,
        body: JSON.stringify(reqBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      setError(true);
    }
  }, []);

  // TODO:
  // We must extract url params here and post with the access token [DONE]
  // If successful, redirect somewhere can can store the necessary tokens
  // Maybe a redirect page, or a user profile page, or maybe the former first then the latter
  // If unsuccessful, redirect somewhere back home and present an error

  console.log("authorization_code:", authorizationCode);
  return (
    <div className="Auth" style={fullPageStyle}>
      {!error ? (
        <div>Authenticating with LinkedIn...</div>
      ) : (
        <div>
          Sorry, I couldn't authenticate with LinkedIn. 😔
          <br />
          <div>
            <Link to="/">Return home?</Link>
          </div>
        </div>
      )}

      {userData && <Redirect to="/user" />}
    </div>
  );
}

function User() {
  return (
    <div className="User" style={fullPageStyle}>
      User!
    </div>
  );
}

function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/user" component={User} />
    </Switch>
  );
}

export default App;

// http://localhost:3000/auth/linkedin/cb?code=AQShMMEdfWNPAJs-_jaKXAri9vfV9CNjdDr6fk7zO9Q_5_gi5AcbawT-Z0aZHlkXJJjXfMNJYAiFEprQrOSZiChodFLpoX-mNn5X4AFeefTQ0noCBSZdprumuqMTYRwEO2c_X7hU8-1U4td0iPKZXLwywvZomYDbbDXSspd1S2trlettqmAN-XZDh5g7-Q&state=fooobar
