const express = require('express')
const Branch = require('../models/branch.model')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/newBranch', auth, async (req, res) => {
    const branch = new Branch(req.body)
    try {
        await branch.save();
        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "Something bad happend";
        res.status(400).send(err)
    }
})

router.post('/getBranches', auth, async (req, res) => {
    try {
        const branches = await Branch.find()
        
        res.status(200).send(branches);
    }
    catch(e) {
        res.status(400).send(""+e);
    }
})

router.post('/getBranch', auth, async (req, res) => {
    try {
        const branch = await Branch.findById(req.body._id);
        if(!branch) {
            throw new Error("No Branch Found");
        }

        res.status(200).send(branch);
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No Branch Found";
        }
        res.status(400).send(error);
    }
})

router.post('/getBranchForEditing', auth, async (req, res) => {
    try {
        const branch = await Branch.findById(req.body._id);
        if(!branch) {
            throw new Error("No Branch Found");
        }

        res.status(200).send(branch);
    }
    catch(e) {
        let error = ""+e;
        if(e.name === "CastError") {
            error = "No Branch Found";
        }
        res.status(400).send(error);
    }
})

router.post('/editBranch', auth, async (req, res) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.body._id, req.body);
        if(!branch) {
            throw new Error("Branch Updation Failed");
        }
        res.status(200).send({success : true});
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

router.post('/deactivateBranch', auth, async (req, res) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.body._id, {status: '0'});
        if(!branch) {
            throw new Error("Branch Deactivation Failed");
        }
        res.status(200).send({success : true});
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

router.post('/activateBranch', auth, async (req, res) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.body._id, {status: '1'});
        if(!branch) {
            throw new Error("Branch Activation Failed");
        }
        res.status(200).send({success : true});
    }
    catch(e) {
        res.status(400).send(""+e);
    }
});

module.exports = router