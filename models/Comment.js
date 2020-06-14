const mongoose = require('mongoose')
const Schema = mongoose.Schema 

const commentSchema = new mongoose.Schema({
    comment:{type:String,required:true},
    username:{type:String,required:true},
    email:{type:String,required:true},
    date:{type:Date,default:Date.now},
    post:{type:Schema.Types.ObjectId,ref:'posts'},
    accepted:{type:Boolean,default:false}
})

module.exports = mongoose.model('Comment',commentSchema)