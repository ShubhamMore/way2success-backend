const express = require('express');
const Attendance = require('../models/attendance.model');
const Student = require('../models/student.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const findStudentName = require('../functions/findStudentName');
const sortArrayOfObjects = require('../functions/sortArrayOfObjects');
const mongoose = require('mongoose');

const findAttendanceStatus = (student, attendance) => {
  let status;

  attendance.forEach(atten => {
    if (atten.student == student) {
      status = atten.attendanceStatus;
      return;
    }
  });

  return status;
};

const router = new express.Router();

router.post('/getStudentsForAttendance', auth, adminAuth, async (req, res) => {
  try {
    let attendance = await Attendance.findOne({
      date: req.body.date,
      course: req.body.course,
      batch: req.body.batch,
      subject: req.body.subject
    });

    if (attendance) {
      let prepareArrendance = new Array();
      const students = await findStudentName(attendance.attendance);
      const len = students.length;
      for (let i = 0; i < len; i++) {
        const atten = {
          _id: attendance.attendance[i]._id,
          student: students[i].name,
          attendanceStatus: attendance.attendance[i].attendanceStatus
        };
        prepareArrendance.push(atten);
      }

      res.status(200).send({ atten: true, attendance: prepareArrendance });
      return;
    }

    // SELECT ALL FROM STUDENTS WHERE COURSE = req.body.course AND BATCH = req.body.batch AND (STATUS = "0" OR STATUS = "1") AND STUDENT.SUBJECTS.includes(req.body.subject)
    const students = await Student.find(
      {
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
      },
      { _id: 1, name: 1 }
    );

    res.status(200).send(students);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/saveAttendance', auth, adminAuth, async (req, res) => {
  try {
    const attendance = new Attendance(req.body);

    await attendance.save();

    res.status(200).send(attendance);
  } catch (e) {
    const err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getAttendance', auth, async (req, res) => {
  try {
    const date = new RegExp('.*' + req.body.year + '-' + req.body.month + '.*');

    let searchData;

    if (req.body.subject == '0') {
      searchData = {
        date: date,
        attendance: {
          $all: [
            {
              $elemMatch: { student: mongoose.Types.ObjectId(req.body.student) }
            }
          ]
        }
      };
    } else {
      searchData = {
        date: date,
        subject: req.body.subject,
        attendance: {
          $all: [
            {
              $elemMatch: { student: mongoose.Types.ObjectId(req.body.student) }
            }
          ]
        }
      };
    }

    const attendance = await Attendance.find(searchData);

    const attendanceSend = new Array();

    attendance.forEach(atten => {
      const attenObj = {
        date: atten.date,
        attendanceStatus: findAttendanceStatus(
          req.body.student,
          atten.attendance
        )
      };
      attendanceSend.push(attenObj);
    });

    const atten = sortArrayOfObjects(attendanceSend, 'date');

    res.status(200).send(atten);
  } catch (e) {
    const err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
