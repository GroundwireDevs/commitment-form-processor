'use strict';

	let jwtClient;

// Get required libraries
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const google = require('googleapis');
const sheets = google.sheets({
	version: 'v4',
	auth: jwtClient
});

// Initalise variables for encryption function
const encrypted = process.env.private_key;
let decrypted;

// Gets the header row of spreadsheet
function getHeader() {
	return new Promise(function(resolve, reject) {

		sheets.spreadsheets.get({
			auth: jwtClient,
			spreadsheetId: process.env.SPREADSHEET_ID,
			includeGridData: true,
			ranges: 'A1:Z1' // Only goes from A to Z columns
		}, function(err, data) {
			if (err) {
				reject(Error(err));
			} else {
				resolve(data.sheets[0].data[0].rowData[0].values); // Resolves only the needed data
			}
		});

	});
}

// Gets a date string in mm/dd/yyyy format
function getFormattedDate() {
	const today = new Date();
	today.setHours(today.getHours() - 6); // Set date to Mountain Standard Time (subtact six hours)
	let dd = today.getDate();
	let mm = today.getMonth() + 1; // January is 0
	const yyyy = today.getFullYear();

	if (dd < 10) dd = '0' + dd;
	if (mm < 10) mm = '0' + mm;
	return mm + '/' + dd + '/' + yyyy;
}

// Maps the input data to the required ListValue format https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.ListValue
function mapColumns(dataPackage) {
	return new Promise(function(resolve) {

		let row = [];
		// Sets the first column as the date column and adds the date string
		dataPackage.event.date = getFormattedDate();
		// Cycles through each of the header rows, even if they are blank.
		dataPackage.header.forEach(function(cell) {
			let foundProperty = false;
			// Cycles through each of the event properties (from the form), trying to find a match, if so, the value of that property is added to the row.
			for (const property in dataPackage.event) {
				if (property === cell.formattedValue) {
					row.push(dataPackage.event[property]);
					foundProperty = true;
					break;
				}
			}
			// If no property was found, push a null value to the row so it is skipped.
			if (foundProperty === false) row.push(null);
		});
		resolve(row);

	});
}

// Adds the row to the spreadsheet
function appendRow(row) {
	return new Promise(function(resolve, reject) {

		sheets.spreadsheets.values.append({
			auth: jwtClient,
			spreadsheetId: process.env.SPREADSHEET_ID,
			range: 'A:Z', // Only goes from A to Z columns
			insertDataOption: 'INSERT_ROWS',
			valueInputOption: 'USER_ENTERED',
			resource: {
				range: 'A:Z', // Only goes from A to Z columns
				majorDimension: 'ROWS',
				values: [row]
			}
		}, function(err, data) {
			if (err) {
				reject(Error(err));
			} else {
				resolve(data);
			}
		});

	});
}

function authorize(event, context, callback) {
	jwtClient = new google.auth.JWT(
		process.env.CLIENT_EMAIL, // Sets the service account email that will be used
		null,
		decrypted.split('\\n').concat().join('\n'), // Sets the private key, replacing \n with actual new line characters.
		['https://www.googleapis.com/auth/spreadsheets'], // Auth scope for requests
		null
	);

	jwtClient.authorize(function(err) {
		if (err) {
			callback(err);
		} else {
			// If the user is authorized
			// Gets header row, creates a new row and then appends the row onto the spreadsheet
			getHeader().then(function(data) {
				const dataPackage = {
					header: data,
					event: event
				};
				return dataPackage;
			}).then(mapColumns).then(appendRow).then(function(data) {
				callback(null, data);
			}).catch(function(err) {
				callback(err);
			});
		}
	});
}

exports.handler = (event, context, callback) => {
	// Standard AWS encryption helper script
	if (decrypted) {
		authorize(event, context, callback);
	} else {
		// Decrypt code should run once and variables stored outside of the function
		// handler so that these are decrypted once per container
		const kms = new AWS.KMS();
		kms.decrypt({
			CiphertextBlob: new Buffer(encrypted, 'base64')
		}, (err, data) => {
			if (err) {
				console.log('Decrypt error:', err);
				return callback(err);
			}
			decrypted = data.Plaintext.toString('ascii');
			authorize(event, context, callback);
		});
	}
};
