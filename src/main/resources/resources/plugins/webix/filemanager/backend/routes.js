module.exports = function(app){
	const root = "/filemanager/samples/server";

	require("./files")(app, root);
	require("./dynamicFiles")(app, root);
	require("./dynamicBranch")(app, root);

	// error, preview
	require("./other")(app, root);
}