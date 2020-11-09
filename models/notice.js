var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var NoticeSchema = new Schema({
	title:{type:String},
    text:{type:String},
    date:{type:String},
    ispush:{type:String},
    state:{type:String}
    
})
module.exports = mongoose.model('Notice',NoticeSchema) 
