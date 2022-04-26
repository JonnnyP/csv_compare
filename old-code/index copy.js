const fs = require('fs');
const util = require('util');
const parse = require('csv-parse');
const jsonfile = require('jsonfile');
const json2csv = require('json2csv').Parser;

const FILE_MISSING_DATA = process.argv[2] || 'error';
const ORIGINAL_FILE = process.argv[3] || 'error';
const OUTPUT_FILE = process.argv[4] || 'new_records.csv';

if(FILE_MISSING_DATA === 'error' || ORIGINAL_FILE === 'error') throw 'Insert file names to compare';

start();

function start() {
	
	var F_M_DATA;
	var O_F_DATA;

	scanFile(FILE_MISSING_DATA, data => {
		
		console.log(data.length + ' records in ' + FILE_MISSING_DATA);
		F_M_DATA = data;

		scanFile(ORIGINAL_FILE, data => {
			
			console.log(data.length + ' records in ' + ORIGINAL_FILE);
			O_F_DATA = data;


			compareFiles(F_M_DATA, O_F_DATA);
		})		
	})

}

function compareFiles(file_missing_data, original_file) {

	var results = [];

	for(var i = 0; i<original_file.length; i++) {

		var copy = false;

		for(var j = 0; j<file_missing_data.length; j++) {

			if(original_file[i].Affidavit_ID === file_missing_data[j].Affidavit_ID) copy = true;

			if(j === (file_missing_data.length-1) && !copy) {

				results.push(original_file[i]);
			}
		}
	}

	createCsv(results);
}

function createCsv(data) {

	try {
		var parser = new json2csv();
		var csv = parser.parse(data);

		fs.writeFile('./data/' + OUTPUT_FILE, csv, function(err) {

			if(err) console.log(err);

			console.log('Csv Created');
		})
	} catch(err) {
		console.log(err);
	}
}

function scanFile(file_name, callback) {
	fs.createReadStream(file_name).pipe(parse({
		delimeter: ',', 
		columns: true
	}, (err, data) => {
		if(err) throw err;

		callback(data);
	}))
}