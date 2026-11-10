import { toApiError } from "./errors";

export type Employee = {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  suburb: string;
  state: string;
  postcode: string;
  roleId: number;
  roleName: string;
  employeeStatus: "PERMANENT" | "CONTRACT";
  startDate: string;
  endDate: string | null;
  employmentType: "FULL_TIME" | "PART_TIME";
  hoursPerWeek: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeeInput = {
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  suburb: string;
  state: string;
  postcode: string;
  roleId: number;
  employeeStatus: Employee["employeeStatus"];
  startDate: string;
  endDate: string | null;
  employmentType: Employee["employmentType"];
  hoursPerWeek: number;
};

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch("/api/employees");
  if (!res.ok) {
    throw await toApiError(res, "Failed to fetch employees");
  }
  const data = await res.json();
  return data;
}

export async function getEmployee(id: string): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`);
  if (!res.ok) {
    throw await toApiError(res, "Failed to load employee");
  }
  return res.json();
}

export async function archiveEmployee(id: string): Promise<void> {
  const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw await toApiError(res, "Failed to archive employee");
  }
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Employee> {
  const res = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw await toApiError(res, "Failed to create employee");
  }

  return res.json();
}

export async function updateEmployee(
  id: string,
  input: CreateEmployeeInput,
): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw await toApiError(res, "Failed to update employee");
  }

  return res.json();
}
