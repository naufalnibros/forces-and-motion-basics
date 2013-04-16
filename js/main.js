require( [ "tugofwar/model/TugOfWarModel",
           "motion/view/MotionView",
           "motion/model/MotionModel",
           'SCENERY/nodes/Image',
           'PHETCOMMON/util/ImagesLoader',
           "i18n!../nls/forces-and-motion-basics-strings",
           'FORT/examples',
           'FORT/Fort',
           'SCENERY/util/Util',
           'SCENERY_PHET/NavigationBar',
           'SCENERY_PHET/HomeScreen',
           'SCENERY/Scene',
           'SCENERY/nodes/Text',
           'SCENERY/nodes/Node',
           'motion/view/MotionNode',
           'tugofwar/view/TugOfWarNode'
         ], function( TugOfWarModel, MotionView, MotionModel, Image, ImagesLoader, Strings, fortExamples, Fort, Util, NavigationBar, HomeScreen, Scene, Text, Node, MotionNode, TugOfWarNode ) {
  "use strict";

  new FastClick( document.body );

  Util.polyfillRequestAnimationFrame();

  //Code to show console output in a div, requires a #debugDiv in the HTML
  var useDebugDiv = false;
  if ( useDebugDiv ) {
    if ( typeof console !== "undefined" ) {
      if ( typeof console.log !== 'undefined' ) { console.olog = console.log; }
      else { console.olog = function() {}; }
    }
    console.log = function( message ) {
      console.olog( message );
      $( '#debugDiv' ).append( '<p>' + message + '</p>' );
    };
  }

  var homeScreen = null;
  var imageLoader = null;
  var scene = null;
  var tabs = null;
  var appModel = new Fort.Model( {home: false, tab: 0} );
  var tabContainer = null;

  function init() {

    scene = new Scene( $( '.scene' ), {width: 200, height: 200, allowDevicePixelRatioScaling: true} );
    scene.initializeStandaloneEvents(); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    scene.resizeOnWindowResize(); // the scene gets resized to the full screen size

    window.accessibilityScene = new Scene( $( '.accessibility-scene' ) );

    //Start in Tab 2 for debugging

    var tabWrappers = [
      {name: "Tug of War", icon: new Image( imageLoader.getImage( 'Tug_Icon.png' ) )},
      {name: "Motion", icon: new Image( imageLoader.getImage( 'Motion_icon.png' ) )},
      {name: "Friction", icon: new Image( imageLoader.getImage( 'Friction_Icon.png' ) )},
      {name: "Acceleration", icon: new Image( imageLoader.getImage( 'Acceleration_Icon.png' ) )}
    ];
    homeScreen = new HomeScreen( "Forces and Motion: Basics", tabWrappers, appModel );

    $( "#overlay" ).remove();
    if ( !useDebugDiv ) {
      $( "debugDiv" ).remove();
    }

    var navigationBar = new NavigationBar( tabWrappers, appModel ).mutate( {bottom: 644} );

    var root = new Node(); //root: homeScreen | tabNode
    var tabNode = new Node(); //tabNode: navigationBar tabContainer
    tabContainer = new Node();//tabContainer: sceneForTab 
    tabNode.addChild( navigationBar );
    tabNode.addChild( tabContainer );
    scene.addChild( root );

    appModel.link( 'home', function( home ) { root.children = [home ? homeScreen : tabNode];} );

    function resize() {
      var width = $( window ).width();
      var height = $( window ).height();//leave room for the tab bar

      var scale = Math.min( width / 981, height / 644 );
      scene.resetTransform();
      scene.setScaleMagnitude( scale );

      //center vertically
      if ( scale === width / 981 ) {
        var padding = height - 644 * scale;
        scene.translate( 0, padding / 2 / scale );
      }

      //center horizontally
      else if ( scale === height / 644 ) {
        var padding = width - 981 * scale;
        scene.translate( padding / 2 / scale, 0 );
      }
    }

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
  }

  //Wait until images are loaded, then launch the sim and show the initial tab
  new ImagesLoader( function( loader ) {
    imageLoader = loader;
    init();

    //Load the modules lazily, makes the startup time on iPad3 go from 14 sec to 4 sec to see the home screen
    tabs = [
      new TugOfWarNode( new TugOfWarModel(), imageLoader ),
      new MotionNode( new MotionModel( {tab: 'motion'} ), imageLoader ),
      new MotionNode( new MotionModel( {tab: 'friction'} ), imageLoader ),
      new MotionNode( new MotionModel( {tab: 'acceleration'} ), imageLoader )
    ];

    appModel.link( 'tab', function( tab ) { tabContainer.children = [tabs[tab]]; } );
    scene.updateScene();

    //http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // place the rAF *before* the render() to assure as close to
    // 60fps with the setTimeout fallback.
    (function animationLoop() {
      requestAnimationFrame( animationLoop );

      //Update the tab, but not if the user is on the home screen
      if ( !appModel.home ) {
        tabs[appModel.tab].model.step();
      }
      scene.updateScene();
    })();
  } );
} );