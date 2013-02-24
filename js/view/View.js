define( function ( require ) {
  "use strict";
  var Strings = require( "i18n!../../nls/forces-and-motion-basics-strings" );
  var Shape = require( 'SCENERY/Shape' );
  var LayerType = require( 'SCENERY/LayerType' );
  var Scene = require( 'SCENERY/Scene' );
  var Path = require( 'SCENERY/Path' );
  var Image = require( 'SCENERY/Image' );//Will this collide with other Image type
  var SimpleDragHandler = require( 'SCENERY/SimpleDragHandler' );

  function View( $images ) {

    function getImage( name ) {
      var selector = 'img[src^="images/' + name + '"]';
      return $images.parent().find( selector )[0];
    }

    this.scene = new Scene( $( "#scene" ), {width: 200, height: 200, preferredSceneLayerType: LayerType.SVG} );

    var misc = ['grass', 'rope', 'cart', 'go_up'];
    for ( var i = 0; i < misc.length; i++ ) {
      var cart = new Image( getImage( misc[i] ), {x: 100, y: 100, fontSize: 42} );
      cart.addInputListener( new SimpleDragHandler( {allowTouchSnag: true} ) );
      this.scene.addChild( cart );
    }

    var blueImageNames = ['pull_figure_small_BLUE_0', 'pull_figure_small_BLUE_0', 'pull_figure_BLUE_0', 'pull_figure_lrg_BLUE_0'];
    var redImageNames = ['pull_figure_small_RED_0', 'pull_figure_small_RED_0', 'pull_figure_RED_0', 'pull_figure_lrg_RED_0'];
    var view = this;

    function addImages( imageNames ) {
      for ( var i = 0; i < imageNames.length; i++ ) {
        var image = getImage( imageNames[i] );
        var imageNode = new Image( image, {x: 100, y: 100, fontSize: 42} );
        imageNode.addInputListener( new SimpleDragHandler( {allowTouchSnag: true} ) );
        view.scene.addChild( imageNode );
      }
    }

    addImages.call( this, blueImageNames );
    addImages.call( this, redImageNames );

    this.scene.initializeFullscreenEvents(); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    this.scene.resizeOnWindowResize(); // the scene gets resized to the full screen size

    //Fit to the window and render the initial scene
    $( window ).resize( function () { view.resize(); } );
    this.resize();

    //http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // place the rAF *before* the render() to assure as close to
    // 60fps with the setTimeout fallback.
    (function animloop() {
      requestAnimFrame( animloop );
      view.render();
    })();
  }

  View.prototype.resize = function () {
    var width = $( window ).width();
    var height = $( window ).height();

    var scale = Math.min( width / 981, height / 644 );

    this.scene.resize( width, height );
    this.scene.setScale( scale );

    var groundHeight = height * scale / 2;

    //Show the sky
    $( "#sky" ).empty();
    var paper = Raphael( document.getElementById( "sky" ), width, height );
    var sky = paper.rect( 0, 0, width, height - groundHeight );
    sky.attr( 'fill', '90-#cfecfc-#02ace4' );
    sky.attr( 'stroke', '#fff' );

    //ground color: c59a5b
    //Show the ground
    $( "#ground" ).empty();
    var groundPaper = Raphael( document.getElementById( "ground" ), width, height );
    var ground = groundPaper.rect( 0, height - groundHeight, width, groundHeight );
    ground.attr( 'fill', '#c59a5b' );
    ground.attr( 'stroke', '#fff' );

    this.render();
  };

  View.prototype.render = function () {
    this.scene.updateScene();
  };

  window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function ( callback ) {
             window.setTimeout( callback, 1000 / 60 );
           };
  })();

  return View;
} );