const wfs = require("wfs-local");
//const wfs = require("wfs-s3");


module.exports = function(){
	const folder = __dirname + "/files";
	const fs = new wfs.LocalFiles(folder, null, {
	 	verbose: true
	});

	// const folder = "s3://mk-wfs-test/";
	// const fs = new wfs.S3(folder, null, {
	// 	accessKey: "",
	// 	secretKey: "",
	// 	verbose: true
	// });

	return fs;
};