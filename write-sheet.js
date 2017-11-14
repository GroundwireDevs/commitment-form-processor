/*jshint esversion: 6 */
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const encrypted = process.env['private_key'];
let decrypted;

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(process.env.SPREADSHEET_KEY);
var sheet;

function setAuth() {
  return new Promise(function(resolve, reject) {

  var creds = {
    client_email: process.env.client_email,
    private_key: decrypted
  };

  doc.useServiceAccountAuth(creds, function(err, data) {
    if (err) reject(Error(err));
    else resolve(data);
  });

  });
}

function getAllCells() {
  return new Promise(function(resolve, reject) {

    const options = {
      'min-row': 1,
      'max-col': 1,
      'return-empty': false
    };

    doc.getCells(1, options, function(err, cells) {
      if (err) reject(Error(err));
      else resolve(cells);
    });

  });
}

function writeRow(cells) {
    return new Promise(function(resolve, reject) {

      const nextRow = cells.length + 1;
      console.log('Next empty row is ' + nextRow);


    });
}

function processEvent(event, context, callback) {
  setAuth.then(getAllCells).then(findNextEmptyRow).then()
}

exports.handler = (event, context, callback) => {
  if (decrypted) {
    processEvent(event, context, callback);
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
      processEvent(event, context, callback);
    });
  }
};
