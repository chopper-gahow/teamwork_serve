var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var ClassSchema = new Schema({
	name:{type:String},
    techer:{type:String},
    desc:{type:String},
    classtime:{type:String},
    date:{type:String},
    coverimg:{type:String},
    classarr:[]
})
module.exports = mongoose.model('Class',ClassSchema) 
