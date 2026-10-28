import { Link } from "react-router";
import type { Employee } from "../api/employees";

type Props = { employee: Employee };

export default function EmployeeCard({ employee }: Props) {
  const {
    id,
    firstName,
    lastName,
    email,
    roleName,
    employeeStatus,
    employmentType,
    hoursPerWeek,
    startDate,
  } = employee;

  const statusStyles =
    employeeStatus === "PERMANENT"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : "bg-amber-50 text-amber-700 ring-amber-600/20";

  return (
    <li className="h-full">
      <Link
        to={`/employees/${id}`}
        className="block h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-gray-900">
            {firstName} {lastName}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">{roleName}</p>
        </div>

        <p className="mt-3 truncate text-sm text-gray-600">{email}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ring-1 ring-inset ${statusStyles}`}
          >
            {employeeStatus === "PERMANENT" ? "Permanent" : "Contract"}
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600">
            {employmentType === "FULL_TIME" ? "Full-time" : "Part-time"}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">{hoursPerWeek} hrs/wk</span>
        </div>

        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
          Started{" "}
          {new Date(startDate).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </Link>
    </li>
  );
}
