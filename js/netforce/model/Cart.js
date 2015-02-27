// Copyright 2002-2013, University of Colorado Boulder

/**
 * Model for the cart, which has a position (x) and velocity (v).
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var PropertySet = require( 'AXON/PropertySet' );
  var inherit = require( 'PHET_CORE/inherit' );

  var AriaSpeech = require( 'SCENERY/accessibility/AriaSpeech' );

  //Cart constructor
  function Cart() {
    PropertySet.call( this, { x: 0, v: 0 } );//Position and velocity are in MKS

    this.multilink( [ 'x', 'v' ], function( x, v ) {
      if ( v < 0 ) {
        AriaSpeech.setText( 'The cart is moving to the left!' );
      }
      else if ( v > 0 ) {
        AriaSpeech.setText( 'The cart is moving to the right!' );
      }
      else {
        AriaSpeech.setText( 'The tug of war game has begun!  However, it looks like both ' );
      }
    } );
  }

  return inherit( PropertySet, Cart );
} );