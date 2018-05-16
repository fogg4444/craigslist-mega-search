'use  strict';

let cheerio = require('cheerio');
let request = require('request');
let Mustache = require('mustache');
let fs = require('fs');

const {
  searchQuery,
  htmlOutputFile,
  devMode,
  runScript,
  cityScanLimit,
  searchLocation
} = require('./config')

let getCraigsCityHtml = () => {
  return new Promise(function(resolve, reject) {
    request('https://www.craigslist.org/about/sites#US', (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    })
  })
}

let parseCitiesHtmlToList = (html) => {
  return new Promise((resolve, reject) => {
    console.log('About to start parsing cities html list');
    let $ = cheerio.load(html)
    let usCitiesColumn = cheerio.load( $('.colmask').html() )
    let usCitiesAlinks = usCitiesColumn('a')
    let hrefList = []
    console.log('========== usCitiesAlinks', usCitiesAlinks, usCitiesAlinks.length)
    let cityToScanCount = usCitiesAlinks.length
    if(devMode) {
      cityToScanCount = cityScanLimit
    }
    for(let i = 0; i < cityToScanCount; i++) {
      let thisCity = usCitiesAlinks[i]
      if (thisCity.attribs) {
        if (thisCity.attribs.href) {
          // console.log('j')
          hrefList.push(thisCity.attribs.href)
        }
      }
    }
    console.log('Final href list', hrefList)
    resolve( hrefList )
  })
}

let makeSearchQuery = (thisCity, thisQuery) => {
  return new Promise((resolve, reject) => {

    console.log('Make each search query', thisCity, thisQuery)
    let formattedQuery = thisCity + 'search/' + searchLocation + '?' + thisQuery;
    console.log('Search query', formattedQuery);
    let options = {
      timeout: 20000
    }
    request(formattedQuery, options, (error, response, body) => {
      if (error) {
        console.log('Error: ' + thisCity + ' -- '+ error);
        resolve(null)
      } else if (!error && response.statusCode == 200) {
        // console.log('Valid response', response)
        let $ = cheerio.load(body)
        let resultsList = $('#sortable-results').find('.rows').find('li')
        let formattedResultsArray = []
        resultsList.each((i, elem) => {
          let formattedResult = {
            imgUrl: null,
            postLink: null
          }
          elem.children.forEach((elem, i) => {
            if(elem.name === 'a') {
              formattedResult.postLink = elem.attribs.href
            }
          })
          // TODO: get images in here
          formattedResultsArray.push(formattedResult)
        })
        resolve(formattedResultsArray)
      } else {
        console.log('Unknown condition - ')
        resolve(null)
      }
    })
  })
}

let getSearchData = (cities, query) => {
  return new Promise((resolve, reject) => {

    let cityCount = cities.length
    let citiesComplete = 0;
    let searchDataList = {}

    console.log('GET SEARCH DATA', cities)

    let cityPromiseList = []
    cities.forEach((city, i) => {
      cityPromiseList.push(makeSearchQuery(city, query))
    })

    Promise.all(cityPromiseList)
    .then((res) => {
      console.log('Scanned all cites', res)
      // flatten results in to one giant array
      let flattenedResults = []
      res.forEach((eachArray, i) => {
        if(eachArray) {
          eachArray.forEach((elem, j) => {
            flattenedResults.push(elem)
          })
        }
      })
      resolve(flattenedResults)
    })
    .catch((err) => {
      reject(err)
    })
  })
}

let getThumbnailImage = (completeLink) => {
  return new Promise((resolve, reject) => {
    request(completeLink, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        let post = cheerio.load(body)
        let img = post('img')
        // console.log(img[0].attribs.src)
        if (img && img[0].attribs && img[0].attribs.src) {
          resolve( img[0].attribs.src )
        } else {
          resolve('no image')
        }
      }
    })
  })
}

let getPostContent = (completeLink) => {
  return new Promise((resolve, reject) => {
    request(completeLink, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        let post = cheerio.load(body)
        console.log('this post', post)
      } else {
        resolve('error, no contnet')
      }
    })
  })
}

let generateHtmlPage = (hrefList) => {
  // TODO: make this response to objects
  return new Promise((resolve, reject) => {
    console.log('generateHtmlPage from: ', hrefList)
    let timeStamp = Date.now()

    let output = '<h1>' + searchQuery + ' in: ' + searchLocation + '</h1><div>Timestamp:' + timeStamp + '</div><hr>'
    for( var i in hrefList) {
      let thisHref = hrefList[i]
      let view = {
        url: thisHref.postLink,
        image: thisHref.image
      };
      let eachTemplateElement = "<a href={{url}}><p>{{url}}</p></a>"
      output = output + Mustache.render(eachTemplateElement, view);
    }
    fs.writeFileSync(htmlOutputFile, output)
    resolve('done')
  })
}

module.exports = {
  getCraigsCityHtml,
  parseCitiesHtmlToList,
  getSearchData,
  getThumbnailImage,
  generateHtmlPage
}
