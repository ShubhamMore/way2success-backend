const Student = require('../models/student.model');

const findStudentName = async objects => {
  const studentIds = new Array();

  objects.forEach(object => {
    studentIds.push(object.student);
  });

  const student = await Student.find(
    { _id: { $in: studentIds } },
    { _id: 0, name: 1 }
  );

  return student;
};

module.exports = findStudentName;
