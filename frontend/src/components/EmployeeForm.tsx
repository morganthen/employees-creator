import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import type { CreateEmployeeInput } from "../api/employees";
import { ApiError } from "../api/errors";
import { getRoles } from "../api/roles";
import {
  EMPTY_EMPLOYEE_FORM,
  employeeFormSchema,
  toFieldErrors,
  toPayload,
  type FormValues,
} from "../lib/employeeSchema";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

type FieldProps = {
  id: keyof FormValues;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

function Field({ id, label, error, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

type EmployeeFormProps = {
  heading: string;
  initialValues?: FormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  apiError?: unknown;
  onSubmit: (payload: CreateEmployeeInput) => void;
};

/**
 * Turns a mutation error into field errors + a banner message. Kept as a pure
 * function so it can run during render instead of in an effect.
 */
function describeApiError(error: unknown): {
  fieldErrors: Record<string, string>;
  formError: string;
} | null {
  if (!error) return null;

  if (error instanceof ApiError && error.details) {
    // 400 from Bean Validation: { field: [messages] }
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(error.details).map(([field, messages]) => [
          field,
          messages[0],
        ]),
      ),
      formError: "Check the highlighted fields.",
    };
  }

  if (error instanceof ApiError && error.status === 409) {
    return {
      fieldErrors: { email: error.message },
      formError: "That email is already in use.",
    };
  }

  return {
    fieldErrors: {},
    formError: error instanceof Error ? error.message : "Something went wrong",
  };
}

/**
 * Shared create/edit form. Validation lives in lib/employeeSchema (zod);
 * this component only wires state, errors and layout.
 */

function EmployeeForm({
  heading,
  initialValues = EMPTY_EMPLOYEE_FORM,
  submitLabel,
  pendingLabel,
  isPending,
  apiError,
  onSubmit,
}: EmployeeFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  // the apiError instance the user has edited away from
  const [dismissedError, setDismissedError] = useState<unknown>(null);

  const roles = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  const serverError =
    apiError && apiError !== dismissedError ? describeApiError(apiError) : null;
  const errors = { ...serverError?.fieldErrors, ...clientErrors };
  const formError = serverError?.formError ?? null;

  const update = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setClientErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setDismissedError(apiError);
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setDismissedError(apiError);

    const result = employeeFormSchema.safeParse(values);
    if (!result.success) {
      setClientErrors(toFieldErrors(result.error));
      return;
    }

    setClientErrors({});
    onSubmit(toPayload(values));
  };

  const aria = (field: keyof FormValues) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
        ← Back to employees
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-gray-900">{heading}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Fields marked <span className="text-red-600">*</span> are required.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {formError && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        <Section title="Personal">
          <Field
            id="firstName"
            label="First name"
            required
            error={errors.firstName}
          >
            <input
              id="firstName"
              className={inputClass}
              value={values.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              {...aria("firstName")}
            />
          </Field>

          <Field id="middleName" label="Middle name" error={errors.middleName}>
            <input
              id="middleName"
              className={inputClass}
              value={values.middleName}
              onChange={(e) => update("middleName", e.target.value)}
            />
          </Field>

          <Field
            id="lastName"
            label="Last name"
            required
            error={errors.lastName}
          >
            <input
              id="lastName"
              className={inputClass}
              value={values.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              {...aria("lastName")}
            />
          </Field>

          <Field id="roleId" label="Role" required error={errors.roleId}>
            <select
              id="roleId"
              className={inputClass}
              value={values.roleId}
              onChange={(e) => update("roleId", e.target.value)}
              disabled={roles.isPending}
              {...aria("roleId")}
            >
              <option value="">
                {roles.isPending
                  ? "Loading roles…"
                  : roles.error
                    ? "Failed to load roles"
                    : "Select a role"}
              </option>
              {roles.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Contact">
          <Field id="email" label="Email" required error={errors.email}>
            <input
              id="email"
              type="email"
              className={inputClass}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              {...aria("email")}
            />
          </Field>

          <Field
            id="mobileNumber"
            label="Mobile"
            required
            error={errors.mobileNumber}
          >
            <input
              id="mobileNumber"
              type="tel"
              placeholder="0412 345 678"
              className={inputClass}
              value={values.mobileNumber}
              onChange={(e) => update("mobileNumber", e.target.value)}
              {...aria("mobileNumber")}
            />
          </Field>
        </Section>

        <Section title="Address">
          <Field
            id="addressLine1"
            label="Address line 1"
            required
            error={errors.addressLine1}
          >
            <input
              id="addressLine1"
              className={inputClass}
              value={values.addressLine1}
              onChange={(e) => update("addressLine1", e.target.value)}
              {...aria("addressLine1")}
            />
          </Field>

          <Field
            id="addressLine2"
            label="Address line 2"
            error={errors.addressLine2}
          >
            <input
              id="addressLine2"
              className={inputClass}
              value={values.addressLine2}
              onChange={(e) => update("addressLine2", e.target.value)}
            />
          </Field>

          <Field id="suburb" label="Suburb" required error={errors.suburb}>
            <input
              id="suburb"
              className={inputClass}
              value={values.suburb}
              onChange={(e) => update("suburb", e.target.value)}
              {...aria("suburb")}
            />
          </Field>

          <Field
            id="postcode"
            label="Postcode"
            required
            error={errors.postcode}
          >
            <input
              id="postcode"
              inputMode="numeric"
              maxLength={4}
              className={inputClass}
              value={values.postcode}
              onChange={(e) => update("postcode", e.target.value)}
              {...aria("postcode")}
            />
          </Field>

          <Field id="state" label="State" required error={errors.state}>
            <select
              id="state"
              className={inputClass}
              value={values.state}
              onChange={(e) => update("state", e.target.value)}
              {...aria("state")}
            >
              <option value="">Select a state</option>
              {AU_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Employment">
          <Field
            id="employeeStatus"
            label="Status"
            required
            error={errors.employeeStatus}
          >
            <select
              id="employeeStatus"
              className={inputClass}
              value={values.employeeStatus}
              onChange={(e) => update("employeeStatus", e.target.value)}
            >
              <option value="PERMANENT">Permanent</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </Field>

          <Field
            id="employmentType"
            label="Employment type"
            required
            error={errors.employmentType}
          >
            <select
              id="employmentType"
              className={inputClass}
              value={values.employmentType}
              onChange={(e) => update("employmentType", e.target.value)}
            >
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
            </select>
          </Field>

          <Field
            id="hoursPerWeek"
            label="Hours per week"
            required
            error={errors.hoursPerWeek}
          >
            <input
              id="hoursPerWeek"
              type="number"
              min={1}
              max={38}
              step="0.5"
              className={inputClass}
              value={values.hoursPerWeek}
              onChange={(e) => update("hoursPerWeek", e.target.value)}
              {...aria("hoursPerWeek")}
            />
          </Field>

          <div />

          <Field
            id="startDate"
            label="Start date"
            required
            error={errors.startDate}
          >
            <input
              id="startDate"
              type="date"
              className={inputClass}
              value={values.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              {...aria("startDate")}
            />
          </Field>

          <Field id="endDate" label="End date" error={errors.endDate}>
            <input
              id="endDate"
              type="date"
              min={values.startDate || undefined}
              className={inputClass}
              value={values.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              {...aria("endDate")}
            />
            <p className="mt-1 text-xs text-gray-400">
              Leave blank for an ongoing employee.
            </p>
          </Field>
        </Section>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
          <Link
            to="/"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? pendingLabel : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;
