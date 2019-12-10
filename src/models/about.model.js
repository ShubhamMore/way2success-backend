const mongoose = require('mongoose')
const aboutSchema = new mongoose.Schema({

    aim: {
        type: String,
        default: ''
    },
    vision: {
        type: String,
        default: ''
    },
    mission: {
        type: String,
        default: ''
    }
});

const about = mongoose.model('About', aboutSchema)

module.exports = about