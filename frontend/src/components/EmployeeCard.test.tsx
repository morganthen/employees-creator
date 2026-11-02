import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Employee } from "../api/employees";
import { archiveEmployee } from "../api/employees";
import EmployeeCard from "./EmployeeCard";

vi.mock("../api/employees", () => ({
  archiveEmployee: vi.fn(),
}));

const employee: Employee = {
  id: 1,
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

function renderCard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EmployeeCard employee={employee} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function openArchiveDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /employee actions/i }));
  await user.click(screen.getByRole("menuitem", { name: "Archive" }));
}

beforeEach(() => {
  vi.mocked(archiveEmployee).mockReset();
  vi.mocked(archiveEmployee).mockResolvedValue(undefined);
});

describe("EmployeeCard", () => {
  it("renders the employee's key details", () => {
    renderCard();

    expect(screen.getByText("Jane Doe")).toBeVisible();
    expect(screen.getByText("jane@example.com")).toBeVisible();
    expect(screen.getByText("Staff")).toBeVisible();
    expect(screen.getByText("Permanent")).toBeVisible();
  });

  it("asks before archiving and does nothing if the dialog is cancelled", async () => {
    const user = userEvent.setup();
    renderCard();

    await openArchiveDialog(user);
    expect(screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(archiveEmployee).not.toHaveBeenCalled();
  });

  it("archives once, and only after confirmation", async () => {
    const user = userEvent.setup();
    renderCard();

    await openArchiveDialog(user);
    expect(archiveEmployee).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Archive" }));

    await waitFor(() => expect(archiveEmployee).toHaveBeenCalledTimes(1));
    expect(archiveEmployee).toHaveBeenCalledWith("1");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("shows a pending state while the archive request is in flight", async () => {
    const user = userEvent.setup();
    let resolveArchive: () => void = () => {};
    vi.mocked(archiveEmployee).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveArchive = resolve;
        }),
    );

    renderCard();
    await openArchiveDialog(user);
    await user.click(screen.getByRole("button", { name: "Archive" }));

    expect(
      await screen.findByRole("button", { name: "Archiving…" }),
    ).toBeDisabled();

    resolveArchive();

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
