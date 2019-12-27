const express = require('express');
const Receipt = require('../models/receipt.model');
const Student = require('../models/student.model');
const Budget = require('../models/budget.model');
const Course = require('../models/course.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const findBranchName = require('../functions/findBranchName');

const router = new express.Router();

router.post('/newReceipt', auth, adminAuth, async (req, res, next) => {
  let receipt = new Receipt(req.body);
  try {
    await receipt.save();
    const budget = new Budget({
      receipt: receipt._id,
      title: 'Student Fees',
      amount: receipt.amount,
      type: '1',
      date: receipt.date
    });
    await budget.save();
    res.status(201).send({ _id: receipt._id });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getAllReceipts', auth, adminAuth, async (req, res, next) => {
  try {
    const receipt = await Receipt.find({ student: req.body.student });
    res.status(200).send(receipt);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getAllReceiptsForStudent', auth, async (req, res, next) => {
  try {
    const receipt = await Receipt.find({
      student: req.body.student,
      status: '1'
    });
    res.status(200).send(receipt);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getReceipt', auth, async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.body._id);
    const student = await Student.findById(receipt.student);
    const course = await Course.findById(receipt.course);
    const batch = course.batch.find(curBatch => curBatch._id == receipt.batch);

    receipt.branch = await findBranchName(receipt.branch);
    receipt.student = student.name;
    receipt.course = course.courseName;
    receipt.batch = batch.batchName;

    res.status(200).send(receipt);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/changeReceiptStatus', auth, adminAuth, async (req, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(req.body._id, {
      status: req.body.status
    });

    if (!receipt) {
      throw new Error('Receipt Status Updation Failed');
    }

    res.status(200).send(receipt);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteReceipt', auth, adminAuth, async (req, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.body._id);
    await Budget.findOneAndDelete({ receipt: receipt._id });
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
