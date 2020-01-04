const express = require('express');
const User = require('../models/user.model');
const Student = require('../models/student.model');
// const faculty = require('../models/faculty.model')
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const sendMail = require('../email/mail');
const router = new express.Router();

router.post('/newUser', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    const data = {
      _id: user._id,
      email: user.email,
      userType: user.userType,
      token,
      expiresIn: 1800
    };
    res.status(201).send(data);
  } catch (e) {
    let err = 'Something bad happend' + e;
    if (e.code == 11000) {
      err = 'User alredy register, Please login';
    }
    res.status(400).send(err);
  }
});

router.post('/checkUser', async (req, res) => {
  try {
    let exist = false;
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      exist = true;
    }
    res.status(201).send({ exist });
  } catch (e) {
    let err = '' + e;
    if (e.code == 11000) {
      err = 'User alredy register, Please login';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    let _id = user._id;

    if (user.userType == 'student') {
      const student = await Student.findOne({ email: user.email });
      _id = student._id;
    }
    // else if(user.userType == "faculty") {
    //     const faculty = await Faculty.findOne({email : user.email});
    //     _id = faculty._id;
    // }
    const data = {
      _id: _id,
      email: user.email,
      userType: user.userType,
      token,
      expiresIn: 3600
    };

    res.send(data);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/autoLogin', auth, async (req, res) => {
  try {
    res.send({ authenticated: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/forgotPassword', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      throw new Error('No user Found..');
    }

    const token = await user.generateAuthToken();

    const link = process.env.MAIL_URI + '/#/resetPassword?key=' + token;

    const mail = {
      to: user.email,
      from: process.env.REPLY_EMAIL,
      subject: 'Reset Password Link',
      text: '',
      html: `<p>Click following link to reset your password </p><br><a href='${link}'>${link}</a>`
    };

    await sendMail(mail);

    res.status(200).send({ data: 'success' });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/validateToken', async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': req.body.token
    });

    if (!user) {
      throw new Error('Invalid Token');
    }

    const data = {
      valid_token: true
    };

    res.status(200).send(data);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/resetPassword', async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': req.body.token
    });

    if (!user) {
      throw new Error('No user Found');
    }

    user.tokens = [];
    user.password = req.body.password;

    await user.save();

    res.send();
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/changePassword', auth, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    if (!user) {
      throw new Error();
    }

    user.password = req.body.newPassword;

    await user.save();

    res.send({ success: true });
  } catch (e) {
    res.status(400).send('Old Password Does not Match, Please Try Again');
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
