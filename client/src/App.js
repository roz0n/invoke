import "./App.css";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import useForm from 'react-hook-form';
import DATA from "./constants/dataConstants";

const { GET, POST } = DATA;
const SECRET = "Arnaldo was here";

const authEndpoint = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86n2guu7lpgeen&redirect_uri=http://localhost:3000/auth&state=${SECRET}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;

const fullPageStyle = {
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "space-around",
  height: "100vh",
  maxWidth: "100%",
  overflowX: "hidden"
};

async function postAuthorizationCode(setError, setValue, options = {}) {
  try {
    const postData = await fetch("/auth/linkedin", options);
    const response = await postData.json();

    if (!postData.ok) {
      throw new Error();
    } else {
      setValue(response);
    }
  } catch (error) {
    setError(true);
  }
}

async function getUserData(setError, setValue, options = {}) {
  try {
    const getData = await fetch("/auth/linkedin/user", options);
    const response = await getData.json();

    if (!getData.ok) {
      throw new Error();
    } else {
      setValue(response);
    }
  } catch (error) {
    setError(true);
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

        <Link to="/signin">
          <button>Sign in with native-auth</button>
        </Link>
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

  const storeUserData = data => {
    window.localStorage.setItem("accessToken", data.accessToken);
    window.localStorage.setItem("accessExpiration", data.expiresIn);

    setUserData(data);
  };

  useEffect(() => {
    if (authorizationCode) {
      const reqBody = {
        authorizationCode,
        secret: SECRET
      };

      postAuthorizationCode(setError, storeUserData, {
        method: POST,
        body: JSON.stringify(reqBody),
        headers: {
          "Content-Type": "application/json"
        }
      });
    } else {
      setError(true);
    }
  }, [authorizationCode]);

  return (
    <div className="Auth" style={fullPageStyle}>
      {!error ? (
        <div>Authenticating with LinkedIn...</div>
      ) : (
        <div>
          Sorry, I couldn't authenticate with LinkedIn.{" "}
          <span role="img" aria-label="sad-emoji">
            😔
          </span>
          <br />
          <div>
            <Link to="/">Return home?</Link>
          </div>
        </div>
      )}

      {userData && userData.accessToken && <Redirect to="/user" />}
    </div>
  );
}

function User() {
  const accessToken = window.localStorage.getItem("accessToken");
  const [error, setError] = useState(false);
  const [userData, setUserData] = useState(null);

  const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessExpiration");

    setUserData(null);
  };

  useEffect(() => {
    if (accessToken) {
      getUserData(setError, setUserData, {
        method: GET,
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken
        }
      });
    } else {
      setError(true);
    }
  }, [accessToken]);

  return (
    <div className="User" style={fullPageStyle}>
      {accessToken || !error ? (
        <>
          <div>
            <span>User is successfully logged in</span>
            <br />
            <h1>
              {userData && userData.localizedFirstName}{" "}
              {userData && userData.localizedLastName}
            </h1>
          </div>
          <button onClick={logoutUser}>Logout</button>
        </>
      ) : (
        <Redirect to="/" />
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="NotFound" style={fullPageStyle}>
      <h1>404</h1>
      <span>Can't find that</span>
      <Link to="/">Return home</Link>
    </div>
  );
}

function NativeSignIn() {
  return (
    <div style={fullPageStyle}>
      Native sign in

      <section>
        Login
        <LoginForm />
      </section>

      <Link to="/register">Register an account</Link>
    </div>
  )
}

function NativeRegister() {
  return (
    <div style={fullPageStyle}>
      Native registration

      <section>
        Register
        <RegisterForm />
      </section>

      <Link to="/signin">Sign in instead</Link>
      <Link to="/">Return home</Link>
    </div>
  )
}

function RegisterForm() {
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = data => console.log(data);
  console.log(errors);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="Username" name="Username" ref={register({max: 16, min: 3})} />
      <input type="email" placeholder="Email" name="Email" ref={register} />
      <input type="text" placeholder="Confirm email" name="Confirm email" ref={register} />
      <input type="text" placeholder="Password" name="Password" ref={register} />
      <input type="text" placeholder="Confirm Password" name="Confirm Password" ref={register} />

      <input type="submit" />
    </form>
  );
}

function LoginForm() {
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = data => console.log(data);
  console.log(errors);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="Username or email" name="Username or email" ref={register({max: 50, min: 3})} />
      <input type="text" placeholder="Password" name="Password" ref={register} />

      <input type="submit" />
    </form>
  );
}

function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/user" component={User} />
      <Route path="/signin" component={NativeSignIn} />
      <Route path="/register" component={NativeRegister} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
