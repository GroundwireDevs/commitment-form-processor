/*jshint esversion: 6 */
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const ses = new AWS.SES();

function sendTemplatedEmail(to, template) {
  return new Promise(function(resolve, reject) {

    const params = {
      Destination: {
        ToAddresses: [
          to
        ]
      },
      Source: process.env.FROM_NAME + ' <' + process.env.FROM_ADDRESS + '>',
      Template: template,
      TemplateData: '{}'
    };

    new AWS.SES().sendTemplatedEmail(params, function(err, data) {
      if (err) reject(Error(err)); // an error occurred
      else resolve(data); // successful response
    });

  });

}

// event example
const input = {
  stateMachineArn: null,
  body: {
    type: 'salvation',
    language: 'en',
    firstName: 'Testy',
    lastName: 'McTesterson',
    email: 'testym@example.com',
    commitment: 'yes'
  }
};

exports.handler = (event, context, callback) => {
  console.log(event);

};
