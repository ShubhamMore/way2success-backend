const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const Image = require('../models/image.model');
const ImageCategory = require('../models/image-category.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');

const awsUploadFiles = require('../uploads/awsUploadFiles');
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
    cb(error, 'images');
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

const writeFileToCategories = async categoryID => {
  const category = await ImageCategory.findById(categoryID);

  const images = await Image.find(
    { category: categoryID },
    { _id: 0, secure_url: 1, width: 1, height: 1 }
  );

  const saveImages = new Array();

  images.forEach(curImage => {
    const devicePreviews = {};

    devicePreviews.preview_xxs = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_xs = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_s = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_m = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_l = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.preview_xl = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };
    devicePreviews.raw = {
      path: curImage.secure_url,
      width: curImage.width,
      height: curImage.height
    };

    saveImages.push(devicePreviews);
  });

  await fs.writeFile(
    path.join(__dirname, '../../image-categories', category.categoryFile),
    JSON.stringify(saveImages)
  );
};

router.post(
  '/newImages',
  auth,
  adminAuth,
  multer({ storage: storage }).array('image'),
  async (req, res, next) => {
    const file = req.files;
    if (file !== undefined) {
      let imagePaths = new Array();
      let imageNames = new Array();
      for (let i = 0; i < file.length; i++) {
        imagePaths.push(file[i].path);
        imageNames.push(file[i].filename);
      }

      const cloudeDirectory = 'images';

      try {
        const upload_responce = await awsUploadFiles(
          imagePaths,
          imageNames,
          cloudeDirectory
        );

        const upload_res = upload_responce.upload_res;
        const upload_res_len = upload_res.length;

        const responce = new Array();

        if (upload_res_len > 0) {
          for (let i = 0; i < upload_res_len; i++) {
            const img_data = {
              category: req.body.category,
              image_name: upload_res[i].key.split('/')[1],
              secure_url: upload_res[i].Location,
              public_id: upload_res[i].key,
              created_at: Date.now(),
              width: upload_res[i].size.width,
              height: upload_res[i].size.height
            };
            const image = new Image(img_data);
            const res = await image.save();
            responce.push(res);
          }
        }

        await writeFileToCategories(req.body.category);

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

router.post('/getImages', async (req, res) => {
  try {
    const images = await Image.find();

    res.status(200).send(images);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getImagesByCategory', auth, adminAuth, async (req, res) => {
  try {
    const images = await Image.find({ category: req.body.category });

    res.status(200).send(images);
  } catch (e) {
    let err = '' + e;
    if (e.name === 'CastError') {
      err = 'No Image Found';
    }
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteImage', auth, adminAuth, async (req, res) => {
  const public_id = req.body.public_id;
  try {
    const image = await Image.findOneAndRemove({ public_id });

    if (!image) {
      throw new Error('No Image Found');
    }

    const responce = await awsRemoveFile(public_id);

    await writeFileToCategories(image.category);

    res.status(200).send(responce);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
