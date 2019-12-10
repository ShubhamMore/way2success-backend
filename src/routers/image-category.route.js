const express = require('express')
const fs = require('fs');
const path = require('path');
const Image = require('../models/image.model')
const ImageCategory = require('../models/image-category.model')
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
        let err = "Something bad happend " + e;
        res.status(400).send(err)
    }
}); 

router.post('/getImageCategories', async (req, res) => {
    try {
        const categories = await ImageCategory.find()
        
        res.status(200).send(categories);
    }
    catch(e) {
        res.status(400).send(""+e);
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
            const imageToDelete = images[i].image.split('images/')[1];
            fs.unlink(path.join(__dirname,"../../")+'images/'+imageToDelete, (err) => {
                if (err) throw err;
            });
        }
        res.status(200).send({success : true});
    }
    catch(e) {
        let error = ""+e;
        res.status(400).send(error);
    }
});

module.exports = router