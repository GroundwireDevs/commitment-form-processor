describe('Player', function() {
	const Reply = require('../reply.js');
  const WriteSheet = require('../write-sheet.js');

	it('should be able to play a Song', function() {
		player.play(song);
		expect(player.currentlyPlayingSong).toEqual(song);

		//demonstrates use of custom matcher
		expect(player).toBePlaying(song);
	});

});
