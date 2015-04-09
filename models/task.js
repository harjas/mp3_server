var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
	name: String,
	description: {type: String, default:""},
	deadline: Date,
	completed: Boolean,
	assignedUser: { type: String, default: "" },
	assignedUserName: { type: String, default: "unassigned" },
	dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);