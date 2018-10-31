// Desired output semi working
// TODO: Overall code structure, restructure promises, break promise chain, create new csv file with records missing

const fs = require('fs');
const util = require('util');
const async = require('async');
const parse = require('csv-parse');
var csvHeaders = require('csv-headers');

new Promise((resolve, reject) => {
    csvHeaders({
        file      : 'CA-RETAIL--10-30.csv',
        delimiter : ','
    }, function(err, headers) {
        if (err) reject(err);
        else resolve({ headers });
    });
})
.then(context => {
	// console.log(context);
    return new Promise((resolve, reject) => {
		fs.createReadStream('CA-RETAIL--10-30.csv').pipe(parse({
		    delimiter: ',',
		    columns: true,
		    relax_column_count: true
		}, (err, data) => {
		    if (err) return reject(err);
		    // console.log(data);
		    var new_records = [];
		    async.each(data, (datum, next) => {
		        // console.log(datum);
		        var d = [];
		        try {
		            context.headers.forEach(hdr => {
		                d.push(datum[hdr]);
		            });
		        } catch (e) {
		            console.error(e.stack);
		        }

		        // Scan second csv file for this record
		        if(d[0] != 'License Number') {
		        	console.log('Scanning for: ', d[0]);
			        var r_status = is_copy(d[0]);
			        if (r_status) new_records.push(d);
		        }
		        
		    },
		    err => {
		        if (err) reject(err);
		        else resolve(context);
		    });
		}));
    });
})

function is_copy(license_number) {
	new Promise((resolve, reject) => {
	    csvHeaders({
	        file      : 'CA-RETAIL--OLD.csv',
	        delimiter : ','
	    }, function(err, headers) {
	        if (err) reject(err);
	        else resolve({ headers });
	    });
	})
	.then(context => {
		// console.log(context);
	    return new Promise((resolve, reject) => {
			fs.createReadStream('CA-RETAIL--OLD.csv').pipe(parse({
			    delimiter: ',',
			    columns: true,
			    relax_column_count: true
			}, (err, data) => {
			    if (err) return reject(err);
			    // console.log(data);
			    var no_match = 0;
			    // var match = 0;
			    var match_found = false;
			    async.each(data, (datum, next) => {
			        // console.log(datum);
			        var d = [];
			        try {
			            context.headers.forEach(hdr => {
			                d.push(datum[hdr]);
			            });
			        } catch (e) {
			            console.error(e.stack);
			        }

			        if (license_number == d[0]) { // match found
				   		// console.log('######_____________OLD RECORD_____________#####')
				     //    console.log('first', license_number);
				     //    console.log('second', d[0]);
				     //    console.log(no_match);
				        // match++;
				        match_found = true;
				        resolve({license_number, match_found});
			    	} else { // no match found

			    		// console.log('\nfirst', license_number);
				    	// console.log('second', d[0]);
				        no_match ++;
			    	}

			    	if (no_match > 439) {
			    		// console.log('\n',license_number, d[0]);
			    		// console.log(no_match);
			    		if(no_match === 441) {
			    			match_found = false;
			    			resolve({license_number, match_found});
			    		}
			    	}

			    },
			    err => {
			        if (err) reject(err);
			        else resolve(context);
			    });
			}));
	    });
	})
	.then(context => {
		// console.log('\n$$IN CONTEXT$$');
		if (!context.match_found) {
			console.log(context)	
		}
	})
}