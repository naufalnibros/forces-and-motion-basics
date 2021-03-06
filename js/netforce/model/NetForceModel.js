// Copyright 2013-2017, University of Colorado Boulder

/**
 * Model for the Net Force screen, in which Pullers can pull on a rope with different forces.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Cart = require( 'FORCES_AND_MOTION_BASICS/netforce/model/Cart' );
  var Emitter = require( 'AXON/Emitter' );
  var forcesAndMotionBasics = require( 'FORCES_AND_MOTION_BASICS/forcesAndMotionBasics' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Knot = require( 'FORCES_AND_MOTION_BASICS/netforce/model/Knot' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Puller = require( 'FORCES_AND_MOTION_BASICS/netforce/model/Puller' );
  var Range = require( 'DOT/Range' );
  var Vector2 = require( 'DOT/Vector2' );

  // phet-io modules
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );
  var NetForceModelIO = require( 'FORCES_AND_MOTION_BASICS/netforce/model/NetForceModelIO' );
  var StringIO = require( 'ifphetio!PHET_IO/types/StringIO' );

  // constants
  // puller game will extend to +/- this value - when the cart wheel hits this length, the game is over
  var GAME_LENGTH = 458;

  // spacing for the knots
  var KNOT_SPACING = 80;
  var BLUE_KNOT_OFFSET = 62;
  var RED_KNOT_OFFSET = 680;

  /**
   * Constructor for the net force model.
   *
   * @param {Tandem} tandem
   * @constructor
   */
  function NetForceModel( tandem ) {

    var self = this;

    this.startedProperty = new Property( false, {
      tandem: tandem.createTandem( 'startedProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );

    this.runningProperty = new Property( false, {
      tandem: tandem.createTandem( 'runningProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );

    this.numberPullersAttachedProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'numberPullersAttachedProperty' ),
      range: new Range( 0, 8 )
    } );

    // TODO what are the valid values?
    this.stateProperty = new Property( 'experimenting', {
      tandem: tandem.createTandem( 'stateProperty' ),
      phetioType: PropertyIO( StringIO )
    } );

    this.timeProperty = new Property( 0, {
      // TODO: Removed this property for phet-io spam
      // tandem: tandem.createTandem( 'timeProperty' )
      // phetioType: PropertyIO(NumberIO)( 'seconds' )
    } );

    this.netForceProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'netForceProperty' ),
      units: 'newtons',
      range: new Range( -350, 350 )
    } );

    this.leftForceProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'leftForceProperty' ),
      units: 'newtons',
      range: new Range( -350, 0 )
    } );

    this.rightForceProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'rightForceProperty' ),
      units: 'newtons',
      range: new Range( 0, 350 )
    } );

    this.speedProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'speedProperty' ),
      units: 'meters/second',
      range: new Range( 0, 6 )
    } );

    this.durationProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'durationProperty' ),
      units: 'seconds',
      range: new Range( 0, Number.POSITIVE_INFINITY )
    } );

    // User settings
    this.showSumOfForcesProperty = new Property( false, {
      tandem: tandem.createTandem( 'showSumOfForcesProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );
    this.showValuesProperty = new Property( false, {
      tandem: tandem.createTandem( 'showValuesProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );
    this.showSpeedProperty = new Property( false, {
      tandem: tandem.createTandem( 'showSpeedProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );
    this.volumeOnProperty = new Property( false, {
      tandem: tandem.createTandem( 'volumeOnProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );

    this.cartReturnedEmitter = new Emitter();
    this.resetAllEmitter = new Emitter();

    this.cart = new Cart( tandem.createTandem( 'cart' ) );

    //Create a knot given a color and index (0-3)
    function createKnot( color, index, tandem ) {
      var xLocation = ( color === 'blue' ? BLUE_KNOT_OFFSET : RED_KNOT_OFFSET ) + index * KNOT_SPACING;
      return new Knot( xLocation, color, BLUE_KNOT_OFFSET, self.getRopeLength(), { tandem: tandem } );
    }

    // Create the knots
    // To support PhET-iO, the knots should be created before the pullers.
    // This allows the pullers to be attached to the knots using the PhET-iO API
    this.knots = [
      createKnot( 'blue', 0, tandem.createTandem( 'blueKnot0' ) ),
      createKnot( 'blue', 1, tandem.createTandem( 'blueKnot1' ) ),
      createKnot( 'blue', 2, tandem.createTandem( 'blueKnot2' ) ),
      createKnot( 'blue', 3, tandem.createTandem( 'blueKnot3' ) ),
      createKnot( 'red', 0, tandem.createTandem( 'redKnot0' ) ),
      createKnot( 'red', 1, tandem.createTandem( 'redKnot1' ) ),
      createKnot( 'red', 2, tandem.createTandem( 'redKnot2' ) ),
      createKnot( 'red', 3, tandem.createTandem( 'redKnot3' ) )
    ];

    //Create the pullers from left to right so the tab order (for accessibility) will be as expected.
    var bigPullerY = 473;
    var mediumPullerY = 426;
    var smallPullerY = 394;

    this.pullers = [
      new Puller( 208, bigPullerY, 'blue', 'small', 10, tandem.createTandem( 'smallBluePuller1' ) ),
      new Puller( 278, bigPullerY, 'blue', 'small', 10, tandem.createTandem( 'smallBluePuller2' ), { other: 'other' } ),
      new Puller( 127, mediumPullerY, 'blue', 'medium', 50, tandem.createTandem( 'mediumBluePuller' ), { standOffsetX: -5 } ),
      new Puller( 38, smallPullerY, 'blue', 'large', 70, tandem.createTandem( 'largeBluePuller' ), { standOffsetX: -18 } ),
      new Puller( 648, bigPullerY, 'red', 'small', 10, tandem.createTandem( 'smallRedPuller1' ) ),
      new Puller( 717, bigPullerY, 'red', 'small', 10, tandem.createTandem( 'smallRedPuller2' ), { other: 'other' } ),
      new Puller( 789, mediumPullerY, 'red', 'medium', 20, tandem.createTandem( 'mediumRedPuller' ) ),
      new Puller( 860, smallPullerY, 'red', 'large', 30, tandem.createTandem( 'largeRedPuller' ) )
    ];


    // When any puller is dragged or moved with phet-io, update the closest knots to be visible
    // and change the numberPullersAttached
    this.pullers.forEach( function( puller ) {

      puller.positionProperty.link( self.updateVisibleKnots.bind( self ) );
      puller.draggedEmitter.addListener( function() {
        self.numberPullersAttachedProperty.set( self.countAttachedPullers() );
      } );
      puller.droppedEmitter.addListener( function() {
        var knot = self.getTargetKnot( puller );
        self.movePullerToKnot( puller, knot );
      } );
      puller.knotProperty.link( function() {
        self.numberPullersAttachedProperty.set( self.countAttachedPullers() );
      } );
    } );

    //Update the started flag
    this.runningProperty.link( function( running ) { if ( running ) { self.startedProperty.set( true ); }} );

    //Update the forces when the number of attached pullers changes
    this.numberPullersAttachedProperty.link( function() { self.netForceProperty.set( self.getNetForce() ); } );
    this.numberPullersAttachedProperty.link( function() { self.leftForceProperty.set( self.getLeftForce() ); } );
    this.numberPullersAttachedProperty.link( function() { self.rightForceProperty.set( self.getRightForce() ); } );

    PhetioObject.call( this, {
      tandem: tandem,
      phetioType: NetForceModelIO,
      phetioState: false
    } );
  }

  forcesAndMotionBasics.register( 'NetForceModel', NetForceModel );

  return inherit( PhetioObject, NetForceModel, {

    /**
     * Move a puller to a knot.  If no knot is specified, puller is moved to its original location in the Puller
     * toolbox.
     *
     * @param {Puller} puller
     * @param {Knot} [knot] - optional knot where the puller should be moved.
     */
    movePullerToKnot: function( puller, knot ) {

      //try to snap to a knot
      if ( knot ) {

        puller.positionProperty.set( new Vector2( knot.xProperty.get(), knot.y ) );
        puller.knotProperty.set( knot );
      }

      //Or go back home
      else {
        puller.positionProperty.reset();
      }

      //Keep track of their location to change the attach/detach thresholds, see NetForceModel.getTargetKnot
      var newLocation = knot ? 'knot' : 'home';
      puller.lastPlacementProperty.set( newLocation );
    },

    /**
     * Shift the puller to the left.
     *
     * @param  {Puller} puller [description]
     */
    shiftPullerLeft: function( puller ) {
      this.shiftPuller( puller, 0, 4, -1 );
    },

    /**
     * Shift a puller to the right.
     *
     * @param  {Puller} puller
     */
    shiftPullerRight: function( puller ) {
      this.shiftPuller( puller, 3, 7, 1 );
    },

    /**
     * Shift a puller by some delta, restricted by the desired bounds
     * @param  {Puller} puller
     * @param  {number} leftBoundIndex
     * @param  {number} rightBoundIndex
     * @param  {number} delta
     */
    shiftPuller: function( puller, leftBoundIndex, rightBoundIndex, delta ) {
      if ( puller.knotProperty.get() ) {
        var currentIndex = this.knots.indexOf( puller.knotProperty.get() );
        if ( currentIndex !== leftBoundIndex && currentIndex !== rightBoundIndex ) {
          var nextIndex = currentIndex + delta;

          var currentKnot = this.knots[ currentIndex ];
          var nextKnot = this.knots[ nextIndex ];

          var otherPuller = this.getPuller( nextKnot );

          puller.setValues( { position: new Vector2( nextKnot.xProperty.get(), nextKnot.y ), knot: nextKnot } );
          otherPuller && otherPuller.setValues( {
            position: new Vector2( currentKnot.xProperty.get(), currentKnot.y ),
            knot: currentKnot
          } );
        }
      }
    },

    //Count the number of pullers attached to the rope
    countAttachedPullers: function() {
      var count = 0;
      for ( var i = 0; i < this.pullers.length; i++ ) {
        if ( this.pullers[ i ].knotProperty.get() ) {
          count++;
        }
      }
      return count;
    },

    //Change knot visibility (halo highlight) when the pullers are dragged
    updateVisibleKnots: function() {
      var self = this;
      this.knots.forEach( function( knot ) { knot.visibleProperty.set( false ); } );
      this.pullers.forEach( function( puller ) {
        if ( puller.draggingProperty.get() ) {
          var knot = self.getTargetKnot( puller );
          if ( knot ) {
            knot.visibleProperty.set( true );
          }
        }
      } );
    },

    /**
     * Gets the puller attached to a knot, or null if none attached to that knot.
     *
     * @param  {Knot} knot
     */
    getPuller: function( knot ) {
      var find = _.find( this.pullers, function( puller ) {return puller.knotProperty.get() === knot;} );
      return typeof( find ) !== 'undefined' ? find : null;
    },

    /**
     * Given a puller, returns a function that computes the distance between that puller and any knot.
     *
     * @param  {Puller} puller
     * return {function}
     */
    getKnotPullerDistance: function( puller ) {

      // the blue pullers face to the right, so add a small correction so the distance feels more 'natural' when
      // placing the blue pullers
      var dx = puller.type === 'red' ? 0 : -40;
      return function( knot ) { return Math.sqrt( Math.pow( knot.xProperty.get() - puller.positionProperty.get().x + dx, 2 ) + Math.pow( knot.y - puller.positionProperty.get().y, 2 ) ); };
    },

    /**
     * Gets the closest unoccupied knot to the given puller, which is being dragged.
     *
     * @param  {Puller} puller [description]
     * @returns {Knot}
     */
    getClosestOpenKnot: function( puller ) {
      var self = this;
      var filter = this.knots.filter( function( knot ) {
        return knot.type === puller.type && self.getPuller( knot ) === null;
      } );
      return _.minBy( filter, this.getKnotPullerDistance( puller ) );
    },

    /**
     * Gets the closest unoccupied knot to the given puller, which is being dragged.
     *
     * @param  {Puller} puller
     * @returns {Knot}
     */
    getClosestOpenKnotFromCart: function( puller ) {
      var idx = puller.type === 'red' ? 4 : 3;
      var delta = puller.type === 'red' ? 1 : -1;
      while ( this.getPuller( this.knots[ idx ] ) !== null ) {
        idx += delta;
      }
      return this.knots[ idx ];
    },

    /**
     * Gets the closest unoccupied knot to the given puller if it is close enough to grab.
     * @param  {Puller} puller
     * @returns {Knot}
     */
    getTargetKnot: function( puller ) {
      var target = this.getClosestOpenKnot( puller );
      var distanceToTarget = this.getKnotPullerDistance( puller )( target );

      //Only accept a target knot if the puller's head is close enough to the knot
      var threshold = puller.lastPlacementProperty.get() === 'home' ? 370 : 300;
      return distanceToTarget < 220 && puller.positionProperty.get().y < threshold ? target : null;
    },

    //Return the cart and prepare the model for another "go" run
    returnCart: function() {
      this.cart.reset();
      this.knots.forEach( function( knot ) {knot.reset();} );
      this.runningProperty.set( false );
      this.stateProperty.set( 'experimenting' );

      // broadcast a message that the cart was returned
      this.cartReturnedEmitter.emit();

      this.startedProperty.set( false );
      this.durationProperty.set( 0 ); // Reset tug-of-war timer
      this.speedProperty.reset();
    },

    //Reset the entire model when "reset all" is pressed
    reset: function() {

      // reset all Properties associated with this model
      this.startedProperty.reset();
      this.runningProperty.reset();
      this.numberPullersAttachedProperty.reset();
      this.stateProperty.reset();
      this.timeProperty.reset();
      this.netForceProperty.reset();
      this.leftForceProperty.reset();
      this.rightForceProperty.reset();
      this.speedProperty.reset();
      this.durationProperty.reset();
      this.showSumOfForcesProperty.reset();
      this.showValuesProperty.reset();
      this.showSpeedProperty.reset();
      this.volumeOnProperty.reset();

      //Unset the knots before calling reset since the change of the number of attached pullers causes the force arrows to update
      this.pullers.forEach( function( puller ) {puller.disconnect();} );

      this.cart.reset();
      this.pullers.forEach( function( puller ) {
        // if the puller is being dragged, we will need to cancel the drag in PullerNode
        if ( !puller.draggingProperty.get() ) {
          puller.reset();
        }
      } );
      this.knots.forEach( function( knot ) {knot.reset();} );

      // notify that the model was reset
      this.resetAllEmitter.emit();
    },

    /**
     * The length of the rope is the spacing between knots times the number of knots plus the difference between
     * the red and blue starting offsets.
     *
     * @return {number}
     */
    getRopeLength: function() {
      return 6 * KNOT_SPACING + RED_KNOT_OFFSET - ( BLUE_KNOT_OFFSET + 3 * KNOT_SPACING );
    },

    /**
     * Update the physics when the clock ticks
     *
     * @param {number} dt
     */
    step: function( dt ) {

      if ( this.runningProperty.get() ) {

        // Increment tug-of-war timer
        this.durationProperty.set( this.durationProperty.get() + dt );

        // Make the simulation run about as fast as the Java version
        var newV = this.cart.vProperty.get() + this.getNetForce() * dt * 0.003;
        this.speedProperty.set( Math.abs( newV ) );

        var newX = this.cart.xProperty.get() + newV * dt * 60.0;
        this.updateCartAndPullers( newV, newX );

        //If the cart made it to the end, then stop and signify completion
        var gameLength = GAME_LENGTH - this.cart.widthToWheel;
        if ( this.cart.xProperty.get() > gameLength || this.cart.xProperty.get() < -gameLength ) {
          this.runningProperty.set( false );
          this.stateProperty.set( 'completed' );

          // zero out the velocity
          this.speedProperty.set( 0 );

          // set cart and pullers back the to max position
          var maxLength = this.cart.xProperty.get() > gameLength ? gameLength : -gameLength;
          this.updateCartAndPullers( this.speedProperty.get(), maxLength );
        }
      }

      this.timeProperty.set( this.timeProperty.get() + dt );
    },

    /**
     * Update the velocity and position of the cart and the pullers.
     *
     * @private
     * @param  {number} newV
     * @param  {number} newX
     */
    updateCartAndPullers: function( newV, newX ) {

      // move the cart, and update its velocity
      this.cart.vProperty.set( newV );
      this.cart.xProperty.set( newX );

      // move the knots and the pullers on those knots
      this.knots.forEach( function( knot ) { knot.xProperty.set( knot.initX + newX ); } );
    },

    //Gets the net force on the cart, applied by both left and right pullers
    getNetForce: function() {
      return this.getLeftForce() + this.getRightForce();
    },

    /**
     * Get an array of pullers of the specified type (color string)
     * @param  {striing} type - one of 'red' or 'blue'
     * @returns {Array<Puller>}
     */
    getPullers: function( type ) {
      return _.filter( this.pullers, function( p ) {return p.type === type && p.knotProperty.get();} );
    },

    /**
     * Function for internal use that helps to sum forces in _.reduce, see getLeftForce, getRightForce
     *
     * @param  {string} memo
     * @param  {Puller} puller
     * @returns {string}
     */
    sumForces: function( memo, puller ) {
      return memo + puller.force;
    },

    //Gets the left force on the cart, applied by left and pullers
    getLeftForce: function() {
      return -_.reduce( this.getPullers( 'blue' ), this.sumForces, 0 );
    },

    //Gets the right force on the cart, applied by right pullers
    getRightForce: function() {
      return _.reduce( this.getPullers( 'red' ), this.sumForces, 0 );
    },

    /**
     * Gets the closest unoccupied knot to the given puller, which is being dragged.
     * @param  {Puller} puller
     * @param  {nuber} delta
     * @returns {Knot}
     */
    getClosestOpenKnotInDirection: function( puller, delta ) {
      var self = this;
      var isInRightDirection = function( sourceKnot, destinationKnot, delta ) {
        assert && assert( delta < 0 || delta > 0 );
        return delta < 0 ? destinationKnot.xProperty.get() < sourceKnot.xProperty.get() :
               delta > 0 ? destinationKnot.xProperty.get() > sourceKnot.xProperty.get() :
               'error';
      };
      var filter = this.knots.filter( function( knot ) {
        return knot.type === puller.type &&
               self.getPuller( knot ) === null &&
               isInRightDirection( puller.knotProperty.get(), knot, delta );
      } );
      var result = _.minBy( filter, this.getKnotPullerDistance( puller ) );
      if ( result === Infinity || result === -Infinity ) {
        result = null;
      }
      return result;
    },

    /**
     * Get the next open knot in a given direction.  Very similar to the function above, but with a resultant knot
     * is a function of the distance to the next knot, not of the distance to the puller.  This is necessary because
     * when dragging, the puller does not yet have an associated knot.
     *
     * @param {Knot} sourceKnot
     * @param {Puller} puller
     * @param {number} delta
     */
    getNextOpenKnotInDirection: function( sourceKnot, puller, delta ) {
      var self = this;
      var isInRightDirection = function( destinationKnot, delta ) {
        assert && assert( delta < 0 || delta > 0 );
        return delta < 0 ? destinationKnot.xProperty.get() < sourceKnot.xProperty.get() :
               delta > 0 ? destinationKnot.xProperty.get() > sourceKnot.xProperty.get() :
               'error';
      };
      var filter = this.knots.filter( function( knot ) {
        return knot.type === puller.type &&
               self.getPuller( knot ) === null &&
               isInRightDirection( knot, delta );
      } );
      var result = _.minBy( filter, function( knot ) {
        return Math.abs( sourceKnot.xProperty.get() - knot.xProperty.get() );
      } );

      // we have reached the end of the knots.  Return either the first or last knot to loop the choice.
      if ( result === Infinity || result === -Infinity ) {
        result = null;
      }
      return result;
    },

    /**
     * For phet-io, describe what pullers are on what knots
     */
    getKnotDescription: function() {
      return this.pullers.map( function( puller ) {
        return {
          id: puller.pullerTandem.phetioID, // TODO: addInstance for Puller
          knot: puller.knotProperty.get() && puller.knotProperty.get().phetioID
        };
      } );
    },

    /**
     * Move a puller to an adjacent open knot in a direction specified by delta.
     *
     * @param  {Puller} puller
     * @param  {number} delta
     */
    movePullerToAdjacentOpenKnot: function( puller, delta ) {
      var closestOpenKnot = this.getClosestOpenKnotInDirection( puller, delta );
      if ( closestOpenKnot ) {
        this.movePullerToKnot( puller, closestOpenKnot );
      }
    }
  }, {

    // @static
    // @public
    GAME_LENGTH: GAME_LENGTH
  } );
} );