'use  strict';

const {
  getCraigsCityHtml,
  parseCitiesHtmlToList,
  getSearchData,
  getThumbnailImage,
  generateHtmlPage
} = require('./app/utilities');
const {
  searchQuery,
  htmlOutputFile,
  devMode,
  runScript
} = require('./app/config')

console.log('Searching...')

if (runScript) {
  getCraigsCityHtml()
  .then((res) => {
    // console.log('-------', res)
    console.log('Recieves html res', res.length);
    return parseCitiesHtmlToList(res)
  })
  .then(function(res) {
    return getSearchData(res, searchQuery)
    // let hrefArrayMock = /['http://www.brianfogg.com', 'http://www.google.com']
    // return hrefArrayMock
  })
  .then((res) => {
    console.log('about to generate page', res)
    return generateHtmlPage(res)
  })
  .then((res) => {
    console.log('================= Done! ====================')
  })
} else {
  console.log('Run script set to false')
}
