'use strict';
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const templateMapping = require('./../template-map.json');

function sendTemplatedEmail(to, template, source, fromName) {
	return new Promise(function(resolve, reject) {

		const ses = new AWS.SES({region: process.env.AWS_REGION});

		const params = {
			Destination: {
				ToAddresses: [
					to
				]
			},
			Source: source,
			Template: template,
			TemplateData: '{\"fromname\": \"' + fromName + '\"}' // Escapes and double quotes seem to be required by SES
		};

		ses.sendTemplatedEmail(params, function(err, data) {
			if (err) reject(Error(err)); // an error occurred
			else resolve(data); // successful response
		});

	});
}

exports.handler = (event, context, callback) => {
	if (event.testing === true) {
		process.env._X_AMZN_TRACE_ID = 'Root=1-5759e988-bd862e3fe1be46a994272793;Parent=53995c3f42cd8ad8;Sampled=1';
		process.env.AWS_REGION = 'us-west-2';
	}

	let source;

	try {
		source = templateMapping[event.language].fromName + ' <' + templateMapping[event.language].fromAddress + '>';
	}
	catch (exception) {
		callback(Error(exception));
	}
	sendTemplatedEmail(event.email, templateMapping[event.language][event.type], source, templateMapping[event.language].fromName).then(function(data) {
		callback(null, data);
	}).catch(function(err) {
		callback(err);
	});
};
