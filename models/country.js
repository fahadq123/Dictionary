var mongoose = require('mongoose');
var dictSchema = new mongoose.Schema({
	country : String,
	slangs : [{
		def : String,
		exp : String,
		category : String
	}]
});
var Dict = mongoose.model('Dict', dictSchema);

module.exports = Dict;
