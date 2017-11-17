/*jshint esversion: 6 */
let jwtClient;

const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const google = require('googleapis');
const sheets = google.sheets({
  version: 'v4',
  auth: jwtClient
});

const encrypted = process.env.private_key;
let decrypted;

function getHeader() {
  return new Promise(function(resolve, reject) {

    sheets.spreadsheets.get({
      auth: jwtClient,
      spreadsheetId: process.env.SPREADSHEET_ID,
      includeGridData: true,
      ranges: 'A1:Z1'
    }, function(err, data) {
      if (err) {
        reject(Error(err));
      } else {
        resolve(data.sheets[0].data[0].rowData[0].values);
      }
    });

  });
}

function mapColumns(dataPackage) {
  return new Promise(function(resolve, reject) {

  let row = [];
  dataPackage.header.forEach(function(cell) {
    let foundProperty = false;
    for (const property in dataPackage.event) {
      if (property === cell.formattedValue) {
        row.push(property);
      }
    }
    if (foundProperty === false) row.push(null);
  });

  console.log(mapping);
  resolve(mapping);

  });
}

function authorize(event, context, callback) {
  jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    decrypted.split('\\n').concat().join('\n'), ['https://www.googleapis.com/auth/spreadsheets'], // an array of auth scopes
    null
  );

  jwtClient.authorize(function(err, tokens) {
    if (err) {
      console.error(err);
      callback(err);
    } else {
      getHeader().then(function(data) {
        const dataPackage = {header: data, event: event};
        return dataPackage;
      }).then(mapColumns).catch(function(err) {
        callback(err);
      });
    }
  });
}

exports.handler = (event, context, callback) => {
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
