/*jshint esversion: 6 */
let jwtClient;

const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const google = require('googleapis');
const sheets = google.sheets({
  version: 'v4',
  auth: jwtClient
});

const encrypted = process.env['private_key'];
let decrypted;

function mapColumns(event) {

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
        mapColumns(event);
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
