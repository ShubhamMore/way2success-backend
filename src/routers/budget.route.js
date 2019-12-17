const express = require('express')
const Budget = require('../models/budget.model')
const auth = require('../middleware/auth')
const sortArrayOfObjects = require('../functions/sortArrayOfObjects')
const router = new express.Router()

router.post('/saveBudget', auth, async (req, res) => {
    const budget = new Budget(req.body)
    try {
        await budget.save();
        const data = {
            success : true
        }
        res.status(201).send(data)
    } catch (e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
});

router.post('/getBudget', auth, async (req, res) => {

    let searchDataforIncome;
    let searchDataforExpence;

    if (req.body.month && req.body.year) {
        const date = new RegExp(".*" + req.body.year + "-" + req.body.month + ".*");
        searchDataforIncome = {
            type: '1',
            date: date
        }
        searchDataforExpence = {
            type: '0',
            date: date
        }
    } else if (req.body.year) {
        const date = new RegExp(".*" + req.body.year + ".*");
        searchDataforIncome = {
            type: '1',
            date: date
        }
        searchDataforExpence = {
            type: '0',
            date: date
        }
    } else {
        searchDataforIncome = {
            type: '1'
        }
        searchDataforExpence = {
            type: '0'
        }
    }

    try {
        const income = await Budget.find(searchDataforIncome)
        const expence = await Budget.find(searchDataforExpence)
        
        res.status(201).send({income, expence});

    } catch (e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
});

router.post('/getBudgetSummery', auth, async (req, res) => {
    try {
        let budgetSummery;

        if (req.body.month && req.body.year) {
            const date = new RegExp(".*" + req.body.year + "-" + req.body.month + ".*");
            budgetSummery = await Budget.find({date: date})
        } else if (req.body.year) {
            const date = new RegExp(".*" + req.body.year + ".*");
            budgetSummery = await Budget.find({date: date})
        } else {
            budgetSummery = await Budget.find()
        }
        
        const statement = sortArrayOfObjects(budgetSummery, 'date');

        res.status(201).send(statement);
    } catch (e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
});

router.post('/deleteBudget', auth, async (req, res) => {
    try {
        const budget = await Budget.findByIdAndRemove(req.body._id)
        
        if(!budget) {
            throw new Error("No Budget Found");
        }

        res.status(201).send({success: true});

    } catch (e) {
        let err = "" + e;
        res.status(400).send(err.replace('Error: ', ''))
    }
});

module.exports = router