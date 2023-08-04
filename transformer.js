const fs = require("fs");
const csv = require("csvtojson");
const { transformRow } = require("./transform.js");
const { Transform, pipeline } = require("stream");

var numRows = 0;
exports.doTransform = function(options) {
  
  const lineToArray = new Transform({
    transform (chunk, encoding, cb) {
      // add [ to very front
      // add , between rows
      // remove crlf from row
      this.push((this.isNotAtFirstRow ? ',' : '[') + chunk.toString('utf-8').slice(0, -1));
      this.isNotAtFirstRow = true;
      cb();
    },
    flush(cb) {
      // add ] to very end or [] if no rows
      const isEmpty = (!this.isNotAtFirstRow);
      this.push(isEmpty ? '[]' : ']');
      cb();
    }
  });
    
const transformRowStream = new Transform({
    
    transform: function(row, encoding, callback) {
        
      try { 
        var rowStringRaw = row.toString();
        var firstRow = false;
        var middleRow = false;
        if(rowStringRaw.substring(0,1) == '[') {
          rowStringRaw = rowStringRaw.substring(1);
          firstRow = true;
        }
        else if(rowStringRaw.substring(0,1) == ',') {
          middleRow = true;
          rowStringRaw = rowStringRaw.substring(1);
        }
        else if(rowStringRaw == ']') {
          callback(null, ']');
          return;
        }
        const rowObject = JSON.parse(rowStringRaw);
        const transformedRow = transformRow(rowObject, options);
        var rowString = JSON.stringify(transformedRow);
        if(firstRow) {
          rowString = '[' + rowString;
        }
        else if(middleRow) {
          rowString = ',' + rowString
        }
        else if (options.outputFormat === 'ndjson') {
          rowString = rowString + '\n';
        }
        process.stdout.write(++numRows + " rows written.\r");

        callback(null, rowString);
      } catch (err) {
        callback(err);
      }
    }
  });

const inputStream = fs.createReadStream(options.inputFile);
const outputStream = fs.createWriteStream(options.outputFile); //, { 'flags': 'a' });

outputStream.on('finish',function() {console.log("Pipeline completed successfully (" + numRows + " rows.)")})

const csvParser = options.checkTypes === 'true' ? csv({checkType: true,downstreamFormat: 'line'}) : csv({downstreamFormat: 'line'});
//const csvParser = csv({checkType: true,downstreamFormat: 'line'});


  
if(options.outputFormat === 'json') {
  inputStream
  .pipe(csvParser)
  .pipe(lineToArray)
  .pipe(transformRowStream)
  .pipe(outputStream);
}

else {
  pipeline(inputStream,csvParser,transformRowStream,outputStream, err => {
   
    if (err) {
      console.log("\nPipeline encountered an error:", err);
    } 
  });
}
}
