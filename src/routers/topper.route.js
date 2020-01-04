const express = require('express');
const multer = require('multer');
const Topper = require('../models/topper.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');

const user_image = require('../shared/user.image');

const awsUploadFile = require('../uploads/awsUploadFile');
const awsRemoveFile = require('../uploads/awsRemoveFile');

const router = new express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, 'toppers');
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, 'topper' + '-' + Date.now() + '.' + ext);
  }
});

router.post(
  '/newTopper',
  auth,
  adminAuth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      let image;

      if (file !== undefined) {
        let imagePath = file.path;
        let imageName = file.filename;

        const cloudeDirectory = 'toppers';

        try {
          const upload_responce = await awsUploadFile(
            imagePath,
            imageName,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;

          if (upload_res) {
            const img_data = {
              image_name: upload_res.key.split('/')[1],
              secure_url: upload_res.Location,
              public_id: upload_res.key,
              created_at: Date.now()
            };
            image = img_data;
          }
        } catch (e) {
          image = user_image;
        }
      } else {
        image = user_image;
      }

      const topperData = req.body;
      topperData.image = image;

      const topper = new Topper(topperData);

      await topper.save();

      res.status(200).send(topper);
    } catch (e) {
      let err = '' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

router.post('/getAllToppers', auth, adminAuth, async (req, res) => {
  try {
    const topper = await Topper.find();

    res.status(200).send(topper);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getToppersByYear', auth, adminAuth, async (req, res) => {
  try {
    const topper = await Topper.find({ year: req.body.year });

    res.status(200).send(topper);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getTopper', auth, adminAuth, async (req, res) => {
  try {
    const topper = await Topper.findById(req.body._id);
    if (!topper) {
      throw new Error('No Topper Found');
    }
    res.status(200).send(topper);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/changeTopperStatus', auth, adminAuth, async (req, res) => {
  try {
    const topper = await Topper.findByIdAndUpdate(req.body._id, {
      status: req.body.status
    });
    if (!topper) {
      throw new Error('No Topper Found');
    }
    res.status(200).send(topper);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteTopper', auth, adminAuth, async (req, res) => {
  try {
    const topper = await Topper.findByIdAndRemove(req.body._id);

    if (!topper) {
      throw new Error('No Topper Found');
    }

    if (topper.image.public_id !== user_image.public_id) {
      await awsRemoveFile(topper.image.public_id);
    }

    res.status(200).send(topper);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post(
  '/editTopper',
  auth,
  adminAuth,
  multer({ storage: storage }).single('image'),
  async (req, res) => {
    const file = req.file;
    try {
      const topper = await Topper.findById(req.body._id);

      if (!topper) {
        throw new Error('No Topper Found');
      }

      let image = topper.image;

      const img_pub_id = topper.image.public_id;

      if (file !== undefined) {
        let imagePath = file.path;
        let imageName = file.filename;

        const cloudeDirectory = 'toppers';

        try {
          const upload_responce = await awsUploadFile(
            imagePath,
            imageName,
            cloudeDirectory
          );

          const upload_res = upload_responce.upload_res;

          if (upload_res) {
            const img_data = {
              image_name: upload_res.key.split('/')[1],
              secure_url: upload_res.Location,
              public_id: upload_res.key,
              created_at: Date.now()
            };
            image = img_data;
          }

          if (img_pub_id !== user_image.public_id) {
            await awsRemoveFile(img_pub_id);
          }
        } catch (e) {}
      }

      const topperData = req.body;
      topperData.image = image;

      await Topper.findByIdAndUpdate(req.body._id, topperData);

      res.status(200).send({ success: true });
    } catch (e) {
      let err = '' + e;
      res.status(400).send(err.replace('Error: ', ''));
    }
  }
);

module.exports = router;
