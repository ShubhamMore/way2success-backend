const mongoose = require('mongoose')
const contactSchema = new mongoose.Schema({

    address: {
        type:String,
        required:true
    },
    numbers: [{
        type:String,
        required:true
    }],
    email: {
        type:String,
        required:true
    }
});


const contact = mongoose.model('Contact', contactSchema)

module.exports = contact