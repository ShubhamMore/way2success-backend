const prepareStudentTotalFees = async (course, batch) => {
  let totalFee = 0;
  course.batch.forEach(async curBatch => {
    const n = batch.length;
    for (let i = 0; i < n; i++) {
      if (curBatch._id.toString() === batch[i].batch) {
        const subject = curBatch.subjects;
        const subjects = batch[i].subjects;
        const subLen = subject.length;
        const subsLen = subjects.length;
        for (let i = 0; i < subLen; i++) {
          for (let j = 0; j < subsLen; j++) {
            if (subject[i]._id.toString() == subjects[j].toString()) {
              totalFee += parseInt(subject[i].fee);
            }
          }
        }
      }
    }
  });
  return totalFee;
};

module.exports = prepareStudentTotalFees;
