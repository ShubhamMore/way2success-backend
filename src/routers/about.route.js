const express = require('express')
const About = require('../models/about.model')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/saveAbout', auth, async (req, res) => {
    try {
        let about;
        if(req.body._id) {
            about = await About.findByIdAndUpdate(req.body._id, req.body);
        } else {
            about = new About(req.body);
            await about.save();
        }
        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
})

router.post('/getAbout', async (req, res) => {
    try {
        const about = await About.find();
        res.status(200).send(about[0]);
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No About Found";
        }
        res.status(400).send(error);
    }
})

module.exports = router