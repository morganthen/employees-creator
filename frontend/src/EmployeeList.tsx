import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "./api/employees";
import EmployeeCard from "./components/EmployeeCard";

function EmployeeList() {
  const { isPending, error, data } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  if (isPending) return <div className="p-8 text-gray-500">Loading…</div>;
  if (error)
    return <div className="p-8 text-red-600">Error: {error.message}</div>;
  if (data.length === 0)
    return <div className="p-8 text-gray-500">No employees yet.</div>;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Employees</h1>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </ul>
    </div>
  );
}

export default EmployeeList;
