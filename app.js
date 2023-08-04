//HOW DID WE GET HERE:
// Knew that we'd want to use streams to accommodate potentially large files
// Needed a cool CSV data set
// Searched for 'csv etl transform nodejs', led me to heynode tutorial (first result) (https://heynode.com/tutorial/use-streams-extract-transform-and-load-csv-data/)
// Their version of the CSV data is obsolete, so I downloaded the planetary_systems_complete CSV from here: https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=PSCompPars
// That led me to https://github.com/osiolabls/etl-streams-starter
// This pretty handily transformed CSV to NDJSON, which seemed reasonable as ndjson is line oriented and works well with *nix stuff
// ?? What are we doing with this output anyway ?? 
// Needed command line parsing, I've used command-line-args / command-line-usage before so that was easy
// Cool, but let's output regular JSON too!!
// Oh no, streams, not so straightforward to append proper JSON tokens to first/last lines, seperate objects with ',' and create valid JSON output file
// Mad googling led me to try various ways to prepend/append, all of which relied on readFile/writeFile and so were incompatible with streams and in any case no good for large files
// csvtojson has the downstreamFormat parser option, which when set to 'array' should output valid JSON!
// except it doesn't, there's a bug that hasn't been fixed.  Same with the 'line' option that should output NDJSON 
// boo
// Finally ended up on the csvtojson repo at this issue: https://github.com/Keyang/node-csvtojson/issues/333#issuecomment-561096867
// Thanks @oliverfoster!  adapted your code to create a second transform stream, injected the results into transformplanet and then hacked the planet transform to inject the correct tokens in the correct places
// Tweaked the planetary transformer (transform.js) to accommodate changes to column names.
// In retrospect could probably combine the two transforms, but this works.  
// Enhancements: retrieve data from REST API / GraphQL API
// Make planet transform (transformer.js) a dynamic / configurable module
// Figure out how to group elements (eg, in this case perhaps on pl_hostname)
// Make all of it a module.  
// Make it all into a github workflow

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const transformer = require('./transformer.js');
var options = [];
  
const optionDefinitions = [
    { name: 'inputFile', alias: 'i', type: String, description: "Input CSV file path (planetary_systems_complete.csv)",defaultValue:"planetary_systems_complete.csv"},
    { name: 'outputFile', alias: 'o',type: String, description: "Output file path (output.(nd)json",defaultValue:"data"},
    //{ name: 'url', alias: 'u', type: String, description: "Data source URL" },
    //{ name: 'token', alias: 't', type: String, description:"Data source token", optional: true},
    { name: 'outputFormat', alias: 'f', type: String, description: "Output data format: 'json' or 'ndjson'.  Default is ndjson. will be appended to outputFile as extension",defaultValue:'ndjson' },
    { name: 'missingDataToken', alias: 'm', type: String, description: "Replace missing data with this token.  Default is 'MISSING'.",defaultValue:'MISSING' },
    { name: 'checkTypes', alias: 'c', type: String, description: "Check types.  Default is 'true'.  If false everything's a string.",defaultValue:'true' },
    { name: 'errorToken', alias: 'e', type: String, description: "Value for calculated fields with errors.  Default is null",defaultValue:null },
    { name: 'help',alias: 'h', description: "Output this usage guide"}
  ];

  const sections = [
    {
      header: 'CSV Transformer',
      content: 'Take some CSV and transfigulate it into differently shaped JSON (or ndjson)'
    }
  ]
  


  

sections.push({header:'Options',optionList:JSON.parse(JSON.stringify(optionDefinitions))});
const usage = commandLineUsage(sections);

try {
     options = commandLineArgs(optionDefinitions);
     options.outputFile = options.outputFile + '.' + options.outputFormat;
     if(options.hasOwnProperty('help') && options.help == null) {
      console.log(usage);
      process.exit(0);
    }
    if(options.outputFormat !== 'json' && options.outputFormat !== 'ndjson') {
      console.log("Error launching Transformer: Output format must be 'json' or 'ndjson'");
      console.log(usage);
      process.exit(1);
    }
}



catch(e) {
    if(e.name == 'UNKNOWN_VALUE' && e.value == '') {
        console.log("Error launching Transformer: Missing required arguments");
    }
    else if(e.name == 'UNKNOWN_OPTION')
    {
        console.log("Error launching Transformer: " + e.name + ": " + e.optionName);
    }
    
    console.log(usage);
    process.exit(1);
  }

  transformer.doTransform(options);






