
// drum kits
// let searchQuery = 'query=ludwig+vintage+kit&sort=rel&hasPic=1&min_price=1000&max_price=2000';

// guitars
// let searchQuery = 'query=rickenbacker+12+string&sort=rel&hasPic=1&min_price=1000&max_price=4000';

// 4 runner
// let searchQuery: 'query=4+runner&sort=rel&min_auto_year=1995&max_auto_year=2002&auto_transmission=1'

// land cruiser manual
let searchQuery = 'query=land+cruiser&sort=rel&min_auto_year=1990&max_auto_year=1997&auto_transmission=1'

// cheap land cruisers
// let searchQuery = 'query=land+cruiser&min_price=2000&max_price=5000&auto_drivetrain=3&auto_transmission=1'

// let searchQuery = 'query=land+cruiser&sort=rel&min_auto_year=1990&max_auto_year=1997'


// let searchQuery = 'search/sss?sort=rel&query=behringer+x32'

var config = {
  runScript: true,
  searchQuery: searchQuery,
  // searchQuery: 'search/cta?sort=rel&auto_make_model=land+cruiser&min_auto_year=1990&max_auto_year=1997&auto_transmission=1',
  htmlOutputFile: './html_output.html'
};


exports.config = config;