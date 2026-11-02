import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/errors";
import EmployeeForm from "./EmployeeForm";

const ROLES = [
  { id: 1, name: "Staff" },
  { id: 2, name: "Manager" },
];

beforeEach(() => {
  // the roles dropdown fetches on mount; a plain object is enough here
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => ROLES })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderForm(
  props: Partial<React.ComponentProps<typeof EmployeeForm>> = {},
) {
  const onSubmit = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EmployeeForm
          heading="Add employee"
          submitLabel="Create employee"
          pendingLabel="Saving…"
          isPending={false}
          onSubmit={onSubmit}
          {...props}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return { onSubmit };
}

type User = ReturnType<typeof userEvent.setup>;

async function fillRequiredFields(user: User) {
  await user.type(screen.getByLabelText(/first name/i), "Jane");
  await user.type(screen.getByLabelText(/last name/i), "Doe");
  await user.type(screen.getByLabelText(/email/i), "jane@example.com");
  await user.type(screen.getByLabelText(/mobile/i), "0412 345 678");
  await user.type(screen.getByLabelText(/address line 1/i), "1 Test St");
  await user.type(screen.getByLabelText(/suburb/i), "Melbourne");
  await user.type(screen.getByLabelText(/postcode/i), "3000");
  await user.selectOptions(screen.getByLabelText(/state/i), "VIC");

  // roles arrive from the query
  await screen.findByRole("option", { name: "Staff" });
  await user.selectOptions(screen.getByLabelText(/^role/i), "1");

  fireEvent.change(screen.getByLabelText(/start date/i), {
    target: { value: "2026-11-02" },
  });
  await user.type(screen.getByLabelText(/hours per week/i), "38");
}

describe("EmployeeForm", () => {
  it("blocks submission and shows field errors when required fields are empty", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.click(screen.getByRole("button", { name: /create employee/i }));

    expect(await screen.findByText("First name is required")).toBeVisible();
    expect(screen.getByText("Email is required")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits numbers and nulls rather than raw input strings", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: /create employee/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Jane",
        middleName: null,
        addressLine2: null,
        endDate: null,
        roleId: 1,
        hoursPerWeek: 38,
        mobileNumber: "412345678",
      }),
    );
  });

  it("puts a 409 from the API on the email field", async () => {
    renderForm({ apiError: new ApiError("Email already in use", 409) });

    expect(await screen.findByText("That email is already in use.")).toBeVisible();
    expect(screen.getByText("Email already in use")).toBeVisible();
  });

  it("places a 400 field detail on the matching input", async () => {
    renderForm({
      apiError: new ApiError("Validation failed", 400, {
        email: ["must be a well-formed email address"],
        hoursPerWeek: ["must be less than or equal to 38"],
      }),
    });

    expect(await screen.findByText("Check the highlighted fields.")).toBeVisible();
    expect(screen.getByText("must be a well-formed email address")).toBeVisible();
    expect(
      screen.getByText("must be less than or equal to 38"),
    ).toBeVisible();
  });

  it("clears a field error once the user edits that field", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /create employee/i }));
    expect(await screen.findByText("First name is required")).toBeVisible();

    await user.type(screen.getByLabelText(/first name/i), "J");

    expect(screen.queryByText("First name is required")).not.toBeInTheDocument();
  });

  it("clears a server rejection once the user starts editing again", async () => {
    const user = userEvent.setup();
    renderForm({ apiError: new ApiError("Email already in use", 409) });

    expect(await screen.findByText("That email is already in use.")).toBeVisible();

    await user.type(screen.getByLabelText(/first name/i), "J");

    expect(
      screen.queryByText("That email is already in use."),
    ).not.toBeInTheDocument();
  });

  it("shows the pending label and disables submit while saving", () => {
    renderForm({ isPending: true });

    const submit = screen.getByRole("button", { name: /saving/i });
    expect(submit).toBeDisabled();
  });
});
