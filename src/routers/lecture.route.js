const express = require('express');
const LectureContent = require('../models/lecture-content.model');
const Lecture = require('../models/lecture.model');
const Branch = require('../models/branch.model');
const Course = require('../models/course.model');
const awsRemoveFile = require('../uploads/awsRemoveFile');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const router = new express.Router();

router.post('/newLecture', auth, adminAuth, async (req, res) => {
  try {
    const lecture = new Lecture(req.body);
    await lecture.save();

    const data = {
      lecture: lecture._id,
      success: true
    };
    res.status(201).send(data);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getLecture', auth, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.body._id);
    if (!lecture) {
      throw new Error('No lecture Found');
    }

    res.status(200).send(lecture);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getLecturesForStudent', auth, async (req, res) => {
  try {
    const date = new RegExp('.*' + req.body.date + '.*');

    const lecture = await Lecture.find({
      course: req.body.course,
      batch: req.body.batch,
      subject: req.body.subject,
      startTime: date
    });

    res.status(200).send(lecture);
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No lecture Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getLectureForEditing', auth, adminAuth, async (req, res) => {
  try {
    const branches = await Branch.find();

    if (branches.length < 1) {
      throw new Error('No Branch Found');
    }

    const courses = await Course.find();

    if (courses.length < 1) {
      throw new Error('No Course Found');
    }

    const lecture = await Lecture.findById(req.body._id);
    if (!lecture) {
      throw new Error('No lecture Found');
    }

    res.status(200).send({ lecture, branches, courses });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getLectures', auth, async (req, res) => {
  try {
    const lectures = await Lecture.find({
      branch: req.body.branch,
      course: req.body.course,
      batch: req.body.batch,
      subject: req.body.subject
    });

    res.status(200).send(lectures);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/editLecture', auth, adminAuth, async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndUpdate(req.body._id, req.body);

    if (!lecture) {
      throw new Error('Lecture Updation Failed');
    }

    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteLecture', auth, async (req, res) => {
  try {
    const lecture = await Lecture.findByIdAndDelete(req.body._id);
    if (!lecture) {
      throw new Error('No Lecture Found');
    }
    const lectureContents = await LectureContent.find({
      lecture: lecture._id
    });
    await LectureContent.deleteMany({ lecture: lecture._id });

    const n = lectureContents.length;
    for (let i = 0; i < n; i++) {
      const lectureContentToDelete = lectureContents[i].public_id;
      await awsRemoveFile(lectureContentToDelete);
    }
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
