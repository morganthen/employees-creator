import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { getEmployees } from "../api/employees";
import EmployeeCard from "../components/EmployeeCard";

function EmployeeList() {
  const { isPending, error, data } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  if (isPending) return <div className="p-8 text-gray-500">Loading…</div>;
  if (error)
    return <div className="p-8 text-red-600">Error: {error.message}</div>;
  if (data.length === 0)
    return (
      <div className="p-8 text-gray-500">
        <p>No employees yet.</p>
        <Link
          to="/employees/new"
          className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add employee
        </Link>
      </div>
    );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
        <Link
          to="/employees/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add employee
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </ul>
    </div>
  );
}

export default EmployeeList;
