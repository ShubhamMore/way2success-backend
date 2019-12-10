const express = require('express')
const Enquiry = require('../models/enquiry.model')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/sendEnquiry', async (req, res) => {
    const enquiry = new Enquiry(req.body)
    try {
        await enquiry.save();
        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
})

router.post('/getEnquiries', auth, async (req, res) => {
    try {
        const enquiry = await Enquiry.find()
        if(!enquiry) {
            throw new Error("No Enquiry Found");
        }
        res.status(200).send(enquiry);
    }
    catch(e) {
        res.status(400).send(""+e);
    }
})

router.post('/getEnquiry', auth, async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(req.body._id, {seen : "1"});
        if(!enquiry) {
            throw new Error("No Enquiry Found");
        }
        
        res.status(200).send(enquiry);
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No Enquiry Found";
        }
        res.status(400).send(error);
    }
})

router.post('/unseenEnquiries', auth, async (req, res) => {
    try {
        const enquiry = await Enquiry.find({seen: '0'})
        if(!enquiry) {
            throw new Error("No Enquiry Found");
        }

        res.status(200).send({enquiries: enquiry.length});
    }
    catch(e) {
        res.status(400).send(""+e);
    }
})

router.post('/markEnquiryAsSeen', auth, async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(req.body._id, {seen: '1'});
        if(!enquiry) {
            throw new Error("No Enquiry Found");
        }
        res.status(200).send({success : true});
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

router.post('/replyEnquiry', auth, async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.body.enquiry);
        if(!enquiry) {
            throw new Error('No Enquiry Found');
        }
        const reply = enquiry.reply;

        const curReply = {
            subject: req.body.subject,
            message: req.body.message,
            date: req.body.date
        }

        // Send reply to Mail

        reply.push(curReply);

        enquiry.reply = reply;

        await Enquiry.findByIdAndUpdate(enquiry._id, enquiry);

        res.status(200).send({success : true});
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

module.exports = router