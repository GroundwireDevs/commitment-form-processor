/*jshint esversion: 6 */
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const GoogleSpreadsheet = require('google-spreadsheet');

const encrypted = process.env['private_key'];
let decrypted;

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(process.env.SPREADSHEET_KEY);

function setAuth() {
  return new Promise(function(resolve, reject) {

    var creds = {
      client_email: process.env.client_email,
      private_key: decrypted
    };

    doc.useServiceAccountAuth(creds, function(err, data) {
      if (err) console.log(err);
      else console.log(data);
      
      if (err) reject(Error(err));
      else resolve(data);
    });

  });
}

function writeRow(event) {
  return new Promise(function(resolve, reject) {

    doc.addRow(1, event, function(err, data) {
      if (err) reject(Error(err));
      else resolve(data);
    });

  });
}

function processEvent(event, context, callback) {
  decrypted = decrypted.split('\\n').concat().join('\n');
  setAuth().then(function() {
      return event;
    }).then(writeRow(event)).then(function(data) {
      callback(data);
    }).catch(function(err) {
      callback(err);
    });
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
