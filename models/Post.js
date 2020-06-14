const mongoose = require('mongoose')
const Schema = mongoose.Schema 

const PostSchema = new mongoose.Schema({
    title:{type:String,required:true},
    slug:{type:String,required:true},
    img:{type:String,required:true},
    content:{type:String,required:true},
    date:{type:Date,default:Date.now},
    category:{type:Schema.Types.ObjectId,ref:'categories'},
    user:{type:Schema.Types.ObjectId,ref:'users'},
    featured:{type:Boolean}
})

module.exports = mongoose.model('Post',PostSchema)