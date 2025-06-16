import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { KittenCreationData } from "../../../services/LitterService";

interface AddKittenFormProps {
  onAddKitten: (kittenData: KittenCreationData) => Promise<void>;
  onCancel: () => void;
}

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Kitten name is required")
    .max(50, "Name cannot be longer than 50 characters")
    .matches(
      /^[a-zA-Z0-9\s'-]+$/,
      "Name can only contain letters, numbers, spaces, hyphens, and apostrophes."
    ),
  gender: yup
    .string()
    .required("Kitten name is required")
    .max(50, "Gender cannot be longer than 50 characters"),
  color: yup
    .string()
    .required("Kitten name is required")
    .max(50, "Color/Markings cannot be longer than 50 characters"),
  description: yup
    .string()
    .default("")
    .max(200, "Description cannot be longer than 200 characters")
    .matches(
      /^[a-zA-Z0-9\s.,!?-]*$/,
      "Notes can only contain letters, numbers, and common punctuation."
    ),
});

type KittenFormData = yup.InferType<typeof validationSchema>;

const AddKittenForm: React.FC<AddKittenFormProps> = ({
  onAddKitten,
  onCancel,
}) => {
  // This line is the critical fix.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<KittenFormData>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: KittenFormData) => {
    try {
      await onAddKitten(data);
      reset();
      onCancel();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="card p-3 mb-4 bg-light border">
      <h5>Add a New Kitten</h5>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="kittenName" className="form-label">
            Name*
          </label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            id="kittenName"
            {...register("name")}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="kittenGender" className="form-label">
              Gender
            </label>
            <select
              className={`form-select ${errors.gender ? "is-invalid" : ""}`}
              id="kittenGender"
              {...register("gender")}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && (
              <div className="invalid-feedback">{errors.gender.message}</div>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="kittenColor" className="form-label">
              Color/Markings
            </label>
            <input
              type="text"
              className={`form-control ${errors.color ? "is-invalid" : ""}`}
              id="kittenColor"
              {...register("color")}
            />
            {errors.color && (
              <div className="invalid-feedback">{errors.color.message}</div>
            )}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="kittenDescription" className="form-label">
            Description
          </label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            id="kittenDescription"
            rows={2}
            {...register("description")}
          ></textarea>
          {errors.description && (
            <div className="invalid-feedback">{errors.description.message}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary me-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Kitten"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddKittenForm;
