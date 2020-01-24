const Course = require('../models/course.model');

const findSubjectNames = async (course, batch, subjects) => {
  const thisCourse = await Course.findOne(
    { _id: course },
    { _id: 0, batch: 1 }
  );
  let subject = new Array();

  thisCourse.batch.forEach(curBatch => {
    if (curBatch._id.toString() == batch.toString()) {
      subject = curBatch.subjects;
      return;
    }
  });

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

  return studentSubjects;
};

module.exports = findSubjectNames;
