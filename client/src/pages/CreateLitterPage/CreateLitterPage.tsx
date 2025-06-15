// src/pages/CreateLitterPage.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createLitter } from "../../services/LitterService";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { catBreeds } from "./Scripts/Template";

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Litter name is required")
    .length(20, "Max length is 50")
    .matches(/^[a-zA-Z0-9\s]+$/, "Name must be alphanumeric."),
  motherName: yup
    .string()
    .required("Mother's name is required")
    .length(20, "Max length is 50")
    .matches(/^[a-zA-Z0-9\s]+$/, "Name must be alphanumeric."),
  dateOfBirth: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future.")
    .typeError("A valid date is required."),
  breed: yup
    .string()
    .required("Predominant breed is required.")
    .length(20, "Max length is 50"),
  otherBreed: yup
    .string()
    .defined()
    .default("")
    .when("breed", {
      is: "Other",
      then: (schema) =>
        schema
          .required("Please specify the breed.")
          .matches(/^[a-zA-Z0-9\s]+$/, "Breed must be alphanumeric.")
          .length(20, "Max length is 50"),
      otherwise: (schema) => schema,
    }),
  notes: yup
    .string()
    .default("")
    .length(20, "Max length is 50")
    .matches(
      /^[a-zA-Z0-9\s.,!?-]*$/,
      "Notes can only contain letters, numbers, and common punctuation."
    ),
});

type LitterFormData = yup.InferType<typeof validationSchema>;

const CreateLitterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LitterFormData>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur", // Validate fields when the user blurs out of them
  });

  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const selectedBreed = watch("breed");

  const onSubmit = async (data: LitterFormData) => {
    setSubmitMessage(null);
    try {
      const newLitter = await createLitter(data, getAccessTokenSilently);
      setSubmitMessage(
        `Litter group "${newLitter.name}" created successfully!`
      );
      setTimeout(() => navigate(`/litters/${newLitter.id}`), 1500);
    } catch (error: any) {
      setSubmitMessage(`Error: ${error.message || "Failed to create litter."}`);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card p-4 shadow-sm border-0">
            <div className="card-body">
              <h1 className="text-center mb-4">Create New Litter</h1>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Litter Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., Mama Luna's First Batch"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">
                      {errors.name.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="motherName" className="form-label">
                    Mother's Name*
                  </label>
                  <input
                    type="text"
                    id="motherName"
                    {...register("motherName")}
                    className={`form-control ${
                      errors.motherName ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., Luna, Unknown"
                  />
                  {errors.motherName && (
                    <div className="invalid-feedback">
                      {errors.motherName.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth*
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    {...register("dateOfBirth")}
                    className={`form-control ${
                      errors.dateOfBirth ? "is-invalid" : ""
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <div className="invalid-feedback">
                      {errors.dateOfBirth.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="breed" className="form-label">
                    Predominant Breed*
                  </label>
                  <select
                    id="breed"
                    {...register("breed")}
                    className={`form-select ${
                      errors.breed ? "is-invalid" : ""
                    }`}
                  >
                    <option value="">Select a breed</option>
                    {catBreeds.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                  {errors.breed && (
                    <div className="invalid-feedback">
                      {errors.breed.message}
                    </div>
                  )}
                </div>

                {selectedBreed === "Other" && (
                  <div className="mb-3">
                    <label htmlFor="otherBreed" className="form-label">
                      Please Specify Breed*
                    </label>
                    <input
                      type="text"
                      id="otherBreed"
                      {...register("otherBreed")}
                      className={`form-control ${
                        errors.otherBreed ? "is-invalid" : ""
                      }`}
                      placeholder="Enter the breed"
                    />
                    {errors.otherBreed && (
                      <div className="invalid-feedback">
                        {errors.otherBreed.message}
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    {...register("notes")}
                    className={`form-control ${
                      errors.notes ? "is-invalid" : ""
                    }`}
                    rows={4}
                    placeholder="Any special care instructions, location found, etc."
                  />
                  {errors.notes && (
                    <div className="invalid-feedback">
                      {errors.notes.message}
                    </div>
                  )}
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
