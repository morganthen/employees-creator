import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createEmployee, type CreateEmployeeInput } from "../api/employees";
import EmployeeForm from "../components/EmployeeForm";

function CreateEmployee() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createEmployee,
    onSuccess: (employee) => {
      queryClient.setQueryData(["employee", String(employee.id)], employee);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      navigate(`/employees/${employee.id}`);
    },
  });

  return (
    <EmployeeForm
      heading="Add employee"
      submitLabel="Create employee"
      pendingLabel="Saving…"
      isPending={create.isPending}
      apiError={create.error}
      onSubmit={(payload: CreateEmployeeInput) => create.mutate(payload)}
    />
  );
}

export default CreateEmployee;
