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

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch("/api/employees");
  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }
  const data = await res.json();
  return data;
}

export async function getEmployee(id: string): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to load employee");
  }
  return res.json();
}
