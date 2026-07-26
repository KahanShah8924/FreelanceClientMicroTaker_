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

  const notifyKey = "fcm_react_notifications";
  const addNotification = (text) => {
    if (typeof text !== "string" || !text.trim()) return;
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem(notifyKey)) || [];

    // Avoid duplicates within 1 minute (matches NotificationPanel logic).
    const isDuplicate = stored.some(
      (n) => n.text === text && now - n.timestamp < 60000
    );
    if (!isDuplicate) {
      const next = [
        { id: now.toString(), text, read: false, timestamp: now },
        ...stored,
      ];
      localStorage.setItem(notifyKey, JSON.stringify(next));
    }

    // If the panel is mounted, notify it live too.
    window.dispatchEvent(new CustomEvent("addNotification", { detail: text }));
  };

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
    if (!loginDetails.email.trim() || !loginDetails.password.trim()) {
      addNotification("Please enter both email and password.");
      setPopup({
        open: true,
        severity: "error",
        message: "Incorrect Input",
      });
      return;
    }

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
          addNotification("Logged in successfully");
          console.log(response);
        })
        .catch((err) => {
          const msg =
            err?.response?.data?.message ||
            "Login failed. Please try again.";
          addNotification(
            err?.response?.data?.message || "Login failed"
          );
          setPopup({
            open: true,
            severity: "error",
            message: msg,
          });
          console.log(err.response);
        });
    } else {
      setPopup({
        open: true,
        severity: "error",
        message: "Incorrect Input",
      });
      addNotification("Incorrect Input");
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
              required={true}
            />
          </div>
          <div className="mb-6">
            <PasswordInput
              label="Password"
              value={loginDetails.password}
              onChange={(event) => handleInput("password", event.target.value)}
              className="w-full"
              error={inputErrorHandler.password.error}
              helperText={inputErrorHandler.password.message}
              onBlur={(event) => {
                if (event.target.value === "") {
                  handleInputError("password", true, "Password is required");
                } else {
                  handleInputError("password", false, "");
                }
              }}
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
