var Spreadsheet = require('edit-google-spreadsheet');
var cheerio = require('cheerio');
var request = require('request');

//var url = 'https://www.bitquick.co/buy-2?bank=Wells%20Fargo';
var url = 'https://www.bitquick.co/buy-2';

// FUNCTION TO LOAD THE SPREADSHEET AND WORKSHEET
Spreadsheet.load({
    // Spreadsheet and Worksheet can be specified using their "Names"
    // However, the library will notify you of a more optimal set of IDs
    // to use for more efficient lookups, so I replaced them

    spreadsheetName: 'Scrape Test',
    // OR
    //spreadsheetId: '1G7NnWnYz3JVqFvUK8tziTugtfaCvllSxD-L6Pl3j8bw',
    worksheetName: 'Sheet1',
    // OR
    //worksheetId: 'od6',

    // I had the biggest problem figuring out how to do the authentication
    // I was a bit stuck until I came across this article:
    // See http://goo.gl/eePiB6 for information about API key and auth
    oauth: {
        // Service account email:
        email: 'ofttekkb50le87ftnaa4b15sv@developer.gserviceaccount.com',
        // Create the PEM file and place it here, or adjust the path:
        keyFile: 'docs_api.pem'
    },

    debug: true
},
  // When it is complete, this callback function is called:
  function sheetReady(err, sheet) {
    if(err) throw err;

    //use speadsheet!
    console.log('Spreadsheet ready...');

    // We can now call methods on the worksheet,
    // first, "receive" will give us the current worksheet/data
    sheet.receive(function(err,rows,info) {

        // I'm going to keep track of the row IDs that are in the sheet
        // See below for the idMap() function
        var seen = idMap(rows,info);

        // Next, scrape the data from the URL (see scrapeData() below)
        // I wrote this function to use a callback, so the function
        // shown here is called after the data is scraped
        scrapeData(function(err,scrapeData) {

            // Do a "filter()" of the scraped data, to filter out
            // all rows which have an existing ID in the spreadsheet
            scrapeData = scrapeData.filter(function(i) {
              if (seen.indexOf(parseInt(i[0])) == -1) return true;
            });

            // Kind of a funky way that the data is prepared for
            // the .add() method ... results in a data strcture like this:
            // { "5":
            //   [
            //     [ "23432", "Wells Fargo", ... ], 
            //     [ "23987", "Wells Fargo", ... ], 
            //   ]
            // }
            //   ... weird because it's an object with a numeric key
            //   ... the numeric key is the row to start on (info.nextRow)
            var data = {};
            data[info.nextRow] = scrapeData;

            // Only update the spreadsheet if there are new rows
            if (scrapeData.length) {
                sheet.add(data);

                // Send the added data to Google Docs
                sheet.send(function(err) {
                    if (err) throw err;
                    console.log("Updated sheet!");
                });
            }
            else console.log('No new rows');

        });
    });

});

// FUNCTION TO SCRAPE THE DATA FROM THE URL
function scrapeData(callback) {
    var data = {}; // results go here

    // do the request using the request library
    request(url, function(err, resp, body) {

        // using the cheerio library to do the scaping
        // it has an interface similar to a limited jquery
        // I would have rather used jsdom, which would've allowed
        // using actual jquery, but this seemed a little quicker
        // see cheerio vs. jsdom examples here: http://goo.gl/LT9CX2
        $ = cheerio.load(body);

        var $tab = $('table.table-bordered.table-hover');
        var table = [];

        // Loop over each table row
        $tab.find('tr').each(function(i,html) {
            var cols = [];

            // Push each table data cell value onto cols array
            $(html).find('td').each(function(i,html) {
                cols.push($(html).text());
            });

            // Push complete cols array onto table array
            table.push(cols);
        });

        // Remove the first (header) row
        table.shift();

        // When done, call the callback with the table data
        callback(null,table);
    });

};

// Builds an array of IDs we've seen. This is also funky,
// because of the data structure the library returns for the Google Doc.
function idMap(rows,info) {
  var count_to = info.lastRow;
  var out = [];
  for(var i=2; i <= count_to; i++) {
    out.push(rows[i.toString()]['1']);
  }
  return out;
}

