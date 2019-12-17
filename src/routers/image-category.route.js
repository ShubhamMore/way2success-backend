const express = require('express')
const Image = require('../models/image.model')
const ImageCategory = require('../models/image-category.model')
const awsRemoveFile = require('../uploads/awsRemoveFile');
const auth = require('../middleware/auth')
const router = new express.Router()
  
router.post('/newCategory', auth, async (req, res, next) => {
    try {
        const imageCategory = new ImageCategory(req.body)
        await imageCategory.save();
        
        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
}); 

router.post('/getImageCategories', async (req, res) => {
    try {
        const categories = await ImageCategory.find()
        
        res.status(200).send(categories);
    }
    catch(e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
});

router.post('/deleteCategory', auth, async (req, res) => {
    try {
        const category = await ImageCategory.findByIdAndDelete(req.body._id);
        if(!category) {
            throw new Error("No Category Found");
        }
        const images = await Image.find({category: category._id});
        await Image.deleteMany({category: category._id});

        const n = images.length;
        for (let i = 0 ; i < n; i++) {
            const imageToDelete = images[i].public_id;
            await awsRemoveFile(imageToDelete);
        }
        res.status(200).send({success : true});
    }
    catch(e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
});

module.exports = router