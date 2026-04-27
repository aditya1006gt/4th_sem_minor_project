const BRANCHES = ["CSE", "ECE", "EE", "ECM", "PIE", "META", "CIVIL"];

const isValidBranch = (branch) => BRANCHES.includes(branch);

module.exports = {
  BRANCHES,
  isValidBranch
};
