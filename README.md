# Transform CSV to NDJson and Json

Simple demo app that uses [nodejs streams](https://nodejs.org/api/stream.html) to ingest a CSV data file, transform it to NDJson or JSON, perform additional transforms on the data itself, and then write the results to a file.  

This app uses the [Planetary Systems Composite table from the NASA Expolanet Archive](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=PSCompPars).  The data are stored in the Planetary_Systems_Complete.csv file in this repo.  

## Background

Some [thoughts](https://github.com/BidnessForB/node-etl/blob/main/how-we-got-here.md) on the thought process and generally meandering path I followed to create this hack

## Getting Started
```bash
git clone git@github.com:BidnessForB/node-etl.git
npm install
```
## Running
`node app.js <options>`

## Options
```bash
-i, --inputFile string          Input CSV file path (planetary_systems_complete.csv)              
-o, --outputFile string         Output file path (output.(nd)json             
-f, --outputFormat string       Output data format: 'json' or 'ndjson'.       
-m, --missingDataToken string   Replace missing data with this token.         
-c, --checkTypes string         Check types (true)
-e, --errorToken string         Value for calculated fields with errors (ERROR)
-h, --help string               Output this usage guide    
``````

