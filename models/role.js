var mongoose=require('mongoose')
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var RoleSchema = new Schema({
	name:{type:String},
    jur:[],
    describe:{type:String},
    usable:{type:String},
})
module.exports = mongoose.model('Role',RoleSchema) 
