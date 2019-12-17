const express = require('express')
const Contact = require('../models/contact.model')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/saveContact', auth, async (req, res) => {
    try {
        let contact;
        if(req.body._id) {
            contact = await Contact.findByIdAndUpdate(req.body._id, req.body);
            if(!contact) {
                throw new Error("Contact Updation Failed");
            }
        } else {
            contact = new Contact(req.body);
            await contact.save();
        }
        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
})

router.post('/getContact', async (req, res) => {
    try {
        const contact = await Contact.find();
        res.status(200).send(contact[0]);
    }
    catch(e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
});

module.exports = router