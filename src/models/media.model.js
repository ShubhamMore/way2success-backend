const mongoose = require('mongoose')
const mediaSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    course:{
        type:String,
        required:true
    },
    batch:{
        type:String,
        required:true
    }, 
    subject:{
        type:String,
        required:true
    },
    media:{
        media_name : {
            type : String,
            required : true
        },
        secure_url : {
            type : String,
            required : true
        },
        public_id : {
            type : String,
            required : true
        },
        created_at : {
            type: String,
            default: Date.now.toString()
        }
    },
    duration:{
        type:String,
        require : true
    },
    startTime:{
        type:String,
        require : true
    }
});

mediaSchema.methods.toJSON = function () {
    const media = this
    const mediaObject = media.toObject()

    delete mediaObject.__v

    return mediaObject
}

const media = mongoose.model('Media', mediaSchema)

module.exports = media