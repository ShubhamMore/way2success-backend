 const mongoose = require('mongoose')
const attendanceSchema = new mongoose.Schema({
    date: {
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
    attendance: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                require: true
            },
            attendanceStatus: {
                type: String,
                require: true
            }
        }
    ]
});

const Attendance = mongoose.model('Attendance', attendanceSchema)

module.exports = Attendance