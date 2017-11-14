/*jshint esversion: 6 */
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const ses = new AWS.SES();
const templateMapping = require('./template-map.json');

function sendTemplatedEmail(to, template, source) {
  return new Promise(function(resolve, reject) {

    const params = {
      Destination: {
        ToAddresses: [
          to
        ]
      },
      Source: source,
      Template: template,
      TemplateData: '{}'
    };

    console.log(templateMapping);
    console.log(params);

    ses.sendTemplatedEmail(params, function(err, data) {
      if (err) reject(Error(err)); // an error occurred
      else resolve(data); // successful response
    });

  });
}

exports.handler = (event, context, callback) => {
  const source = templateMapping[event.language][event.fromName] + ' <' + templateMapping[event.language][event.fromAddress] + '>';
  sendTemplatedEmail(event.email, templateMapping[event.language][event.type], source).then(function(data) {
    callback(null, data);
  }).catch(function(err) {
    console.error(err);
    callback(err);
  });
};
