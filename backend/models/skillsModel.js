const mongoose = require('mongoose');
const skillSchema = new mongoose.Schema({
    employeeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Employee',
        required:true
    },
    skillName:{
        type:String,
        required:true
    },
    skillDescription:{
        type:String,
    },
    proficiencyLevel:{
        type:String,
        enum:['Beginner','Intermediate','Expert'],
        required:true,
    },
    experienceYears:{
        type:Number,
        required:true
    },
    certificateFileUrl:{
        type:String
    },
    projectLinks:[
        {
        label:{type:String},
        url:{type:String}
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    lastUpdated:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Skill',skillSchema);
