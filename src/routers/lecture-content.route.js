const express = require('express');
const multer = require('multer');
const Lecture = require('../models/lecture.model');
const LectureContent = require('../models/lecture-content.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');

const awsUploadFiles = require('../uploads/awsUploadFiles');
const awsRemoveFile = require('../uploads/awsRemoveFile');

const router = new express.Router();

const MIME_TYPE_MAP = {
  // MS-POWERPOINT
  'lapplication/mspowerpoint': 'ppt',
  'application/powerpoint': 'ppt',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/x-mspowerpoint': 'ppt',
  // PDF
  'application/pdf': 'pdf',
  // MS-WORD
  'application/msword': 'dot',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  // IMAGES
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
    cb(error, 'lectureContents');
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post(
  '/newLectureContents',
  auth,
  adminAuth,
  multer({ storage: storage }).array('content'),
  async (req, res, next) => {
    const file = req.files;
    if (file !== undefined) {
      let filePaths = new Array();
      let fileNames = new Array();
      for (let i = 0; i < file.length; i++) {
        filePaths.push(file[i].path);
        fileNames.push(file[i].filename);
      }

      const cloudeDirectory = 'lectureContents';

      try {
        const upload_responce = await awsUploadFiles(
          filePaths,
          fileNames,
          cloudeDirectory
        );

        const upload_res = upload_responce.upload_res;
        const upload_res_len = upload_res.length;

        const responce = new Array();

        if (upload_res_len > 0) {
          for (let i = 0; i < upload_res_len; i++) {
            const content_data = {
              lecture: req.body.lecture,
              content_name:
                upload_res[i].key
                  .split('/')[1]
                  .substring(
                    0,
                    upload_res[i].key.split('/')[1].lastIndexOf('-')
                  ) +
                upload_res[i].key
                  .split('/')[1]
                  .substring(upload_res[i].key.split('/')[1].lastIndexOf('.')),
              contentType:
                upload_res[i].key
                  .split('/')[1]
                  .substring(
                    upload_res[i].key.split('/')[1].lastIndexOf('.') + 1
                  ) === 'pdf'
                  ? 'PDF'
                  : 'IMAGE',
              secure_url: upload_res[i].Location,
              public_id: upload_res[i].key,
              created_at: Date.now()
            };
            const lectureContent = new LectureContent(content_data);
            await lectureContent.save();
            responce.push(lectureContent);
          }
        }

        res.status(200).send({ responce, upload_responce });
      } catch (e) {
        let err = '' + e;
        res.status(400).send(err.replace('Error: ', ''));
      }
    } else {
      res.status(400).send({ error: 'File Not Found' });
    }
  }
);

router.post('/getLectureContent', auth, async (req, res) => {
  try {
    const lectureContent = await LectureContent.findById(req.body._id);

    if (!lectureContent) {
      throw new Error('No Content Available');
    }

    res.status(200).send(lectureContent);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getLectureContents', auth, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.body._id);
    if (!lecture) {
      throw new Error('No Lecture Available');
    }

    const lectureContents = await LectureContent.find({
      lecture: req.body._id
    });

    res.status(200).send({ lecture, lectureContents });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteLectureContent', auth, adminAuth, async (req, res) => {
  const public_id = req.body.public_id;
  try {
    const lectureContent = await LectureContent.findOneAndRemove({ public_id });

    if (!lectureContent) {
      throw new Error('No Lecture Content Found');
    }

    const responce = await awsRemoveFile(public_id);
    res.status(200).send(responce);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
