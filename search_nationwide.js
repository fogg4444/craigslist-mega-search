'use  strict'; // V8 only can only use block scopes in strict mode

var cheerio = require('cheerio');
var request = require('request');
var mustache = require('mustache');

console.log('Searching...')

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
    let $ = cheerio.load(html)
    let pagecontainer = cheerio.load($('#pagecontainer').html())
    let body = cheerio.load( pagecontainer('.body').html() )
    let usCitiesColumn = cheerio.load( body('.colmask').html() )
    let usCitiesAlinks = usCitiesColumn('a')
    let hrefList = []
    for(let i in usCitiesAlinks) {
      let thisCity = usCitiesAlinks[i]
      if (thisCity.attribs) {
        if (thisCity.attribs.href) {
          // console.log('j')
          hrefList.push(thisCity.attribs.href)
        }
      }
    }
    // console.log(hrefList)
    resolve( hrefList )
  })
}


let getSearchData = (cities, query) => {
  return new Promise((resolve, reject) => {
    let cityCount = cities.length
    let citiesComplete = 0;
    let hrefList = []

    var i = 0, howManyTimes = cityCount, requestDelay = 100;
    
    function f() {
      let thisCity = cities[i]
      let formattedQuery = 'https:' + thisCity + query;
      
      // code goes here...
      let options = {
        timeout: 10000
      }
      request(formattedQuery, options, (error, response, body) => {
        if (error) {
          console.log('Error: ' + thisCity + error + citiesComplete + ' / ' + cityCount);
          citiesComplete ++
        } else if (!error && response.statusCode == 200) {
          let $ = cheerio.load(body)
          let searhResultsPage = cheerio.load( $('#sortable-results').html() )
          let resultsDiv = cheerio.load( searhResultsPage('.rows').html() )
          let resultsALink = resultsDiv('a')

          for( let i in resultsALink ) {
            let thisElement = resultsALink[i]
            if (thisElement.attribs) {
              if (thisElement.attribs.href) {
                let href = thisElement.attribs.href
                if (href[0] !== 'h') {
                  href = href.slice(1)
                  let completeLink = 'https:' + thisCity + href
                  // console.log(completeLink)
                  console.log(' ============ Hit! ============')
                  hrefList.push(completeLink)
                }
              }
            }
          }

          let beautyCityName = thisCity.slice(2).slice(0, -16)
          console.log(beautyCityName + ' complete' + ' ' + citiesComplete + ' / ' + cityCount)
          citiesComplete ++
        } else {
          console.log('Unknown condition - ' + citiesComplete + ' / ' + cityCount)
          citiesComplete++
        }
        if (citiesComplete === cityCount) {
          resolve(hrefList)
        }
      })

      i++;
      if( i <= howManyTimes ){
        setTimeout( f, requestDelay );
      }
    }
    f();
  })
}

let generateHtmlPage = (hrefList) => {
  return new Promise((resolve, reject) => {
    
  })
}

getCraigsCityHtml()
.then((res) => {
  return parseCitiesHtmlToList(res)
})
.then(function(res) {
  let query = 'search/cta?sort=rel&auto_make_model=land+cruiser&min_auto_year=1990&max_auto_year=1997&auto_transmission=1';
  return getSearchData(res, query)
})
.then((res) => {
  console.log('Final output', res)
})







