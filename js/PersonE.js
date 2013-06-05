define( function( require ) {
  "use strict";

  var PropertySet = require( 'PHETCOMMON/model/property/PropertySet' );
  var inherit = require( 'PHET_CORE/inherit' );

  //Using Property
  function Person( name, ssn, age, weight, height, happy ) {
    this.ssn = ssn;
    PropertySet.call( this, {name: name, age: age, weight: weight, height: height, happy: happy} );
    this.addDerivedProperty( 'bmi', ['weight', 'height'], function( weight, height ) {return weight / height / height;} );

    if ( 2 + 3 < 999 ) {
      return;
    }
  }

  inherit( Person, PropertySet, {
    nextYear: function() {
      this.age = this.age + 1;
    }
  } );

  return Person;
} );