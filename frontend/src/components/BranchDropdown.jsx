import { BRANCHES } from "../constants/branches";

const BranchDropdown = ({ label = "Branch", name = "branch", value, onChange, required = false }) => (
  <label>
    {label}
    <select name={name} value={value} onChange={onChange} required={required}>
      <option value="">Select branch</option>
      {BRANCHES.map((branch) => (
        <option key={branch} value={branch}>
          {branch}
        </option>
      ))}
    </select>
  </label>
);

export default BranchDropdown;
