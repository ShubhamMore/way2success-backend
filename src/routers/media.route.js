const express = require('express')
const multer = require("multer");
const Media = require('../models/media.model')
const Branch = require('../models/branch.model')
const Course = require('../models/course.model')
const auth = require('../middleware/auth')

const awsUploadFile = require('../uploads/awsUploadFile');
const awsRemoveFile = require('../uploads/awsRemoveFile');

const router = new express.Router()

const MIME_TYPE_MAP = {
    "video/mp4": "mp4"
};  

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "media");
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
  
router.post('/newMedia', auth, multer({ storage: storage }).single("media"), async (req, res, next) => {
    const file = req.file;
    try {
        
        let video;

        if (file !== undefined) {
            let videoPath = file.path;
            let videoName = file.filename;
        
            const cloudeDirectory = "media";
        
            try {
                const upload_responce = await awsUploadFile(videoPath, videoName, cloudeDirectory);
        
                const upload_res = upload_responce.upload_res;
                
                if(upload_res) {
                    const video_data = {
                        media_name : upload_res.key.split('/')[1],
                        secure_url : upload_res.Location,
                        public_id : upload_res.key,
                        created_at : Date.now()
                    }
                    video = video_data;
                } else {
                    throw new Error("No response from cloudinary");
                }
            }
            catch(e) {
                throw new Error(e);
            }
            
            const mediaData = req.body;
            mediaData.media = video;
            
            const media = new Media(mediaData)

            await media.save();

            const data = {
                success : true
            }
            res.status(201).send(data)
    
        }
        else {
            throw new Error("No Media File Detected")
        } 
    } catch (e) {
        let err = "Something bad happend, " + e;
        res.status(400).send(err.replace('Error: ', ''));        
    }
});

router.post('/getAllMedia', auth, async (req, res) => {
    try {
        const mediaes = await Media.find({course: req.body.course, batch: req.body.batch, subject:req.body.subject})
        if(!mediaes) {
            throw new Error("No media Found");
        }
        res.status(200).send(mediaes);
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

router.post('/getMediaForStudent', auth, async (req, res) => {
    try {

        const date = new RegExp(".*" + req.body.date + ".*");

        const media = await Media.find({course: req.body.course, batch: req.body.batch, subject: req.body.subject, startTime: date});

        res.status(200).send(media);
    }
    catch(e) {
        let error = "" + e;
        if(e.name === "CastError") {
            error = "No media Found";
        }
        res.status(400).send(error);
    }
});

router.post('/getMedia', auth, async (req, res) => {
    try {
        const media = await Media.findById(req.body._id);
        if(!media) {
            throw new Error("No media Found");
        }
        res.status(200).send(media);
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No media Found";
        }
        res.status(400).send(error);
    }
});

router.post('/getMediaforEditing', auth, async (req, res) => {
    try {
        const branches = await Branch.find();

        if(branches.length < 1) {
            throw new Error("No Course Found");
        }

        const courses = await Course.find();

        if(courses.length < 1) {
            throw new Error("No Course Found");
        }

        const media = await Media.findById(req.body._id);
        if(!media) {
            throw new Error("No media Found");
        }
        res.status(200).send({media, branches, courses});
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No media Found";
        }
        res.status(400).send(error);
    }
});

router.post('/editMedia', auth, async (req, res) => {
    try {
        const media = await Media.findByIdAndUpdate(req.body._id, req.body);
        if(!media) {
            throw new Error("No media Found");
        }
        res.status(200).send({success: true});
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No media Found";
        }
        res.status(400).send(error);
    }
});

router.post('/deleteMedia', auth, async (req, res) => {
    try {
        const media = await Media.findOneAndRemove(req.body._id);
        if(!media) {
            throw new Error("No media Found");
        }
        
        await awsRemoveFile(media.media.public_id);
        
        res.status(200).send({success : true});
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No media Found";
        }
        res.status(400).send(error);
    }
});

module.exports = router