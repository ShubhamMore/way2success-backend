const mongoose = require('mongoose');
const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  courseType: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  }
});

lectureSchema.methods.toJSON = function() {
  const lecture = this;
  const lectureObject = lecture.toObject();

  delete lectureObject.__v;

  return lectureObject;
};

const lecture = mongoose.model('Lecture', lectureSchema);

module.exports = lecture;
