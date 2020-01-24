const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/course.model');
const Student = require('../models/student.model');
const Exam = require('../models/exam.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const findStudentName = require('../functions/findStudentName');
const findBranchName = require('../functions/findBranchName');
const sortArrayOfObjects = require('../functions/sortArrayOfObjects');

const findExamMarks = (student, marks) => {
  let mark;
  marks.forEach(curMark => {
    if (curMark.student == student) {
      mark = curMark.marks;
      return;
    }
  });
  return mark;
};

const findPassFailStatus = (marks, passingMarks) => {
  if (marks >= passingMarks) {
    return '1';
  }
  return '0';
};

const router = new express.Router();

router.post('/getStudentsForExam', auth, adminAuth, async (req, res) => {
  try {
    // SELECT ALL FROM STUDENTS WHERE COURSE = req.body.course AND BATCH = req.body.batch AND (STATUS = "0" OR STATUS = "1") AND STUDENT.SUBJECTS.includes(req.body.subject)
    const students = await Student.find({
      course: req.body.course,
      $or: [{ status: '0' }, { status: '1' }],
      batches: {
        $all: [
          {
            $elemMatch: {
              batch: req.body.batch,
              subjects: { $all: [req.body.subject] }
            }
          }
        ]
      }
    });

    if (!students) {
      throw new Error('No Student Found');
    }

    res.status(200).send(students);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/saveExam', auth, adminAuth, async (req, res) => {
  try {
    const exam = new Exam(req.body);

    await exam.save();

    res.status(200).send(exam);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getExams', auth, adminAuth, async (req, res) => {
  try {
    const regExp = new RegExp('.*' + req.body.year + '.*');
    const exam = await Exam.find({
      course: req.body.course,
      batch: req.body.batch,
      subject: req.body.subject,
      date: regExp
    });

    res.status(200).send(exam);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getExamsPerformance', auth, async (req, res) => {
  try {
    const date = new RegExp('.*' + req.body.year + '-' + req.body.month + '.*');

    let searchData;

    if (req.body.subject == '0') {
      searchData = {
        date: date,
        marks: {
          $elemMatch: { student: mongoose.Types.ObjectId(req.body.student) }
        }
      };
    } else {
      searchData = {
        date: date,
        subject: req.body.subject,
        marks: {
          $elemMatch: { student: mongoose.Types.ObjectId(req.body.student) }
        }
      };
    }

    const exams = await Exam.find(searchData);

    const examsSend = new Array();

    exams.forEach(curExam => {
      const examObj = {
        title: curExam.examTitle,
        date: curExam.date,
        marks: findExamMarks(req.body.student, curExam.marks)
      };
      examObj.status = findPassFailStatus(examObj.marks, curExam.passingMarks);

      examsSend.push(examObj);
    });

    const exam = sortArrayOfObjects(examsSend, 'date');

    res.status(200).send(exam);
  } catch (e) {
    const err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getExam', auth, adminAuth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.body._id);

    if (!exam) {
      throw new Error('No Exam Found');
    }

    const course = await Course.findById(exam.course);
    const batch = course.batch.find(batch => batch._id == exam.batch);
    const subject = batch.subjects.find(subject => subject._id == exam.subject);

    const students = await findStudentName(exam.marks);

    const examMetaData = {
      branch: await findBranchName(exam.branch),
      course: course.courseName,
      batch: batch.batchName,
      subject: subject.subject,
      students: students
    };

    res.status(200).send({ exam, examMetaData });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/editExam', auth, adminAuth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.body._id, req.body.exam);

    if (!exam) {
      throw new Error('No Exam Found');
    }

    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteExam', auth, adminAuth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndRemove(req.body._id);

    if (!exam) {
      throw new Error('No Exam Found');
    }

    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
