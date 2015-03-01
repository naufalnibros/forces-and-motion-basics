// Copyright 2002-2013, University of Colorado Boulder

/**
 * Entry point for PhET Interactive Simulation's Forces and Motion: Basics application.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var SimLauncher = require( 'JOIST/SimLauncher' );
  var ForcesAndMotionBasicsSim = require( 'FORCES_AND_MOTION_BASICS/ForcesAndMotionBasicsSim' );
  var forcesAndMotionBasicsAPI = require( 'FORCES_AND_MOTION_BASICS/forcesAndMotionBasicsAPI' );
  var Input = require( 'SCENERY/input/Input' );

  var simOptions = {
    api: forcesAndMotionBasicsAPI,
    credits: {
      leadDesign: 'Noah Podolefsky',
      softwareDevelopment: 'Sam Reid',
      team: 'Trish Loeblein, Ariel Paul, Kathy Perkins'
    },
    textDescription: ''
  };

  SimLauncher.launch( function() {
    var sim = new ForcesAndMotionBasicsSim( simOptions );
    sim.start();
    var element = document.getElementById( 'simCanvas' );
    //console.log( element );

    element.appendChild( document.getElementById( 'canvasSubDom' ) );
    for ( var i = 0; i < 8; i++ ) {
      (function( i ) {

        $( '#puller' + (i + 1) ).focus( function( e ) {
          Input.focusedTrail = sim.netForceScreen.view.pullerNodes[ i ].getUniqueTrail();
        } );
      })( i );
    }
  } );
} );
