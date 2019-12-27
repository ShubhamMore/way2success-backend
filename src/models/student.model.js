const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  birthDate: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  courseType: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subjects: [mongoose.Schema.Types.ObjectId],
  status: {
    type: String,
    required: true
  }
});

studentSchema.methods.toJSON = function() {
  const student = this;
  const studentObject = student.toObject();

  delete studentObject.__v;

  return studentObject;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
