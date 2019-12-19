const express = require('express');
const Branch = require('../models/branch.model');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/newBranch', auth, async (req, res) => {
  const branch = new Branch(req.body);
  try {
    await branch.save();
    const data = {
      success: true
    };
    res.status(201).send(data);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getBranches', auth, async (req, res) => {
  try {
    const branches = await Branch.find();

    res.status(200).send(branches);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getBranch', auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.body._id);
    if (!branch) {
      throw new Error('No Branch Found');
    }

    res.status(200).send(branch);
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No Branch Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getBranchForEditing', auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.body._id);
    if (!branch) {
      throw new Error('No Branch Found');
    }

    res.status(200).send(branch);
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No Branch Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/editBranch', auth, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.body._id, req.body);
    if (!branch) {
      throw new Error('Branch Updation Failed');
    }
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deactivateBranch', auth, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.body._id, {
      status: '0'
    });
    if (!branch) {
      throw new Error('Branch Deactivation Failed');
    }
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/activateBranch', auth, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.body._id, {
      status: '1'
    });
    if (!branch) {
      throw new Error('Branch Activation Failed');
    }
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
