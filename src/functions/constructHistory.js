const Course = require('../models/course.model');

const constructHistory = async courses => {
  const course = await Course.find();

  const courseArr = new Array();
  courses.forEach(curcourseHistory => {
    let courseObj = {};
    const thiscourse = course.find(
      curcourse => curcourseHistory.course == curcourse._id
    );
    courseObj._id = thiscourse._id;
    courseObj.course = thiscourse.courseName;

    const batchArr = new Array();
    curcourseHistory.batches.forEach(curBatchHistory => {
      let batchObj = {};
      const thisBatch = thiscourse.batch.find(
        curBatch => curBatchHistory.batch == curBatch._id
      );
      batchObj._id = thisBatch._id;
      batchObj.batch = thisBatch.batchName;

      const subjectArr = new Array();
      curBatchHistory.subjects.forEach(curSubjectHistory => {
        let subjectObj = {};
        const thisSubject = thisBatch.subjects.find(
          curSubject => curSubjectHistory == curSubject._id
        );
        subjectObj._id = thisSubject._id;
        subjectObj.subject = thisSubject.subject;
        subjectArr.push(subjectObj);
      });

      batchObj.subjects = subjectArr;
      batchArr.push(batchObj);
    });

    courseObj.batches = batchArr;
    courseArr.push(courseObj);
  });

  return courseArr;
};

module.exports = constructHistory;
