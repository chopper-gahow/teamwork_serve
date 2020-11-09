var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var FeedBackSchema = new Schema({
	studycase:{type:String},
    classthink:{type:String},
    teacherthink:{type:String},
    comment:{type:String},
    class:{type:String},
    sender:{type:String},
})
module.exports = mongoose.model('FeedBack',FeedBackSchema) 
