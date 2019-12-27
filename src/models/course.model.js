const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    require: true
  },
  courseType: {
    type: String,
    require: true
  },
  branch: {
    type: String,
    require: true
  },
  batch: [
    {
      batchName: {
        type: String,
        require: true
      },
      batch: {
        type: String,
        require: true
      },
      division: {
        type: String,
        require: true
      },
      subjects: [
        {
          subject: {
            type: String,
            require: true
          },
          fee: {
            type: String,
            require: true
          }
        }
      ]
    }
  ],
  status: {
    type: String,
    default: '1'
  }
});

courseSchema.virtual('students', {
  ref: 'Student',
  localField: 'batch._id',
  foreignField: 'batch'
});

courseSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'course'
});

courseSchema.methods.toJSON = function() {
  const course = this;
  const courseObject = course.toObject();

  delete courseObject.__v;

  return courseObject;
};

courseSchema.pre('remove', async function(next) {
  const course = this;
  await Student.deleteMany({ course: course._id });
  next();
});

const course = mongoose.model('Course', courseSchema);

module.exports = course;
