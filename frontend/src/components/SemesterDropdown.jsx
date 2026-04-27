import { SEMESTERS } from "../constants/semesters";

const SemesterDropdown = ({
  label = "Semester",
  name = "semester",
  value,
  onChange,
  required = false
}) => (
  <label>
    {label}
    <select name={name} value={value} onChange={onChange} required={required}>
      <option value="">Select semester</option>
      {SEMESTERS.map((semester) => (
        <option key={semester} value={semester}>
          {semester}
        </option>
      ))}
    </select>
  </label>
);

export default SemesterDropdown;
