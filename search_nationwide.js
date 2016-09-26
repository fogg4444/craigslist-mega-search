'use  strict'; // V8 only can only use block scopes in strict mode

var cheerio = require('cheerio');
var request = require('request');
var Mustache = require('mustache');
var fs = require('fs');

console.log('Searching...')

/////////////////////////////////
/////////////////////////////////

let searchQuery = 'search/cta?sort=rel&auto_make_model=land+cruiser&min_auto_year=1990&max_auto_year=1997&auto_transmission=1';
let htmlOutputFile = './html_output.html'

/////////////////////////////////
/////////////////////////////////

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
                  
                  getThumbnailImage(completeLink)
                  .then((res) => {
                    hrefList.push({
                      completeLink: completeLink,
                      image: res
                    })
                  })
                  
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
    // console.log('generateHtmlPage from: ', hrefList)
    let output = ''

    for( var i in hrefList) {
      let thisHref = hrefList[i]
      let view = {
        url: thisHref.completeLink,
        image: thisHref.image
      };
      // console.log('VIEW: ', view)
      output = output + Mustache.render("<a href={{url}}><img src={{image}} width='200'></img></a>", view);
      // console.log(output)
    }

    fs.writeFileSync(htmlOutputFile, output)
    
    resolve('done')
  })
}

getCraigsCityHtml()
.then((res) => {
  return parseCitiesHtmlToList(res)
})
.then(function(res) {
  return getSearchData(res, searchQuery)
  // let hrefArrayMock = /['http://www.brianfogg.com', 'http://www.google.com']
  // return hrefArrayMock
})
.then((res) => {
  console.log(res)
  return generateHtmlPage(res)
})
.then((res) => {
  console.log('================= Done! ====================')
})







