const Course = require('../models/course.model');
const constructStudentBatches = async (course, batch) => {
  const thisCourse = await Course.findOne(
    { _id: course },
    { _id: 0, batch: 1 }
  );
  let batches = new Array();

  thisCourse.batch.forEach(async curBatch => {
    const n = batch.length;
    for (let i = 0; i < n; i++) {
      if (curBatch._id.toString() === batch[i].batch) {
        const batchObj = {
          _id: curBatch._id,
          batch: curBatch.batchName
        };
        const subject = curBatch.subjects;
        const subjects = batch[i].subjects;
        const studentSubjects = new Array();
        const subLen = subject.length;
        const subsLen = subjects.length;
        for (let i = 0; i < subLen; i++) {
          for (let j = 0; j < subsLen; j++) {
            if (subject[i]._id.toString() == subjects[j].toString()) {
              const subObj = {
                _id: subject[i]._id,
                subject: subject[i].subject
              };
              studentSubjects.push(subObj);
            }
          }
        }
        batchObj.subjects = studentSubjects;
        batches.push(batchObj);
      }
    }
  });
  return batches;
};

module.exports = constructStudentBatches;
