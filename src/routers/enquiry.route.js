const express = require('express');
const Enquiry = require('../models/enquiry.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const sendMail = require('../email/mail');
const sortArrayOfObjectsById = require('../functions/sortArrayOfObjectsById');
const router = new express.Router();

router.post('/sendEnquiry', async (req, res) => {
  const enquiry = new Enquiry(req.body);
  try {
    await enquiry.save();

    const mail = {
      to: process.env.ENQUIRY_EMAIL,
      from: process.env.REPLY_EMAIL,
      subject: `Enquiry from ${enquiry.email}`,
      text: '',
      html: `
        <strong>Name : </strong>${enquiry.name}<br>
        <strong>Phone : </strong>${enquiry.phone}<br>
        <strong><em>E-</em>Mail : </strong><a href='mailto:${enquiry.email}'>${enquiry.email}</a><br>
        <strong>Message : </strong>${enquiry.message}<br>
      `
    };

    await sendMail(mail);

    const data = {
      success: true
    };
    res.status(201).send(data);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getEnquiries', auth, adminAuth, async (req, res) => {
  try {
    const enquiry = await Enquiry.find();
    if (!enquiry) {
      throw new Error('No Enquiry Found');
    }
    sortArrayOfObjectsById(enquiry, '_id');
    res.status(200).send(enquiry);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getEnquiry', auth, adminAuth, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.body._id, {
      seen: '1'
    });
    if (!enquiry) {
      throw new Error('No Enquiry Found');
    }

    res.status(200).send(enquiry);
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No Enquiry Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/unseenEnquiries', auth, adminAuth, async (req, res) => {
  try {
    const enquiry = await Enquiry.find({ seen: '0' });
    if (!enquiry) {
      throw new Error('No Enquiry Found');
    }

    res.status(200).send({ enquiries: enquiry.length });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/markEnquiryAsSeen', auth, adminAuth, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.body._id, {
      seen: '1'
    });
    if (!enquiry) {
      throw new Error('No Enquiry Found');
    }
    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/replyEnquiry', auth, adminAuth, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.body.enquiry);
    if (!enquiry) {
      throw new Error('No Enquiry Found');
    }
    const reply = enquiry.reply;

    const curReply = {
      subject: req.body.subject,
      message: req.body.message,
      date: req.body.date
    };

    const mail = {
      to: enquiry.email,
      from: process.env.REPLY_EMAIL,
      subject: curReply.subject,
      text: '',
      html: curReply.message
    };

    await sendMail(mail);

    reply.push(curReply);

    enquiry.reply = reply;

    await Enquiry.findByIdAndUpdate(enquiry._id, enquiry);

    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
