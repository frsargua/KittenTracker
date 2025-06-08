// src/pages/CreateLitterPage.tsx
import React, { useState } from "react";
import { createLitter } from "../services/LitterService";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

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
      today.setHours(0, 0, 0, 0);
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const newLitter = await createLitter(
        {
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          motherName: formData.motherName,
          breed: formData.breed,
          notes: formData.notes,
        },
        getAccessTokenSilently
      );
      setSubmitMessage(
        `Litter group "${newLitter.name}" created successfully!`
      );
      setTimeout(() => navigate(`/litters/${newLitter.id}`), 1500);
    } catch (error: any) {
      setSubmitMessage(`Error: ${error.message || "Failed to create litter."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card p-4 shadow-sm border-0">
            <div className="card-body">
              <h1 className="text-center mb-4">Create New Litter</h1>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Litter Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Mama Luna's First Batch"
                    required
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
                    required
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
                    rows={4}
                    placeholder="Any special care instructions, location found, etc."
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span className="ms-2">Creating...</span>
                      </>
                    ) : (
                      "Create Litter"
                    )}
                  </button>
                </div>

                {submitMessage && (
                  <div
                    className={`alert ${
                      submitMessage.startsWith("Error:")
                        ? "alert-danger"
                        : "alert-success"
                    } mt-4`}
                  >
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLitterPage;
