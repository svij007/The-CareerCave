import React from "react";

const EmployerCard = ({ element, openModal }) => {
  return (
    <div className="employer_card">
      <h3>Application Details</h3>
      <p><strong>Name:</strong> {element.name}</p>
      <p><strong>Email:</strong> {element.email}</p>
      <p><strong>Phone:</strong> {element.phone}</p>
      <p><strong>Address:</strong> {element.address}</p>
      <p><strong>Cover Letter:</strong> {element.coverLetter}</p>
      <button onClick={() => openModal(element.resumeUrl)}>
        View Resume
      </button>
    </div>
  );
};

export default EmployerCard;
