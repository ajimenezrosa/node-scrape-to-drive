Web Table Scrape to Google Spreadsheet
======================================

This script will scrape a web table and update a Google Spreadsheet with
the scraped rows. It can be easily modified for your purpose.

### Requisites

  * nodejs (and npm)
  * Google Docs API Service Account (see below)
  * Google Spreadsheet with write permission for Service Account (see below)
  * An internet connection

### Installation

After unzipping or cloning the archive, `cd` to the directory and run:

````bash
npm install
````

The npm package manager will install the required libraries.

### Setting up a spreadsheet with API access

This was (and is) the hardest part of the whole operation. See
[this article](http://goo.gl/eePiB6) for information about setting up
a service account and giving it access to your spreadsheet.

  * Replace the OAuth email
  * Create the PEM file and place it in this directory
  * Use spreadsheetName and worksheetName for your spreadsheet
  * When running the script with node, it will output worksheetId and spreadsheetId values
  * For better performance, replace the worksheetName and spreadsheetName with the IDs

### Running the script

````bash
node index.js
````

#### Released under MIT license
