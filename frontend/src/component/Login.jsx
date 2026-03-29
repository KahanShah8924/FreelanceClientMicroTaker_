import { useContext, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

import PasswordInput from "../lib/PasswordInput";
import EmailInput from "../lib/EmailInput";
import { SetPopupContext } from "../App";

import apiList from "../lib/apiList";
import isAuth from "../lib/isAuth";

const Login = (props) => {
  const setPopup = useContext(SetPopupContext);

  const [loggedin, setLoggedin] = useState(isAuth());

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const [inputErrorHandler, setInputErrorHandler] = useState({
    email: {
      error: false,
      message: "",
    },
    password: {
      error: false,
      message: "",
    },
  });

  const handleInput = (key, value) => {
    setLoginDetails({
      ...loginDetails,
      [key]: value,
    });
  };

  const handleInputError = (key, status, message) => {
    setInputErrorHandler({
      ...inputErrorHandler,
      [key]: {
        error: status,
        message: message,
      },
    });
  };

  const handleLogin = () => {
    const verified = !Object.keys(inputErrorHandler).some((obj) => {
      return inputErrorHandler[obj].error;
    });
    if (verified) {
      axios
        .post(apiList.login, loginDetails)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("type", response.data.type);
          setLoggedin(isAuth());
          setPopup({
            open: true,
            severity: "success",
            message: "Logged in successfully",
          });
          console.log(response);
        })
        .catch((err) => {
          setPopup({
            open: true,
            severity: "error",
            message: err.response.data.message,
          });
          console.log(err.response);
        });
    } else {
      setPopup({
        open: true,
        severity: "error",
        message: "Incorrect Input",
      });
    }
  };

  return loggedin ? (
    <Navigate to="/" replace />
  ) : (
    <div className="flex min-height-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <span className="text-lg font-bold">F</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-900">
              FCM Platform
            </h1>
            <p className="text-sm text-slate-500">
              Sign in to continue
            </p>
          </div>
        </div>

        <div className="card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Login</h2>
          <div className="mb-4">
            <EmailInput
              label="Email"
              value={loginDetails.email}
              onChange={(event) => handleInput("email", event.target.value)}
              inputErrorHandler={inputErrorHandler}
              handleInputError={handleInputError}
              className="w-full"
            />
          </div>
          <div className="mb-6">
            <PasswordInput
              label="Password"
              value={loginDetails.password}
              onChange={(event) => handleInput("password", event.target.value)}
              className="w-full"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLogin()}
            className="btn-primary w-full"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
