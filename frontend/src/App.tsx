import EmployeeDetails from "./components/EmployeeDetails";
import EmployeeList from "./pages/EmployeeList";
import { Routes, Route } from "react-router";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<EmployeeList />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
      </Routes>
    </div>
  );
}

export default App;
