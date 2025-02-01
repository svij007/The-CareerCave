import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../main";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JobSeekerCard from "./JobSeekerCard";  // Correct path
import EmployerCard from "./EmployerCard";    // Ensure this is correct
import ResumeModal from "./ResumeModal";      // Ensure this is correct
import toast from "react-hot-toast";

const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    coverLetter: "",
    phone: "",
    address: "",
    jobId: "",
  });
  const [resume, setResume] = useState(null);
  const navigateTo = useNavigate();

  // Check if user is authorized and redirect if not
  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
    }
  }, [isAuthorized, navigateTo]);

  // Fetch applications
  const fetchApplications = async () => {
    if (!user) return;

    try {
      let url = "";
      if (user.role === "Employer") {
        url = "http://localhost:4000/api/v1/application/employer/getall";
      } else if (user.role === "Job Seeker") {
        url = "http://localhost:4000/api/v1/application/jobseeker/getall";
      }

      if (url) {
        const response = await axios.get(url, { withCredentials: true });
        console.log("Fetched Applications: ", response.data.applications);
        setApplications(response.data.applications); // Update the state with the fetched data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Fetch applications when user or role changes
  useEffect(() => {
    fetchApplications();
  }, [user?.role, isAuthorized]);

  // Handle resume file change
  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit application with resume
  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    for (const key in formData) {
      formDataToSubmit.append(key, formData[key]);
    }

    if (resume) {
      formDataToSubmit.append("resume", resume);
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/application/jobseeker/post",
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);

      // Update state with the newly added application
      setApplications((prevApplications) => [
        ...prevApplications,
        response.data.application,
      ]);

      // Optionally refetch all applications
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting application");
    }
  };

  // Delete application
  const deleteApplication = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/v1/application/delete/${id}`,
        { withCredentials: true }
      );
      toast.success(response.data.message);

      // Remove the deleted application from the state
      setApplications((prevApplications) =>
        prevApplications.filter((application) => application._id !== id)
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting application");
    }
  };

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="my_applications page">
      <div className="container">
        <center>
          <h1>{user?.role === "Job Seeker" ? "My Applications" : "Applications From Job Seekers"}</h1>
        </center>

        {/* Job Seeker Form */}
        {user?.role === "Job Seeker" && (
          <form onSubmit={handleSubmitApplication}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your Email"
              required
            />
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              placeholder="Cover Letter"
              required
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your Phone"
              required
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Your Address"
              required
            />
            <input
              type="text"
              name="jobId"
              value={formData.jobId}
              onChange={handleInputChange}
              placeholder="Job ID"
              required
            />
            <input
              type="file"
              name="resume"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={handleResumeChange}
            />
            <button type="submit">Submit Application</button>
          </form>
        )}

        {/* Display Applications */}
        {applications.length === 0 ? (
          <center>
            <h4>No Applications Found</h4>
          </center>
        ) : (
          applications.map((element) =>
            user?.role === "Job Seeker" ? (
              <JobSeekerCard
                key={element._id}
                element={element}
                deleteApplication={deleteApplication}
                openModal={openModal}
              />
            ) : (
              <EmployerCard key={element._id} element={element} openModal={openModal} />
            )
          )
        )}
      </div>

      {modalOpen && <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />}
    </section>
  );
};

export default MyApplications;
