import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import {
  getEmployee,
  updateEmployee,
  type CreateEmployeeInput,
} from "../api/employees";
import EmployeeForm from "../components/EmployeeForm";
import { toFormValues } from "../lib/employeeSchema";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const employee = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id!),
    enabled: Boolean(id),
  });

  const update = useMutation({
    mutationFn: (input: CreateEmployeeInput) => updateEmployee(id!, input),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      navigate(`/employees/${saved.id}`);
    },
  });

  if (employee.isPending) return <p className="p-8 text-gray-500">Loading…</p>;
  if (employee.error)
    return <p className="p-8 text-red-600">Error: {employee.error.message}</p>;

  return (
    <EmployeeForm
      key={employee.data.id}
      heading={`Edit ${employee.data.firstName} ${employee.data.lastName}`}
      initialValues={toFormValues(employee.data)}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      isPending={update.isPending}
      apiError={update.error}
      onSubmit={(payload) => update.mutate(payload)}
    />
  );
}

export default EditEmployee;
