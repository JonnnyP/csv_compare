// Desired output semi working
// TODO: Overall code structure, restructure promises, break promise chain, create new csv file with records missing

const fs = require('fs');
const util = require('util');
const async = require('async');
const parse = require('csv-parse');
const csvHeaders = require('csv-headers');
const jsonfile = require('jsonfile');
const json2csv = require('json2csv').Parser;

new Promise((resolve, reject) => {
    csvHeaders({
        file      : 'CA-RETAIL.csv',
        delimiter : ','
    }, function(err, headers) {
        if (err) reject(err);
        else resolve({ headers });
    });
})
.then(context => {
	// console.log(context);
    return new Promise((resolve, reject) => {
		fs.createReadStream('CA-RETAIL.csv').pipe(parse({
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
			        var r_status = is_copy(d);
			        if (r_status) new_records.push(d);
		        }
		        
		    },
		    err => {
		        if (err) reject(err);
		        else resolve(context);
		        // console.log(new_records);
		    });
		}));
    });
})

function is_copy(record) {
	// console.log(record);
	var license_number = record[0];
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
				   		// console.log('###_OLD RECORD_###')
				     //    console.log('first', license_number);
				     //    console.log('second', d[0]);
				     //    console.log(no_match);
				        // match++;
				        match_found = true;
				        resolve({record, match_found});
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
			    			resolve({record, match_found});
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
			console.log(context.record);
			var r = context.record;
			var new_record = {
				"License_Number": r[0],
				"License_Designation": r[1],
				"Second_License_Number": "",
				"Business_Name": r[2],
				"DBA": r[3],
				"Record_Status": r[4],
				"Expiration_Date": r[5],
				"Business_Organization_Structure": r[6],
				"City": r[7],
				"Business_Phone": r[8],
				"Retail_Contact": "",
				"Address": "",
				"State": "CA",
				"Zip": ""
			}
			console.log(new_record);
			var fields = 	['License_Number', 
							'License_Designation',
							'Second_License_Number',
							'Business_Name','DBA',
							'Record_Status','Expiration_Date',
							'Business_Organization_Structure',
							'City','Business_Phone',
							'Retail_Contact','Address',
							'State','Zip'];
			var opts = {fields};

			try {
				var parser = new json2csv(opts);
				var csv = parser.parse(new_record);

				fs.appendFile('./data/new-record.csv', csv, function(err) {
					if(err) console.log(err);
					console.log('$$$DATA APPENDED$$$');
				});
				// console.log(csv);
			} catch(err) {
				console.log(err);
			}
		}
	})
}