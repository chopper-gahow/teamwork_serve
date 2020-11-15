var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var ChooseSchema = new Schema({
	classid:{type:String},
    username:{type:String},
    
})
module.exports = mongoose.model('Choose',ChooseSchema) 