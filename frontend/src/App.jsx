import { createContext, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome, { ErrorPage } from "./component/Welcome";
import Navbar from "./component/Navbar";
import Login from "./component/Login";
import Logout from "./component/Logout";
import Signup from "./component/Signup";
import Home from "./component/Home";
import Applications from "./component/Applications";
import Profile from "./component/Profile";
import CreateJobs from "./component/recruiter/CreateJobs";
import MyJobs from "./component/recruiter/MyJobs";
import JobApplications from "./component/recruiter/JobApplications";
import AcceptedApplicants from "./component/recruiter/AcceptedApplicants";
import RecruiterProfile from "./component/recruiter/Profile";
import MessagePopup from "./lib/MessagePopup";
import Chatbot from "./component/Chatbot";
import isAuth, { userType } from "./lib/isAuth";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

export const SetPopupContext = createContext();

function App() {
  const [popup, setPopup] = useState({
    open: false,
    severity: "",
    message: "",
  });
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
      <SetPopupContext.Provider value={setPopup}>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Navbar />
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 pb-8 pt-20 sm:px-6 lg:px-8">
            <div className="flex w-full flex-col">
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/home" element={<Home />} />
                <Route path="/applications" element={<Applications />} />
                <Route
                  path="/profile"
                  element={
                    userType() === "recruiter" ? (
                      <RecruiterProfile />
                    ) : (
                      <Profile />
                    )
                  }
                />
                <Route path="/addjob" element={<CreateJobs />} />
                <Route path="/myjobs" element={<MyJobs />} />
                <Route
                  path="/job/applications/:jobId"
                  element={<JobApplications />}
                />
                <Route path="/employees" element={<AcceptedApplicants />} />
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </div>
          </main>
        </div>
        <Chatbot />
        <MessagePopup
          open={popup.open}
          setOpen={(status) =>
            setPopup({
              ...popup,
              open: status,
            })
          }
          severity={popup.severity}
          message={popup.message}
        />
      </SetPopupContext.Provider>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
