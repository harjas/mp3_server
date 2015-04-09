var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;

var UserSchema	= new Schema({
	name: String,
	email: String,
	pendingTasks: [String],
	dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

