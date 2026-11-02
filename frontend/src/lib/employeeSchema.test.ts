import { describe, expect, it } from "vitest";
import type { Employee } from "../api/employees";
import {
  EMPTY_EMPLOYEE_FORM,
  employeeFormSchema,
  toFieldErrors,
  toFormValues,
  toPayload,
} from "./employeeSchema";

const validForm = {
  ...EMPTY_EMPLOYEE_FORM,
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  mobileNumber: "0412 345 678",
  addressLine1: "1 Test St",
  suburb: "Melbourne",
  state: "VIC",
  postcode: "3000",
  roleId: "1",
  startDate: "2026-11-02",
  hoursPerWeek: "38",
};

const parse = (overrides: Partial<typeof validForm> = {}) =>
  employeeFormSchema.safeParse({ ...validForm, ...overrides });

const errorsFor = (overrides: Partial<typeof validForm> = {}) => {
  const result = parse(overrides);
  return result.success ? {} : toFieldErrors(result.error);
};

describe("employeeFormSchema", () => {
  it("accepts a complete form", () => {
    expect(parse().success).toBe(true);
  });

  it("requires the mandatory fields", () => {
    const errors = errorsFor({
      firstName: "",
      lastName: " ",
      email: "",
      mobileNumber: "",
      addressLine1: "",
      suburb: "",
      state: "",
      postcode: "",
      roleId: "",
      startDate: "",
      hoursPerWeek: "",
    });

    expect(errors).toMatchObject({
      firstName: "First name is required",
      lastName: "Last name is required",
      email: "Email is required",
      mobileNumber: "Mobile number is required",
      addressLine1: "Address line 1 is required",
      suburb: "Suburb is required",
      state: "State is required",
      postcode: "Postcode is required",
      roleId: "Role is required",
      startDate: "Start date is required",
      hoursPerWeek: "Hours per week is required",
    });
  });

  it("reports the required message, not the format message, for a blank email", () => {
    // .pipe() does not short-circuit, so both issues fire; toFieldErrors keeps the first
    expect(errorsFor({ email: "" }).email).toBe("Email is required");
  });

  it("rejects a malformed email", () => {
    expect(errorsFor({ email: "not-an-email" }).email).toBe(
      "Enter a valid email address",
    );
  });

  it("accepts spaces in the mobile number but strips them from the parsed value", () => {
    const result = parse({ mobileNumber: "0412 345 678" });

    expect(result.success).toBe(true);
    expect(result.success && result.data.mobileNumber).toBe("412345678");
  });

  it.each(["0412 345 678", "+61 412 345 678", "61412345678", "412345678"])(
    "accepts the stored/entered form %s",
    (mobileNumber) => {
      expect(parse({ mobileNumber }).success).toBe(true);
    },
  );

  it.each(["123", "041234567", "0612345678", "0512345678"])(
    "rejects the mobile number %s",
    (mobileNumber) => {
      expect(errorsFor({ mobileNumber }).mobileNumber).toBe(
        "Use an Australian mobile, e.g. 0412 345 678",
      );
    },
  );

  it("keeps the hours per week between 1 and 38", () => {
    expect(errorsFor({ hoursPerWeek: "0" }).hoursPerWeek).toBe(
      "Hours must be between 1 and 38",
    );
    expect(errorsFor({ hoursPerWeek: "39" }).hoursPerWeek).toBe(
      "Hours must be between 1 and 38",
    );
    expect(errorsFor({ hoursPerWeek: "abc" }).hoursPerWeek).toBe(
      "Hours must be between 1 and 38",
    );
    expect(parse({ hoursPerWeek: "37.5" }).success).toBe(true);
  });

  it("rejects a 3-digit postcode", () => {
    expect(errorsFor({ postcode: "300" }).postcode).toBe(
      "Postcode must be 4 digits",
    );
  });

  it("requires the end date to be on or after the start date", () => {
    expect(
      errorsFor({ startDate: "2026-11-02", endDate: "2026-11-01" }).endDate,
    ).toBe("End date must be on or after the start date");

    expect(
      parse({ startDate: "2026-11-02", endDate: "2026-11-02" }).success,
    ).toBe(true);
  });

  it("does not require an end date", () => {
    const errors = errorsFor({ endDate: "" });
    expect(errors.endDate).toBeUndefined();
  });
});

describe("toPayload", () => {
  it("converts numbers and sends null for blank optional fields", () => {
    expect(toPayload(validForm)).toEqual({
      firstName: "Jane",
      middleName: null,
      lastName: "Doe",
      email: "jane@example.com",
      mobileNumber: "412345678",
      addressLine1: "1 Test St",
      addressLine2: null,
      suburb: "Melbourne",
      state: "VIC",
      postcode: "3000",
      roleId: 1,
      employeeStatus: "PERMANENT",
      startDate: "2026-11-02",
      endDate: null,
      employmentType: "FULL_TIME",
      hoursPerWeek: 38,
    });
  });

  it("trims text fields", () => {
    const payload = toPayload({
      ...validForm,
      firstName: "  Jane  ",
      middleName: "  Q  ",
      addressLine1: "  1 Test St ",
    });

    expect(payload.firstName).toBe("Jane");
    expect(payload.middleName).toBe("Q");
    expect(payload.addressLine1).toBe("1 Test St");
  });
});

describe("toFormValues", () => {
  it("round-trips an employee record into form values", () => {
    const employee: Employee = {
      id: 7,
      firstName: "Jane",
      middleName: null,
      lastName: "Doe",
      email: "jane@example.com",
      mobileNumber: "+61412345678",
      addressLine1: "1 Test St",
      addressLine2: null,
      suburb: "Melbourne",
      state: "VIC",
      postcode: "3000",
      roleId: 1,
      roleName: "Staff",
      employeeStatus: "PERMANENT",
      startDate: "2026-01-15",
      endDate: null,
      employmentType: "FULL_TIME",
      hoursPerWeek: 38,
      archivedAt: null,
      createdAt: "2026-01-15T09:00:00",
      updatedAt: "2026-01-15T09:00:00",
    };

    expect(toFormValues(employee)).toMatchObject({
      middleName: "",
      addressLine2: "",
      roleId: "1",
      startDate: "2026-01-15",
      endDate: "",
      hoursPerWeek: "38",
    });

    // the prefilled values must pass the same schema the create form uses
    expect(employeeFormSchema.safeParse(toFormValues(employee)).success).toBe(
      true,
    );
  });
});
