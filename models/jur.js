var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var JurSchema = new Schema({
	name:{type:String},
    level:{type:Number},
    describe:{type:String},
    usable:{type:String},
})
module.exports = mongoose.model('Jur',JurSchema) 
