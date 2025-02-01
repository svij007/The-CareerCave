import React, { useContext, useEffect } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import PostJob from "./components/Job/PostJob";
import NotFound from "./components/NotFound/NotFound";
import MyJobs from "./components/Job/MyJobs";

const App = () => {
  const { isAuthorized, setIsAuthorized, setUser, user } = useContext(Context);

  // Fetch user once when the app loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/user/getuser", {
          withCredentials: true,
        });
        console.log("User fetched:", response.data.user);
        setUser(response.data.user);
        setIsAuthorized(true);
      } catch (error) {
        console.log("Error fetching user:", error);
        setIsAuthorized(false);
      }
    };

    // Only fetch the user if not already authorized
    if (!isAuthorized) {
      fetchUser();
    }
  }, [isAuthorized, setUser, setIsAuthorized]);

  // Check if user is authorized before showing routes
  if (!isAuthorized) {
    return (
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
  <Route path="/" element={<Home />} />

  {/* Shared route for viewing all jobs */}
    <Route 
      path="/job/getall" 
      element={
        user?.role === "Job Seeker" || user?.role === "Employer" 
          ? <Jobs /> 
          : <NotFound />
      } 
    />

<Route
  path="/applications/me"
  element={
    user?.role === "Job Seeker" || user?.role === "Employer"
      ? <MyApplications />
      : <NotFound />
  }
/>


    {/* Job Seekers can view individual job details */}
    <Route path="/job/:id" element={user?.role === "Job Seeker" ? <JobDetails /> : <NotFound />} />
    
    {/* Job Seekers can apply to a job */}
    <Route path="/application/:id" element={user?.role === "Job Seeker" ? <Application /> : <NotFound />} />
    
    {/* Employers can post jobs */}
    <Route path="/job/post" element={user?.role === "Employer" ? <PostJob /> : <NotFound />} />
    
    {/* Employers can view their posted jobs */}
    <Route path="/job/me" element={user?.role === "Employer" ? <MyJobs /> : <NotFound />} />

    <Route path="/jobs/:id" element={<JobDetails />} />


    {/* Catch-all for unknown paths */}
    <Route path="*" element={<NotFound />} />
  </Routes>

      <Footer />
      <Toaster />
    </BrowserRouter>
  );
};

export default App;