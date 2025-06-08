// src/components/CreateLitterPage.tsx
import React, { useState } from "react";
import { createLitter } from "../services/LitterService";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
// import './CreateLitterPage.css'; // Remove or comment out this line

interface LitterFormData {
  name: string;
  dateOfBirth: string;
  motherName: string;
  breed: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  dateOfBirth?: string;
}

const CreateLitterPage: React.FC = () => {
  const [formData, setFormData] = useState<LitterFormData>({
    name: "",
    dateOfBirth: "",
    motherName: "",
    breed: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Litter name is required.";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare dates only
      if (dob > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const litterDataToSubmit: Pick<
        Litter,
        "name" | "dateOfBirth" | "motherName" | "breed" | "notes"
      > = {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        motherName: formData.motherName,
        breed: formData.breed,
        notes: formData.notes,
      };

      const newLitter = await createLitter(
        litterDataToSubmit,
        getAccessTokenSilently
      );
      setSubmitMessage(
        `Litter group "${newLitter.name}" created successfully!`
      );
      setFormData({
        name: "",
        dateOfBirth: "",
        motherName: "",
        breed: "",
        notes: "",
      });
      setErrors({});
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      setSubmitMessage(`Error: ${error.message || "Failed to create litter."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Added container and some padding/margin utilities from Bootstrap
    <div className="container mt-4 mb-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card p-4 shadow-sm">
            <h1 className="text-center mb-4">Create New Litter Group</h1>
            <form onSubmit={handleSubmit} noValidate>
              {/* Using Bootstrap's form-group (mb-3 for margin) and form-control */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Litter Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Mama Luna's First Batch"
                  aria-required="true"
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth*
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className={`form-control ${
                    errors.dateOfBirth ? "is-invalid" : ""
                  }`}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  aria-required="true"
                />
                {errors.dateOfBirth && (
                  <div className="invalid-feedback">{errors.dateOfBirth}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="motherName" className="form-label">
                  Mother's Name
                </label>
                <input
                  type="text"
                  id="motherName"
                  name="motherName"
                  className="form-control"
                  value={formData.motherName}
                  onChange={handleChange}
                  placeholder="e.g., Luna, Unknown"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="breed" className="form-label">
                  Predominant Breed
                </label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  className="form-control"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g., Domestic Shorthair"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3} // Adjusted rows for Bootstrap's default textarea height
                  placeholder="e.g., Special care instructions, found location..."
                />
              </div>

              {/* Bootstrap button classes */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-100"
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span className="ms-1">Creating...</span>
                  </>
                ) : (
                  "Create Litter Group"
                )}
              </button>

              {/* Bootstrap alert classes for messages */}
              {submitMessage && (
                <div
                  className={`alert ${
                    submitMessage.startsWith("Error:")
                      ? "alert-danger"
                      : "alert-success"
                  } mt-3`}
                  role="alert"
                >
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLitterPage;
