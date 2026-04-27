const SEMESTERS = [
  "Sem 1",
  "Sem 2",
  "Sem 3",
  "Sem 4",
  "Sem 5",
  "Sem 6",
  "Sem 7",
  "Sem 8"
];

const isValidSemester = (semester) => SEMESTERS.includes(semester);

module.exports = {
  SEMESTERS,
  isValidSemester
};
