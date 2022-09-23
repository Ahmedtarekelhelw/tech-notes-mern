import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "./authApiSlice";
import { setCredentials } from "./authSlice";
import usePersist from "../../hooks/usePersist";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

const Login = () => {
  useTitle("Login Page");
  const errRef = useRef();
  const userRef = useRef();
  const [errMsg, setErrMsg] = useState("");
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const [persist, setPersist] = usePersist();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const handleChange = ({ target }) => {
    setUser((prev) => ({ ...prev, [target.id]: target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { accessToken } = await login(user).unwrap();
      dispatch(setCredentials({ accessToken }));
      setUser({ username: "", password: "" });
      navigate("/dash");
    } catch (error) {
      setErrMsg(error?.data?.msg);
    }
  };

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user.username, user.password]);

  const errClass = errMsg ? "errmsg" : "offscreen";
  const content = (
    <section className="public">
      <header>
        <h1>Employee Login</h1>
      </header>
      <main className="login">
        <p ref={errRef} className={errClass} aria-live="assertive">
          {errMsg}
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input
            className="form__input"
            type="text"
            id="username"
            ref={userRef}
            value={user.username}
            onChange={handleChange}
            autoComplete="off"
            required
          />

          <label htmlFor="password">Password:</label>
          <input
            className="form__input"
            type="password"
            id="password"
            onChange={handleChange}
            value={user.password}
            required
          />
          <button className="form__submit-button" disabled={isLoading}>
            {isLoading ? <PulseLoader color={"#fff"} /> : "Sign In"}
          </button>

          <label htmlFor="persist" className="form__persist">
            <input
              type="checkbox"
              id="persist"
              className="form__checkbox"
              onChange={() => setPersist((prev) => !prev)}
              checked={persist}
            />
            Trust This Device
          </label>
        </form>
      </main>
      <footer>
        <Link to="/">Back to Home</Link>
      </footer>
    </section>
  );
  return content;
};

export default Login;
