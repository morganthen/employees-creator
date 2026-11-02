import { z } from "zod";
import type { CreateEmployeeInput, Employee } from "../api/employees";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const;

const required = (label: string) => z.string().trim().min(1, `${label} is required`);

/**
 * Canonical local form of an AU mobile: digits only, no `+61`/`61` country
 * prefix and no trunk `0`. The backend re-normalises to `+61...` for storage.
 */
export function normalizeMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("61")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/**
 * Validates the *form* shape: every field is a string because that's what
 * inputs produce. Mirrors the constraints on the backend's EmployeeRequest,
 * so the user gets feedback before a round trip. The server stays the
 * source of truth (it re-validates and owns rules like email uniqueness).
 */
export const employeeFormSchema = z
  .object({
    firstName: required("First name"),
    middleName: z.string().trim(),
    lastName: required("Last name"),
    email: required("Email").pipe(z.email("Enter a valid email address")),
    mobileNumber: required("Mobile number")
      .transform(normalizeMobile)
      .pipe(
        z
          .string()
          .regex(/^4\d{8}$/, "Use an Australian mobile, e.g. 0412 345 678"),
      ),
    addressLine1: required("Address line 1"),
    addressLine2: z.string().trim(),
    suburb: required("Suburb"),
    state: required("State").pipe(z.enum(AU_STATES)),
    postcode: required("Postcode").pipe(
      z.string().regex(/^\d{4}$/, "Postcode must be 4 digits"),
    ),
    roleId: required("Role"),
    employeeStatus: required("Status").pipe(
      z.enum(["PERMANENT", "CONTRACT"]),
    ),
    startDate: required("Start date"),
    endDate: z.string(),
    employmentType: required("Employment type").pipe(
      z.enum(["FULL_TIME", "PART_TIME"]),
    ),
    hoursPerWeek: required("Hours per week").refine((value) => {
      const hours = Number(value);
      return !Number.isNaN(hours) && hours >= 1 && hours <= 38;
    }, "Hours must be between 1 and 38"),
  })
  .superRefine((values, ctx) => {
    // cross-field rule the backend also enforces (422)
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be on or after the start date",
      });
    }
  });

export type FormValues = z.input<typeof employeeFormSchema>;

export const EMPTY_EMPLOYEE_FORM: FormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  addressLine1: "",
  addressLine2: "",
  suburb: "",
  state: "",
  postcode: "",
  roleId: "",
  employeeStatus: "PERMANENT",
  startDate: "",
  endDate: "",
  employmentType: "FULL_TIME",
  hoursPerWeek: "",
};

/** Maps zod issues to one message per field, keyed by the backend's field names. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

/** API record -> form values, for the edit page. */
export function toFormValues(employee: Employee): FormValues {
  return {
    firstName: employee.firstName,
    middleName: employee.middleName ?? "",
    lastName: employee.lastName,
    email: employee.email,
    mobileNumber: employee.mobileNumber,
    addressLine1: employee.addressLine1,
    addressLine2: employee.addressLine2 ?? "",
    suburb: employee.suburb,
    state: employee.state,
    postcode: employee.postcode,
    roleId: String(employee.roleId),
    employeeStatus: employee.employeeStatus,
    startDate: employee.startDate,
    endDate: employee.endDate ?? "",
    employmentType: employee.employmentType,
    hoursPerWeek: String(employee.hoursPerWeek),
  };
}

/** Validated form values -> request body. Blank optional fields become null. */
export function toPayload(values: FormValues): CreateEmployeeInput {
  const optional = (value: string) => (value.trim() ? value.trim() : null);

  return {
    firstName: values.firstName.trim(),
    middleName: optional(values.middleName),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    mobileNumber: normalizeMobile(values.mobileNumber),
    addressLine1: values.addressLine1.trim(),
    addressLine2: optional(values.addressLine2),
    suburb: values.suburb.trim(),
    state: values.state,
    postcode: values.postcode.trim(),
    roleId: Number(values.roleId),
    employeeStatus: values.employeeStatus as CreateEmployeeInput["employeeStatus"],
    startDate: values.startDate,
    endDate: optional(values.endDate),
    employmentType:
      values.employmentType as CreateEmployeeInput["employmentType"],
    hoursPerWeek: Number(values.hoursPerWeek),
  };
}
