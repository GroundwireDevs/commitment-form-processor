/*jshint esversion: 6 */
const simpleParser = require('mailparser').simpleParser;
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const ses = new AWS.SES();

function getFile(messageId) {
	return new Promise(function(resolve, reject) {

		const s3 = new AWS.S3();
		const params = {
			Bucket: process.env.BUCKET,
			Key: process.env.FROM_ADDRESS + '/' + messageId
		};
		s3.getObject(params, function(err, file) {
			if (err) reject(Error(err));
			else resolve(file);
		});

	});
}

function sendEmail(input) {
	return new Promise(function(resolve, reject) {

		const params = {
			Destination: {
				ToAddresses: [
					input.to
				]
			},
			Message: {
				Body: {
					Text: {
						Charset: 'UTF-8',
						Data: input.text
					}
				},
				Subject: {
					Charset: 'UTF-8',
					Data: input.subject
				}
			},
			Source: process.env.FROM_NAME + ' <' + process.env.FROM_ADDRESS + '>',
		};

		ses.sendEmail(params, function(err, data) {
			if (err) reject(Error(err)); // an error occurred
			else resolve(data); // successful response
		});

	});
}

function s3FileToString(file) {
	return new Promise(function(resolve) {

		const objectData = file.Body.toString('utf-8');
		resolve(objectData);

	});
}

exports.handler = (event, context, callback) => {

	console.log('Subject line = ' + event.Records[0].ses.mail.commonHeaders.subject); // Log subject
	console.log('Incoming message ID = ' + event.Records[0].ses.mail.messageId); // Log message ID

	if (event.Records[0].ses.mail.commonHeaders.subject.includes('Delivery Status Notification (Failure)') || event.Records[0].ses.mail.commonHeaders.subject.includes('Undeliverable')) { // Delivery failure
		callback(null, 'This email is a bounce');
	} else { // Not an auto response or delivery failure
		console.log('This does not appear to be a bounce. Forwarding to ' + process.env.FORWARD_ADDRESS);
		const messageId = event.Records[0].ses.mail.messageId;
		getFile(messageId).then(s3FileToString).then(simpleParser).then(function(mail) {
			let sendEmailInput = {};
			sendEmailInput.to = process.env.FORWARD_ADDRESS;
			sendEmailInput.subject = 'Message to ' + process.env.FROM_ADDRESS + ' from ' + mail.from.text + ' Subject = ' + mail.subject;
			sendEmailInput.text = mail.text;
			return sendEmailInput;
		}).then(sendEmail).then(function(data) {
			console.log(data);
			callback(null, data);
		}).catch(function(error) {
			console.error(error);
			callback(error);
		});
	}
};
