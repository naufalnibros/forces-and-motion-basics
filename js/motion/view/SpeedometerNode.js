// Copyright 2016-2017, University of Colorado Boulder

/**
 * Speedometer used in Forces and Motion: Basics.  This is a typical gauge node with a value readout near the bottom.
 *
 * @author Sam Reid
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  //modules
  var forcesAndMotionBasics = require( 'FORCES_AND_MOTION_BASICS/forcesAndMotionBasics' );
  var GaugeNode = require( 'SCENERY_PHET/GaugeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MotionConstants = require( 'FORCES_AND_MOTION_BASICS/motion/MotionConstants' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // strings
  var pattern0Name1ValueUnitsVelocityString = require( 'string!FORCES_AND_MOTION_BASICS/pattern.0name.1valueUnitsVelocity' );
  var speedString = require( 'string!FORCES_AND_MOTION_BASICS/speed' );

  /**
   * Constructor.
   *
   * @param {Property<number>} velocityProperty
   * @param {Property<number>} showSpeedProperty
   * @param {Property<boolean>} showValuesProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SpeedometerNode( velocityProperty, showSpeedProperty, showValuesProperty, tandem, options ) {

    options = _.extend( {
      radius: 67,
      tandem: tandem
    }, options );

    // mutate with the options after construction so we can set the 'top'
    Node.call( this );

    // create the gaugeNode
    var gaugeNode = new GaugeNode( velocityProperty, speedString, {
        min: 0,
        max: MotionConstants.MAX_SPEED
      },
      {
        tandem: tandem.createTandem( 'gaugeNode' )
      } );
    this.addChild( gaugeNode );

    // create a value readout inside of a panel, maxSpeed for max bounds for layout calculations
    var maxSpeed = Util.toFixed( MotionConstants.MAX_SPEED, 1 );
    var valueString = StringUtils.format( pattern0Name1ValueUnitsVelocityString, maxSpeed );
    var valueTextNode = new Text( valueString, {
      font: new PhetFont( 16 ),
      maxWidth: options.radius,
      tandem: tandem.createTandem( 'valueTextNode' )
    } );
    this.addChild( valueTextNode );

    // place valueText inside of a background rectangle
    var cornerRadius = 5;
    var valueRectangle = new Rectangle( valueTextNode.bounds.dilated( 4 ), cornerRadius, cornerRadius, {
      lineWidth: 1,
      stroke: 'black'
    } );
    this.addChild( valueRectangle );

    // update the value whenever the property changes, and reset layout
    var updateReadout = function( value ) {
      var readoutValue = Util.toFixed( Math.abs( value ), 1 );
      valueTextNode.text = StringUtils.format( pattern0Name1ValueUnitsVelocityString, readoutValue );

      valueRectangle.center = gaugeNode.center.plusXY( 0, options.radius / 2 );
      valueTextNode.center = gaugeNode.center.plusXY( 0, options.radius / 2 );
    };

    // dispose unnecessary for property links, SpeedometerNode exists for the lifetime of the sim
    showSpeedProperty.linkAttribute( this, 'visible' );
    showValuesProperty.linkAttribute( valueRectangle, 'visible' );
    showValuesProperty.linkAttribute( valueTextNode, 'visible' );

    velocityProperty.link( updateReadout );

    // mutate post node construction so we can correctly translate
    this.mutate( options );
  }

  forcesAndMotionBasics.register( 'SpeedometerNode', SpeedometerNode );

  return inherit( Node, SpeedometerNode );

} );
