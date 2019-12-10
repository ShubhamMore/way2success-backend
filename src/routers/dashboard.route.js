const express = require('express')
const Student = require('../models/student.model')
const Exam = require('../models/exam.model')
const Enquiry = require('../models/enquiry.model')
const Branch = require('../models/branch.model')
const Course = require('../models/course.model')
const Media = require('../models/media.model')
const ImageCategory = require('../models/image-category.model')
const Image = require('../models/image.model')
const Topper = require('../models/topper.model')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/getDashboardData', auth, async (req, res) => {
    try {
        const student = await Student.find();
        const exam = await Exam.find();
        const enquiry = await Enquiry.find({seen: '0'});
        const branch = await Branch.find();
        const course = await Course.find();
        const image = await Image.find();
        const imageCategory = await ImageCategory.find();
        const media = await Media.find();
        const topper = await Topper.find();

        const dashbosrdData = {
            students: student.length,
            exams: exam.length,
            branches: branch.length,
            imageCategories: imageCategory.length,
            images: image.length,
            courses: course.length,
            media: media.length,
            toppers: topper.length,
            enquiries: enquiry.length
        };
        res.status(200).send(dashbosrdData);

    } catch (e) {
        let err = "Something bad happend" + e;
        res.status(400).send(err)
    }
});

module.exports = router