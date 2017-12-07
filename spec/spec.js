const LambdaTester = require( 'lambda-tester' );

const myHandler = require( '../src/reply' ).handler;

describe( 'Reply function', function() {

	it( 'should send an email using a valid event, with age.', function() {

		// Valid data with age
		return LambdaTester( myHandler )
			.event( {'language': 'en','type':'salvation','firstName':'Kenan','lastName':'Scott','email':'kenans@groundwire.net','commitment':'no','age':'5'})
			.expectResult();

	});

	it( 'should send an email using a valid event, without age.', function() {

		// Valid data with age
		return LambdaTester( myHandler )
			.event( {'language': 'en','type':'salvation','firstName':'Kenan','lastName':'Scott','email':'kenans@groundwire.net','commitment':'no'})
			.expectResult();

	});

  it( 'shouldn\'t send an email using an invalid event key.', function() {

		// Valid data with age
		return LambdaTester( myHandler )
			.event( {'language': 'en','type':'salvation','firstName':'Kenan','lastName':'Scott','e-mail':'kenans@groundwire.net','commitment':'no'})
			.expectError();

	});

});
