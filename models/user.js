var mongoose=require('mongoose');
const { count } = require('./notice');
mongoose.connect('mongodb://localhost:27017/teamwork')
var Schema = mongoose.Schema;
var UserSchema = new Schema({
	username:{type:String},
    password:{type:String},
    realname:{type:String},
    role:{type:String},
    jurisdiction:[],
    headimg:{type:String},
    myclass:[],
    class:{type:Number},
})
module.exports = mongoose.model('User',UserSchema) 
