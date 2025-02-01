import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// Post a new application
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;

  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };

  if (!name || !email || !coverLetter || !phone || !address || !employerID) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  let resumeData = {};

  // Only upload resume if it's provided
  if (req.files && req.files.resume) {
    const { resume } = req.files;
    const allowedFormats = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(resume.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. Please upload a PNG, JPEG, or PDF file.", 400)
      );
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath);

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
      return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
    }

    resumeData = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  // Application data structure
  const applicationData = {
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID: {
      user: req.user._id,
      role: "Job Seeker",
    },
    employerID,
  };

  // Only add resume data if it's available
  if (Object.keys(resumeData).length > 0) {
    applicationData.resume = resumeData;
  }

  // Create application
  const application = await Application.create(applicationData);

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

// Employer view all applications
export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }

    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id })
      .populate("applicantID.user", "name email phone address coverLetter")  // Populating applicant details
      .exec();

    res.status(200).json({
      success: true,
      applications,
    });
  }
);

// Job Seeker view all applications they've submitted
export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }

    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id })
      .populate("employerID.user", "name email")  // Populating employer details
      .exec();

    res.status(200).json({
      success: true,
      applications,
    });
  }
);

// Job Seeker delete their application
export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }

    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);
