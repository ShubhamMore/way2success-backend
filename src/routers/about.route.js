const express = require('express');
const About = require('../models/about.model');
const Topper = require('../models/topper.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const router = new express.Router();

router.post('/saveAbout', auth, adminAuth, async (req, res) => {
  try {
    let about;
    if (req.body._id) {
      about = await About.findByIdAndUpdate(req.body._id, req.body);
    } else {
      about = new About(req.body);
      await about.save();
    }
    const data = {
      success: true
    };
    res.status(201).send(data);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getAbout', auth, adminAuth, async (req, res) => {
  try {
    const about = await About.findOne();
    res.status(200).send(about);
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No About Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getAboutAndToppers', async (req, res) => {
  try {
    const about = await About.findOne({}, { _id: 0, content: 0 });
    const toppers = await Topper.find({}, { _id: 0 });
    res.status(200).send({ about, toppers });
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No About Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getContent', async (req, res) => {
  try {
    const about = await About.findOne();
    res.status(200).send({ content: about.content });
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No About Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
