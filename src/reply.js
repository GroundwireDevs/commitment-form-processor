'use strict';
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const ses = new AWS.SES({region: 'us-west-2'});
const templateMapping = require('./../template-map.json');

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
	if (event.testing === true) process.env._X_AMZN_TRACE_ID = 'Root=1-5759e988-bd862e3fe1be46a994272793;Parent=53995c3f42cd8ad8;Sampled=1';
	const source = templateMapping[event.language].fromName + ' <' + templateMapping[event.language].fromAddress + '>';
	sendTemplatedEmail(event.email, templateMapping[event.language][event.type], source).then(function(data) {
		callback(null, data);
	}).catch(function(err) {
		console.error(err);
		callback(err);
	});
};
