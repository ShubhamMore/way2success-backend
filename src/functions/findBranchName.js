const Branch = require("../models/branch.model");

const findBranchName = async(branch) => {
    const branches = await Branch.find();
    let branchName;
    branches.forEach(curBranch => {
        if(curBranch._id.toString() === branch.toString()) {
            branchName = curBranch.branchName;
        }
    });
    return branchName;
}

module.exports = findBranchName;