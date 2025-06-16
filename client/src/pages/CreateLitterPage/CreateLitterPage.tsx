// src/pages/CreateLitterPage.tsx
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createLitter } from "../../services/LitterService";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { catBreeds } from "./Scripts/Template";
import { LoadingButton } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs"; // <-- Add this import
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import {
  Alert,
  Box,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Litter name is required")
    .max(50, "Max length is 50")
    .matches(/^[a-zA-Z0-9\s]+$/, "Name must be alphanumeric."),
  motherName: yup
    .string()
    .required("Mother's name is required")
    .max(50, "Max length is 50")
    .matches(/^[a-zA-Z0-9\s]+$/, "Name must be alphanumeric."),
  dateOfBirth: yup
    .date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future.")
    .typeError("A valid date is required."),
  breed: yup
    .string()
    .required("Predominant breed is required.")
    .max(50, "Max length is 50"),
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
          .max(20, "Max length is 50"),
      otherwise: (schema) => schema,
    }),
  notes: yup
    .string()
    .default("")
    .max(200, "Max length is 200")
    .matches(
      /^[a-zA-Z0-9\s.,!?-]*$/,
      "Notes can only contain letters, numbers, and common punctuation."
    ),
});

type LitterFormData = yup.InferType<typeof validationSchema>;

const CreateLitterPage: React.FC = () => {
  const {
    control,
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create New Litter
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              fullWidth
              id="name"
              label="Litter Name*"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              id="motherName"
              label="Mother's Name*"
              {...register("motherName")}
              error={!!errors.motherName}
              helperText={errors.motherName?.message}
            />
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Date of Birth*"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue: Dayjs | null) =>
                    field.onChange(newValue ? newValue.toDate() : null)
                  }
                  sx={{ width: "100%", mt: 2, mb: 1 }}
                  slotProps={{
                    textField: {
                      error: !!errors.dateOfBirth,
                      helperText: errors.dateOfBirth?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="breed"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.breed}>
                  <InputLabel id="breed-label">Predominant Breed*</InputLabel>
                  <Select
                    labelId="breed-label"
                    id="breed"
                    label="Predominant Breed*"
                    {...field}
                  >
                    <MenuItem value="">
                      <em>Select a breed</em>
                    </MenuItem>
                    {catBreeds.map((breed) => (
                      <MenuItem key={breed} value={breed}>
                        {breed}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.breed && (
                    <FormHelperText>{errors.breed.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {selectedBreed === "Other" && (
              <TextField
                margin="normal"
                fullWidth
                id="otherBreed"
                label="Please Specify Breed*"
                {...register("otherBreed")}
                error={!!errors.otherBreed}
                helperText={errors.otherBreed?.message}
              />
            )}

            <TextField
              margin="normal"
              fullWidth
              id="notes"
              label="Notes"
              multiline
              rows={4}
              {...register("notes")}
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />

            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Create Litter
            </LoadingButton>

            {submitMessage && (
              <Alert
                severity={
                  submitMessage.startsWith("Error:") ? "error" : "success"
                }
                sx={{ mt: 2 }}
              >
                {submitMessage}
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateLitterPage;
