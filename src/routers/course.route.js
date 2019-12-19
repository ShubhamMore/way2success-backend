const express = require('express');
const Course = require('../models/course.model');
const Branch = require('../models/branch.model');
const auth = require('../middleware/auth');
const findBranchName = require('../functions/findBranchName');

const router = new express.Router();

router.post('/newCourse', auth, async (req, res) => {
  const course = new Course(req.body);
  try {
    await course.save();
    const data = {
      success: true
    };
    res.status(201).send(data);
  } catch (e) {
    let err = 'Something bad happend';
    res.status(400).send(err);
  }
});

router.post('/getCourses', auth, async (req, res) => {
  try {
    const courses = await Course.find();

    res.status(200).send(courses);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getCourses', auth, async (req, res) => {
  try {
    const courses = await Course.find();
    if (!courses) {
      throw new Error('No Course Found');
    }
    res.status(200).send(courses);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getCoursesByBranch', auth, async (req, res) => {
  try {
    const courses = await Course.find({ branch: req.body.branch });
    res.status(200).send(courses);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getBranchesAndCourses', auth, async (req, res) => {
  try {
    const branches = await Branch.find();
    if (branches.length < 1) {
      throw new Error('No Branch Found');
    }
    const courses = await Course.find();
    if (courses.length < 1) {
      throw new Error('No Course Found');
    }
    res.status(200).send({ branches, courses });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getBranchesAndCoursesForContent', async (req, res) => {
  try {
    const branches = await Branch.find({ status: '1' });
    const courses = await Course.find({ status: '1' });

    let branch = new Array();

    branches.forEach(curBranch => {
      let course = new Array();
      courses.forEach(curCourse => {
        if (curBranch._id.toString() === curCourse.branch.toString()) {
          const courseObj = {
            _id: curCourse._id,
            courseName: curCourse.courseName,
            batch: curCourse.batch
          };
          course.push(courseObj);
        }
      });
      const branchObj = {
        _id: curBranch._id,
        branchName: curBranch.branchName,
        address: curBranch.address,
        phone: curBranch.phone,
        email: curBranch.email,
        course: course
      };
      branch.push(branchObj);
    });

    res.status(200).send(branch);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getCourse', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body._id);
    if (!course) {
      throw new Error('No Course Found');
    }

    const branch = await findBranchName(course.branch);
    course.branch = branch;

    res.status(200).send(course);
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No Course Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getCourseForEditing', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body._id);
    if (!course) {
      throw new Error('No Course Found');
    }
    const branches = await Branch.find();
    res.status(200).send({ course, branches });
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No Course Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/editCourse', auth, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.body._id, req.body);
    if (!course) {
      throw new Error('Course Updation Failed');
    }
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deactivateCourse', auth, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.body._id, {
      status: '0'
    });
    if (!course) {
      throw new Error('Course Deactivation Failed');
    }
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/activateCourse', auth, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.body._id, {
      status: '1'
    });
    if (!course) {
      throw new Error('Course Activation Failed');
    }
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
