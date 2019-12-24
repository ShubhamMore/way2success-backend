const express = require('express');
const About = require('../models/about.model');
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

router.post('/getAbout', async (req, res) => {
  try {
    const about = await About.find();
    res.status(200).send(about[0]);
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No About Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
