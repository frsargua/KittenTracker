import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as yup from "yup";
import dayjs, { Dayjs } from "dayjs";

interface AddWeightFormProps {
  kittenId: string;
  onAddWeight: (kittenId: string, formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const validationSchema = yup.object().shape({
  dateRecorded: yup
    .date()
    .required("Date is required")
    .max(new Date(), "Date cannot be in the future")
    .typeError("A valid date is required."),
  weightInGrams: yup
    .number()
    .required("Weight is required")
    .positive("Weight must be a positive number")
    .typeError("Weight must be a number"),
  notes: yup
    .string()
    .default("")
    .max(200, "Notes cannot be longer than 200 characters"),
  photoUrl: yup
    .mixed<FileList>()
    .required("Photo is required")
    .test("fileSize", "The file is too large", (value) => {
      if (!value || !value.length) return true; // attachment is optional
      return value[0].size <= 5242880; // 5MB
    })
    .test("fileType", "Unsupported file format", (value) => {
      if (!value || !value.length) return true;
      return ["image/jpeg", "image/png", "image/gif"].includes(value[0].type);
    }),
});

type WeightFormData = yup.InferType<typeof validationSchema>;

const AddWeightForm: React.FC<AddWeightFormProps> = ({
  kittenId,
  onAddWeight,
  onCancel,
}) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WeightFormData>({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: WeightFormData) => {
    const formData = new FormData();
    formData.append("dateRecorded", data.dateRecorded.toDateString());
    formData.append("weightInGrams", data.weightInGrams.toString());
    formData.append("notes", data.notes);
    if (data.photoUrl && data.photoUrl.length > 0) {
      formData.append("photo", data.photoUrl[0]);
    }

    setError(null);
    try {
      await onAddWeight(kittenId, formData);
      reset();
      onCancel(); // Close form on success
    } catch (err: any) {
      setError(err.message || "Failed to add weight record.");
    }
  };

  return (
    <div className="card p-3 mt-3 bg-light border">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          {/* <div className="col-md-6 mb-2">
            <label htmlFor={`weightDate-${kittenId}`} className="form-label">
              Date*
            </label>
            <input
              type="date"
              className={`form-control form-control-sm ${
                errors.dateRecorded ? "is-invalid" : ""
              }`}
              id={`weightDate-${kittenId}`}
              {...register("dateRecorded")}
            />
            {errors.dateRecorded && (
              <div className="invalid-feedback">
                {errors.dateRecorded.message}
              </div>
            )}
          </div> */}
          <Controller
            name="dateRecorded"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Date Recorded*"
                value={field.value ? dayjs(field.value) : null}
                onChange={(newValue: Dayjs | null) =>
                  field.onChange(newValue ? newValue.toDate() : null)
                }
                sx={{ width: "100%", mt: 2, mb: 1 }}
                slotProps={{
                  textField: {
                    error: !!errors.dateRecorded,
                    helperText: errors.dateRecorded?.message,
                  },
                }}
              />
            )}
          />
          <div className="col-md-6 mb-2">
            <label htmlFor={`weightGrams-${kittenId}`} className="form-label">
              Weight (grams)*
            </label>
            <input
              type="number"
              step="0.1"
              className={`form-control form-control-sm ${
                errors.weightInGrams ? "is-invalid" : ""
              }`}
              id={`weightGrams-${kittenId}`}
              placeholder="e.g., 120.5"
              {...register("weightInGrams")}
            />
            {errors.weightInGrams && (
              <div className="invalid-feedback">
                {errors.weightInGrams.message}
              </div>
            )}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="photo" className="form-label">
            Kitten Photo (Optional)
          </label>
          <input
            type="file"
            className={`form-control ${errors.photoUrl ? "is-invalid" : ""}`}
            id="photo"
            accept="image/*"
            {...register("photoUrl")}
          />
          {errors.photoUrl && (
            <div className="invalid-feedback">{errors.photoUrl.message}</div>
          )}
        </div>

        <div className="mb-2">
          <label htmlFor={`weightNotes-${kittenId}`} className="form-label">
            Notes
          </label>
          <textarea
            className={`form-control form-control-sm ${
              errors.notes ? "is-invalid" : ""
            }`}
            id={`weightNotes-${kittenId}`}
            rows={2}
            {...register("notes")}
          ></textarea>
          {errors.notes && (
            <div className="invalid-feedback">{errors.notes.message}</div>
          )}
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary me-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Weight"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddWeightForm;
