const LambdaTester = require( 'lambda-tester' );

const myHandler = require( '../src/reply' ).handler;

describe( 'handler', function() {

    it( 'test success', function() {

        return LambdaTester( myHandler )
            .event( {"language": "en","type":"salvation","firstName":"Kenan","lastName":"Scott","email":"kenans@groundwire.net","commitment":"no","age":"5"}
 )
            .expectResult();
    });
});
