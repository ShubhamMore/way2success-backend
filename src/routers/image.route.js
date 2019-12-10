const express = require('express')
const multer = require("multer");
const Image = require('../models/image.model')
const auth = require('../middleware/auth')

const awsUploadFiles = require('../uploads/awsUploadFiles');
const awsRemoveFile = require('../uploads/awsRemoveFile');

const router = new express.Router()

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg"
}; 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});
  
router.post('/newImages', auth, multer({ storage: storage }).array("image"), async (req, res, next) => {
    const file = req.files;
    if(file !== undefined) {
        let imagePaths = new Array();
        let imageNames = new Array();
        for(let i=0; i< file.length; i++) {
            imagePaths.push(file[i].path);
            imageNames.push(file[i].filename);
        }
    
        const cloudeDirectory = "images";
    
        try {
            const upload_responce = await awsUploadFiles(imagePaths, imageNames, cloudeDirectory);
    
            const upload_res = upload_responce.upload_res;
            const upload_res_len = upload_res.length;
    
            const responce = new Array();
            
            if(upload_res_len > 0) {
                for(let i=0; i<upload_res_len; i++) {
                    const img_data = {
                        category: req.body.category,
                        image_name : upload_res[i].key.split('/')[1],
                        secure_url : upload_res[i].Location,
                        public_id : upload_res[i].key,
                        created_at : Date.now()
                    }
                    const image = new Image(img_data);
                    const res = await image.save();
                    responce.push(res);
                }
            }
        
            res.status(200).send({responce, upload_responce})
        } catch (e) {
            const err = "Something bad happen, " + e;
            res.status(400).send(err.replace('Error: ', ''));
        }
    }
    else {
        res.status(400).send({error : "File Not Found"})
    }
    
}); 

router.post('/getImages', async (req, res) => {
    try {
        const images = await Image.find()
        
        res.status(200).send(images);
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

router.post('/getImagesByCategory', auth, async (req, res) => {
    try {
        const images = await Image.find({category: req.body.category});
        
        res.status(200).send(images);
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No Image Found";
        }
        res.status(400).send(error);
    }
});


router.post('/deleteImage', auth, async (req, res) => {
    const public_id = req.body.public_id;
    try {
        const image = await Image.findOneAndRemove({public_id});

        if(!image) {
            throw new Error("No Image Found");
        }
        
        const responce = await awsRemoveFile(public_id);
        res.status(200).send(responce);
    } catch (e) {
        const err = "Something bad happen, " + e;
        res.status(400).send(err.replace('Error: ', ''));
    }
});

module.exports = router