const fs = require('fs');
const util = require('util');
const parse = require('csv-parse');
const jsonfile = require('jsonfile');
const json2csv = require('json2csv').Parser;

const FILE_A_NAME = process.argv[2] + '.csv' || 'error';
const FILE_B_NAME = process.argv[3] + '.csv' || 'error';

const RESULT_FILE_NAME = process.argv[4] || 'combined.csv';

if(FILE_A_NAME === 'error' || FILE_B_NAME === 'error') throw 'Insert file names to compare';

start();

function start() {
	
	var fileAData;
	var fileBData;

	scanFile(FILE_A_NAME, dataA => {
		
		console.log('\n'+dataA.length + ' records in ' + FILE_A_NAME);

		fileAData = dataA;

		scanFile(FILE_B_NAME, dataB => {
			
			console.log(dataB.length + ' records in ' + FILE_B_NAME+'\n');

			fileBData = dataB;

			compareFiles(fileAData, fileBData);
		})
	})
}

function compareFiles(fileAData, fileBData) {

	var fileAHeaders = [];
	var fileBHeaders = [];
	var results = [];

	for(field in fileAData[0]) {
		fileAHeaders.push(field);
	}

	for(field in fileBData[0]) {
		fileBHeaders.push(field);
	}

	console.log(fileAHeaders.length);
	console.log(fileBHeaders.length);
	// if(fileAHeaders.length > fileBHeaders.length)

	// createCsv(results);
}


function createCsv(data) {
	try {
		var parser = new json2csv();
		var csv = parser.parse(data);

		fs.writeFile(RESULT_FILE_NAME, csv, function(err) {

			if(err) throw err;

			console.log('Csv Created');
		})
	} catch(err) {
		throw err;
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
