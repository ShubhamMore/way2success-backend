const mongoose = require('mongoose')
const examSchema = new mongoose.Schema({

    examTitle: {
        type:String,
        required:true
    },
    outOfMarks: {
        type:String,
        required:true
    },
    passingMarks: {
        type:String,
        required:true
    },
    date: {
        type:String,
        required:true
    },
    branch: {
        type:String,
        required:true
    }, 
    course: {
        type:String,
        required:true
    }, 
    batch: {
        type:String,
        required:true
    }, 
    subject: {
        type:String,
        required:true
    }, 
    marks: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                require: true
            },
            marks: {
                type: String,
                require: true
            }
        }
    ]
});

const Exam = mongoose.model('Exam', examSchema)

module.exports = Exam