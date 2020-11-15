var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var ClassMateSchema = new Schema({
	classcount:{ type:String }
})
module.exports = mongoose.model('ClassMate',ClassMateSchema) 
