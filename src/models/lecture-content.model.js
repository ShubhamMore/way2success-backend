const mongoose = require('mongoose');
const lectureContentSchema = new mongoose.Schema({
  lecture: {
    type: String,
    required: true
  },
  content_name: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  secure_url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    require: true
  },
  created_at: {
    type: String,
    default: Date.now.toString()
  }
});

lectureContentSchema.methods.toJSON = function() {
  const lectureContent = this;
  const lectureContentObject = lectureContent.toObject();

  delete lectureContentObject.__v;

  return lectureContentObject;
};

const lectureContent = mongoose.model('LectureContent', lectureContentSchema);

module.exports = lectureContent;
