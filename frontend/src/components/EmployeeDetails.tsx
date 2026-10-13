import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { getEmployee } from "../api/employees";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right text-gray-900">{value}</dd>
    </div>
  );
}

function EmployeeDetails() {
  const { id } = useParams();

  const { isPending, data, error } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id!),
  });

  if (isPending) return <p className="p-8 text-gray-500">Loading…</p>;
  if (error) return <p className="p-8 text-red-600">Error: {error.message}</p>;

  const statusStyles =
    data.employeeStatus === "PERMANENT"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : "bg-amber-50 text-amber-700 ring-amber-600/20";

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
        ← Back to employees
      </Link>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-gray-900">
              {data.firstName} {data.middleName ? `${data.middleName} ` : ""}
              {data.lastName}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">{data.roleName}</p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles}`}
          >
            {data.employeeStatus === "PERMANENT" ? "Permanent" : "Contract"}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Contact
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Detail label="Email" value={data.email} />
              <Detail label="Mobile" value={data.mobileNumber} />
            </dl>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Address
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Detail label="Line 1" value={data.addressLine1} />
              {data.addressLine2 && (
                <Detail label="Line 2" value={data.addressLine2} />
              )}
              <Detail label="Suburb" value={data.suburb} />
              <Detail label="State" value={data.state} />
              <Detail label="Postcode" value={data.postcode} />
            </dl>
          </section>

          <section className="sm:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Employment
            </h2>
            <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <Detail label="Role" value={data.roleName} />
              <Detail
                label="Type"
                value={data.employmentType === "FULL_TIME" ? "Full-time" : "Part-time"}
              />
              <Detail label="Hours / week" value={`${data.hoursPerWeek}`} />
              <Detail
                label="Start date"
                value={formatDate(data.startDate)}
              />
              <Detail
                label="End date"
                value={data.endDate ? formatDate(data.endDate) : "Ongoing"}
              />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetails;
