/*jshint esversion: 6 */
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const google = require('googleapis');
const sheets = google.sheets('v4');

const encrypted = process.env['private_key'];
let decrypted;

function processEvent(event, context, callback) {
  let jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    decrypted.split('\\n').concat().join('\n'), ['https://www.googleapis.com/auth/sheets'], // an array of auth scopes
    null
  );

  jwtClient.authorize(function(err, tokens) {
    if (err) {
      console.error(err);
      callback(err);
    }

    // Make an authorized request
    sheets.spreadsheets.get({
      auth: jwtClient
    }, function(err, data) {
      // handle err and response
    });

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
