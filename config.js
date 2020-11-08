
// drum kits
// let searchQuery = 'search/sss?query=ludwig+vintage+kit&sort=rel&hasPic=1&min_price=1000&max_price=2000';

// guitars
// let searchQuery = 'search/sss?query=rickenbacker+12+string&sort=rel&hasPic=1&min_price=1000&max_price=4000';

// 4 runner
// let searchQuery: 'search/sss?query=4+runner&sort=rel&min_auto_year=1995&max_auto_year=2002&auto_transmission=1'

// land cruiser manual
// let searchQuery = 'search/sss?query=land+cruiser&sort=rel&min_auto_year=1990&max_auto_year=1997&auto_transmission=1'

// porsche targa
let searchQuery = 'search/cta?query=targa&min_price=10000&max_price=40000&auto_make_model=porsche&max_auto_year=2000'

var config = {
  runScript: true,
  searchQuery: searchQuery,
  htmlOutputFile: './html_output.html'
};


exports.config = config;