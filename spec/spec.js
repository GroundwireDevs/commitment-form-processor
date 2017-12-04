describe('Reply function', function() {
	const Reply = require('../reply.js');
	const WriteSheet = require('../write-sheet.js');
	const event = require('../spec/event.json');
	const context = require('../spec/context.json');

	it('should be able to send a templated email.', function() {
		Reply.handler(event, context, function(err, data) {
			expect(err).toEqual(null);
			expect(data).not.toEqual(null);
		});
	});

});
