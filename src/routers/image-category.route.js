const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const Image = require('../models/image.model');
const ImageCategory = require('../models/image-category.model');
const awsRemoveFile = require('../uploads/awsRemoveFile');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const router = new express.Router();

router.post('/newCategory', auth, adminAuth, async (req, res, next) => {
  try {
    const file = req.body.category + '.json';
    const filePath = path.join(__dirname, '../../', 'image-categories/', file);

    await fs.appendFile(filePath, '');

    const url = process.env.API_URI + '/image-categories/' + file;
    const category = {
      category: req.body.category,
      categoryFile: file,
      categoryURL: url
    };
    const imageCategory = new ImageCategory(category);
    await imageCategory.save();

    const data = {
      success: true
    };
    res.status(201).send(data);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getImageCategories', auth, adminAuth, async (req, res) => {
  try {
    const categories = await ImageCategory.find();

    res.status(200).send(categories);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/getImageCategoriesForContent', async (req, res) => {
  try {
    const categories = await ImageCategory.find(
      {},
      { _id: 0, categoryFile: 0 }
    );

    res.status(200).send(categories);
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

router.post('/deleteCategory', auth, adminAuth, async (req, res) => {
  try {
    const category = await ImageCategory.findByIdAndDelete(req.body._id);
    if (!category) {
      throw new Error('No Category Found');
    }
    const images = await Image.find({ category: category._id });
    await Image.deleteMany({ category: category._id });

    const n = images.length;
    for (let i = 0; i < n; i++) {
      const imageToDelete = images[i].public_id;
      await awsRemoveFile(imageToDelete);
    }

    await fs.unlink(
      path.join(__dirname, '../../', 'image-categories/', category.categoryFile)
    );

    res.status(200).send({ success: true });
  } catch (e) {
    let err = '' + e;
    res.status(400).send(err.replace('Error: ', ''));
  }
});

module.exports = router;
