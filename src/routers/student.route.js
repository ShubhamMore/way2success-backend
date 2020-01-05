const express = require('express');
const Student = require('../models/student.model');
const Branch = require('../models/branch.model');
const Course = require('../models/course.model');
const History = require('../models/history.model');
const User = require('../models/user.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const findSubjectNames = require('../functions/findSubjectNames');
const findBranchName = require('../functions/findBranchName');
const constructHistory = require('../functions/constructHistory');
const mongoose = require('mongoose');
const sendMail = require('../email/mail');
const router = new express.Router();

router.post('/newStudent', auth, adminAuth, async (req, res) => {
  try {
    if (student.status === '1') {
      const newUser = {
        name: req.body.name.toLowerCase(),
        email: req.body.email,
        password: req.body.password,
        userType: 'student'
      };
      const user = new User(newUser);
      await user.save();
    }

    const newStudent = {
      name: req.body.name.toLowerCase(),
      birthDate: req.body.birthDate,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      branch: req.body.branch,
      courseType: req.body.courseType,
      course: req.body.course,
      batch: req.body.batch,
      subjects: req.body.subjects,
      status: req.body.status
    };
    const student = new Student(newStudent);
    await student.save();

    if (student.status === '1') {
      const mail = {
        to: student.email,
        from: process.env.EMAIL,
        subject: 'Your login details for way2success.education',
        text: '',
        html: `
                  <h2>Welcome to Way2Success <em>${student.name}</em></h2><br>
                  <p>Your Login Credentials are : </p><br>
                  <strong>Username : </strong> ${student.email}
                  <strong>password : </strong> ${student.phone}<br>
                  <p>Click the following link for login..</p>
                  <a href="http://www.way2success.education/#/login">http://www.way2success.education/</a>
              `
      };

      await sendMail(mail);
    }

    const newHistory = {
      student: student._id,
      branch: student.branch,
      history: [
        {
          course: student.course,
          courseType: student.courseType,
          batches: [
            {
              batch: student.batch,
              subjects: student.subjects
            }
          ]
        }
      ]
    };
    const history = new History(newHistory);
    await history.save();

    const data = {
      success: true
    };
    res.status(201).send(data);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudents', auth, adminAuth, async (req, res) => {
  try {
    let searchData;
    if (req.body.searchType == '0') {
      searchData = {
        branch: req.body.branch,
        courseType: req.body.courseType,
        course: req.body.course,
        batch: req.body.batch,
        subjects: { $all: [{ _id: req.body.subject }] }
      };
    } else if (req.body.searchType == '1') {
      searchData = {
        branch: req.body.branch,
        courseType: req.body.courseType,
        course: req.body.course,
        batch: req.body.batch
      };
    } else if (req.body.searchType == '2') {
      searchData = {
        branch: req.body.branch,
        courseType: req.body.courseType,
        course: req.body.course
      };
    } else if (req.body.searchType == '3') {
      const student = new RegExp('.*' + req.body.student + '.*');
      searchData = {
        branch: req.body.branch,
        courseType: req.body.courseType,
        name: student
      };
    } else {
      searchData = {};
    }

    if (req.body.studentType === '0') {
      searchData.$or = [{ status: '0' }, { status: '1' }];
    } else if (req.body.studentType === '1') {
      searchData.status = '2';
    }

    const students = await Student.find(searchData);
    if (!students) {
      throw new Error('No Student Found');
    }
    res.status(200).send(students);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudent', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.body._id);
    if (!student) {
      throw new Error('No Student Found');
    }

    const course = await Course.findById(student.course);
    const batch = course.batch.find(batch => batch._id.equals(student.batch));
    const subject = new Array();
    batch.subjects.find(curSubject => {
      if (student.subjects.includes(curSubject._id)) {
        const subObj = {
          _id: curSubject._id,
          subject: curSubject.subject
        };
        subject.push(subObj);
      }
    });

    const studentMetaData = {
      branch: await findBranchName(student.branch),
      course: course.courseName,
      batch: batch.batchName,
      subject
    };

    res.status(200).send({ student, studentMetaData });
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No course Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/changeStudentStatus', auth, adminAuth, async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.body._id },
      {
        status: req.body.status
      }
    );

    if (!student) {
      throw new Error('No Student Found');
    }

    if (req.body.status === '0') {
      const user = await User.findOneAndRemove({
        email: student.email,
        userType: 'student'
      });
      if (!user) {
        throw new Error('Deactivation Failed, User Not Found');
      }
    } else if (req.body.status === '1') {
      const newUser = {
        name: student.name.toLowerCase(),
        email: student.email,
        password: req.body.password,
        userType: 'student'
      };
      const user = new User(newUser);
      await user.save();
    }

    const mail = {
      to: student.email,
      from: process.env.EMAIL,
      subject:
        req.body.status === '0'
          ? 'Your way2success account is Deactivated'
          : 'Your way2success account is Activated',
      text: '',
      html:
        req.body.status === '0'
          ? `<h2>Thank You for using Way2Success <em>${student.name}</em></h2><br>
          <p>Your Login Credentials are deactivated by admin </p>`
          : `
                <h2>Welcome again to Way2Success <em>${student.name}</em></h2><br>
                <p>Your Login Credentials are : </p><br>
                <strong>Username : </strong> ${student.email}
                <strong>password : </strong> ${student.phone}<br>
                <p>Click the following link for login..</p>
                <a href="http://www.way2success.education/#/login">http://www.way2success.education/</a>
            `
    };

    await sendMail(mail);

    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No course Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudentForPayment', auth, adminAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.body._id);
    if (!student) {
      throw new Error('No Student Found');
    }

    const course = await Course.findById(student.course);
    const batch = course.batch.find(batch => batch._id.equals(student.batch));
    const subjects = new Array();
    let totalFees = 0;
    batch.subjects.find(curSubject => {
      if (student.subjects.includes(curSubject._id)) {
        subjects.push(curSubject.subject);
        totalFees += parseInt(curSubject.fee);
      }
    });

    const studentMetaData = {
      branch: await findBranchName(student.branch),
      course: course.courseName,
      batch: batch.batchName,
      subjects,
      totalFees
    };

    res.status(200).send({ student, studentMetaData });
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No course Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudentHistory', auth, async (req, res) => {
  try {
    const history = await History.findOne({
      student: mongoose.Types.ObjectId(req.body.student)
    });
    if (!history) {
      throw new Error('No Student History Found');
    }

    const studentHistory = await constructHistory(history.history);

    const branch = {
      branch: history.branch,
      branchName: await findBranchName(history.branch)
    };

    const courseTypeArr = new Array();
    studentHistory.forEach(curHistory => {
      if (!courseTypeArr.includes(curHistory.courseType)) {
        courseTypeArr.push(curHistory.courseType);
      }
    });

    res
      .status(200)
      .send({ branch, history: studentHistory, courseType: courseTypeArr });
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No course Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudentForEditing', auth, adminAuth, async (req, res) => {
  try {
    const branches = await Branch.find();
    if (branches.length < 1) {
      throw new Error('No Branch Found');
    }

    const courses = await Course.find();

    if (courses.length < 1) {
      throw new Error('No Course Found');
    }

    const student = await Student.findById(req.body._id);
    if (!student) {
      throw new Error('No Student Found');
    }

    res.status(200).send({ student, courses, branches });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudentDataForLecture', auth, async (req, res) => {
  try {
    const student = await Student.findOne(
      { _id: req.body._id },
      { _id: 0, course: 1, batch: 1, subjects: 1 }
    );

    const subjects = await findSubjectNames(
      student.course,
      student.batch,
      student.subjects
    );

    const studentData = {
      course: student.course,
      batch: student.batch,
      subjects: subjects
    };
    res.status(200).send(studentData);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudentDataForMedia', auth, async (req, res) => {
  try {
    const student = await Student.findOne(
      { _id: req.body._id },
      { _id: 0, course: 1, batch: 1, subjects: 1 }
    );

    const subjects = await findSubjectNames(
      student.course,
      student.batch,
      student.subjects
    );

    const studentData = {
      course: student.course,
      batch: student.batch,
      subjects: subjects
    };
    res.status(200).send(studentData);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getStudentSubjects', auth, async (req, res) => {
  try {
    const student = await Student.findOne(
      { _id: req.body._id },
      { _id: 0, course: 1, batch: 1, subjects: 1 }
    );

    const subjects = await findSubjectNames(
      student.course,
      student.batch,
      student.subjects
    );

    res.status(200).send(subjects);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/editStudent', auth, adminAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.body._id);

    if (!student) {
      throw new Error('Student Updation Failed');
    }

    if (student.email != req.body.email) {
      let user = await User.find({ email: student.email });
      if (!user) {
        throw new Error('User Not Found..');
      }

      await User.findByIdAndRemove(user._id);

      const newUser = {
        name: req.body.name.toLowerCase(),
        email: req.body.email,
        password: req.body.password,
        userType: 'student'
      };
      user = new User(newUser);
      await user.save();
    }

    const updatedStudent = {
      _id: req.body._id,
      name: req.body.name.toLowerCase(),
      birthDate: req.body.birthDate,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      branch: req.body.branch,
      courseType: req.body.courseType,
      course: req.body.course,
      batch: req.body.batch,
      subjects: req.body.subjects,
      status: req.body.status
    };

    await Student.findByIdAndUpdate(req.body._id, updatedStudent);

    const history = await History.findOne({ student: student._id });

    let len = req.body.subjects.length;
    let match = 0;
    for (let i = 0; i < len; i++) {
      if (student.subjects.includes(req.body.subjects[i])) {
        match++;
      }
    }
    // console.log(match, len);

    let course = false;
    let batch = false;
    let subject = false;

    if (student.course != req.body.course) {
      let match = 0;
      history.history.forEach(history => {
        if (req.body.course.toString() == history.course.toString()) {
          match++;
        }
      });
      if (match == 0) {
        const newHistory = {
          course: req.body.course,
          courseType: req.body.courseType,
          batches: [
            {
              batch: req.body.batch,
              subjects: req.body.subjects
            }
          ]
        };
        history.history.push(newHistory);

        // console.log(history)

        await History.findByIdAndUpdate(history._id, history);

        // console.log("batch : " + true)
        batch = true;
      }
    } else if (student.batch != req.body.batch) {
      history.history.forEach(async (curHistory, i) => {
        let match = 0;
        curHistory.batches.forEach(batch => {
          if (req.body.batch.toString() == batch.batch.toString()) {
            match++;
          }
        });
        if (match == 0) {
          newBatch = {
            batch: req.body.batch,
            subjects: req.body.subjects
          };
          history.history[i].batches.push(newBatch);

          // console.log(history)

          await History.findByIdAndUpdate(history._id, history);
          // console.log("batch : " + true)
          batch = true;
        }
      });
    } else if (match < len) {
      history.history.forEach(async (curHistory, i) => {
        curHistory.batches.forEach(async (curBatch, j) => {
          // console.log(req.body.batch.toString(), batch.batch.toString())
          if (req.body.batch.toString() == curBatch.batch.toString()) {
            let len = req.body.subjects.length;
            let match = 0;
            for (let k = 0; k < len; k++) {
              if (curBatch.subjects.includes(req.body.subjects[k])) {
                match++;
              }
            }
            // console.log(match, len);
            if (match < len) {
              try {
                const newSubjects = new Array();
                for (let k = 0; k < len; k++) {
                  if (!curBatch.subjects.includes(req.body.subjects[k])) {
                    newSubjects.push(req.body.subjects[k]);
                  }
                }

                newSubjects.forEach(subject => {
                  history.history[i].batches[j].subjects.push(subject);
                });

                // console.log(history)

                await History.findByIdAndUpdate(history._id, history);
                // console.log("subject : " + true)
                subject = true;
              } catch (e) {
                // console.log(''+e)
              }
            }
          }
        });
      });
    }

    // console.log("course " + course, "batch " + batch, "subject " + subject)

    res.status(200).send({ succes: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
