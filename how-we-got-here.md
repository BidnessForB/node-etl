# How We Got Here
 - Knew that we were going to be transforming CSV files to JSON, with schema transformation along the way.
 - Knew that any legit solution would have to accommodate datasets of any size, so we'd be using streams.
 - Searched for 'csv etl transform nodejs', first result was a [heynode tutorial](https://heynode.com/tutorial/use-streams-extract-transform-and-load-csv-data/).
 - That in turn led me to https://github.com/osiolabls/etl-streams-starter
 - This pretty handily transformed CSV to NDJSON, which seemed reasonable as ndjson is line oriented and works well with *nix stuff
   - ?? What are we doing with this output anyway ?? 
 - Needed command line parsing, I've used [command-line-args](https://www.npmjs.com/package/command-line-args) / [command-line-usage](https://www.npmjs.com/package/command-line-usage) before so that was easy
 - Cool, now for absolutely no reason let's output regular JSON too!!
 - Oh no, streams, not so straightforward to append proper JSON tokens to first/last lines, seperate objects with ',' and create valid JSON output file.
 - More mad googling led me to try various ways to prepend/append, all of which relied on readFile/writeFile and so were incompatible with streams and in any case no good for large files
 - But csvtojson has the downstreamFormat parser option, which when set to 'array' should output valid JSON!  Right?
 - It does not, there's a [bug](https://github.com/Keyang/node-csvtojson/issues/333#) that hasn't been fixed.  Same with the 'line' option that should output NDJSON
 - boo.jpeg
 - But there is a [workaround](https://github.com/Keyang/node-csvtojson/issues/333#issuecomment-561096867)!  Thanks [@oliverfoster](https://github.com/oliverfoster)!
 - Adapted Oliver's code to create a second transform stream to handle creating a valid JSON array, and injected the results from that into the existing transformplanet.  Required some hackery that I may regret later but it works.

## Learnings
 - [csvtojson](https://github.com/Keyang/node-csvtojson/blob/master/docs/csvtojson-v2.md) was the first library I grabbed, and I just now realized I wasn't even using V2 🤦
 - Streams are hard, but awesome.  Lots of opportunities to learn the full range of possibilities here.  

## If I had more time  

- [ ] Retrieve data from REST API / GraphQL API
- [ ] Make planet transform (transformer.js) a dynamic / configurable module, pass in a transform mapping at runtime.  
- [ ] Figure out how to group elements (eg, in this case perhaps on pl_hostname)
- [ ] Create module
- [ ] Integrate with GitHub actions

