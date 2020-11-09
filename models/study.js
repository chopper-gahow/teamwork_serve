var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var StudySchema = new Schema({
	title:{type:String},
    master:{type:String},
    date:{type:String},
    content:{type:String},
    school:{type:String},
    headimg:{type:String},
    coverimg:{type:String},
    state:{type:String}
})
module.exports = mongoose.model('Study',StudySchema) 
