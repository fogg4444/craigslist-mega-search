let devMode = true;
let cityScanLimit = 2;
// Keep this turned down while developing, don't want to trigger the CL blacklist!!


let searchLocation = 'rnr'
let searchQuery = 'query=love'

module.exports = {
  runScript: true,
  searchLocation,
  searchQuery,
  htmlOutputFile: './html_output.html',
  devMode,
  cityScanLimit
};
