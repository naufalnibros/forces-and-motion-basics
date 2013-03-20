//Demonstration of usage of PhetModel, see documentation for PhetModel
define( function( require ) {
  "use strict";
  var PhetModel = require( 'common/model/PhetModel' );
  return function() {

    //Creates a model 'class' which can be instantiated.
    var TestModel = PhetModel.extend(
        {

          //Values common to all model instances declared here
          defaults: {
            showElectrons: true,
            paused: false,
            position: 0
          },

          //Demonstrate a custom init function and ability to get es5 getters of non-default attributes in the init
          init: function() {
            console.log( "init called, with color: " + this.color );
          }
        } );

    //Instantiate a model, and specify some values for this instance
    var model = new TestModel( {color: 'red'} );

    //Output the JSON, nice and clean and ready for storage, serialization, etc.
    console.log( model.toJSON() );

    //Wire up to a property for change notifications, and immediately synchronize with the view.
    model.sync( 'color', function( model, newColor ) {
      console.log( "Updating view color to be: " + newColor );
    } );
    //Demonstrate setting the value with ES5 setters.
    model.color = 'green';

    //Wire up to a property only for future changes
    model.on( 'change:position', function( model, newPosition ) {
      console.log( "position changed to: ", newPosition, " (it used to be ", model.previous( 'position' ) + ")" );
    } );
    model.position = 123;

    //Demonstrate resetting the model.
    console.log( "Resetting!" );
    model.reset();

    //Demonstrate the property interface.  Imagine a checkbox that just takes an argument of type property (of boolean) 
    // and doesn't want to know what model or property it came from (or even that it came from backbone or phetmodel)
    console.log( "Testing property interface." );
    var property = model.property( 'paused' );
    var createCheckBox = function( property ) {
      //add listener to sync the check box view with the model
      property.sync( function( model, value ) {
        console.log( "checkbox state updated, new value is " + value + ", which is the same as " + property.get() );
      } );
    };
    createCheckBox( property );
    property.set( true );
  };
} );