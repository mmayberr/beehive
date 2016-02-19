if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer, objects;
var particleLight;
var dae;

/*
var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load( '../models/deep.dae', function ( collada ) {

	dae = collada.scene;

	dae.traverse( function ( child ) {

		if ( child instanceof THREE.SkinnedMesh ) {

			var animation = new THREE.Animation( child, child.geometry.animation );
			animation.play();

		}

	} );

	dae.scale.x = dae.scale.y = dae.scale.z = 0.04;
	dae.updateMatrix();

	init();
	animate();

} );
*/

var setMaterial = function(node, material) {
  node.material = material;
  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      setMaterial(node.children[i], material);
    }
  }
}

function load(daeLocation, x, y, z){
    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };

    var loader = new THREE.ColladaLoader(manager);
    loader.options.convertUpAxis = true;

    loader.load(daeLocation, function(collada) {
            dae = collada.scene;

            dae.traverse( function ( child ) {
				if ( child instanceof THREE.SkinnedMesh ) {
					var animation = new THREE.Animation( child, child.geometry.animation );
					animation.play();
				}
			} );

            dae.position.set(x, y, z);
            dae.scale.x = dae.scale.y = dae.scale.z = 0.05; 
            scene.add(dae);

			var material = new THREE.MeshBasicMaterial();
            material.map = THREE.ImageUtils.loadTexture('../images/wood.png');
            material.bumpMap = THREE.ImageUtils.loadTexture('../images/woodbw.png');
			material.bumpScale = 0.05;
			setMaterial(dae, material);

            render();
        }, function(progress) {
            // show some progress
    });
}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );
	// camera.position.z = 250;
	camera.position.set( 2, 2, 3 );

	controls = new THREE.FlyControls( camera );

	controls.movementSpeed = 5;
	controls.domElement = container;
	controls.rollSpeed = Math.PI / 6;
	controls.autoForward = false;
	controls.dragToLook = false;

	scene = new THREE.Scene();

	// Grid

	var size = 14, step = 1;

	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { color: 0x303030 } );

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push( new THREE.Vector3( - size, - 0.04, i ) );
		geometry.vertices.push( new THREE.Vector3(   size, - 0.04, i ) );

		geometry.vertices.push( new THREE.Vector3( i, - 0.04, - size ) );
		geometry.vertices.push( new THREE.Vector3( i, - 0.04,   size ) );

	}

	var line = new THREE.LineSegments( geometry, material );
	scene.add( line );

	// Add the COLLADA

	scene.add( dae );

	particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
	scene.add( particleLight );

	// Lights

	scene.add( new THREE.AmbientLight( 0xcccccc ) );

	var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee );
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.add( directionalLight );

	var pointLight = new THREE.PointLight( 0xffffff, 4 );
	particleLight.add( pointLight );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

	// load models

	// base entrance
	load('../models/bottomboard.dae', 0, -1.4, 0);

	// deeps
	var numdeeps = 2;
	for(var deepcout = 0 ; deepcout < numdeeps ; deepcout++){
		var ybase = deepcout * 12.2;
		load('../models/deep.dae', 0, ybase, 0);
		for(var deepframecout = 0 ; deepframecout < 4 ; deepframecout++){
			load("../models/deepframe.dae", 1.1 + deepframecout*2.2, ybase + 0.27, 0);
			load("../models/deepframe.dae", -(1.1 + deepframecout*2.2), ybase + 0.27, 0);
		}
	}

	// supers
	var numsupers = 2;
	for(var supercout = 0 ; supercout < numsupers ; supercout++){
		var ybase = (numdeeps * 12.2) + supercout * 8.4;
		load('../models/super.dae', 0, ybase, 0);
		for(var superframecout = 0 ; superframecout < 4 ; superframecout++){
			load("../models/superframe.dae", 1.1 + superframecout*2.2, ybase + 0.2, 0);
			load("../models/superframe.dae", -(1.1 + superframecout*2.2), ybase + 0.2, 0);
		}
	}

	// inner cover
	load('../models/innercover.dae', 0, (numdeeps * 12.2) + (numsupers * 8.4), 0);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

var clock = new THREE.Clock();

function render() {

	var timer = Date.now() * 0.0005;

	// camera.position.x = Math.cos( timer ) * 2;
	// camera.position.y = 2;
	// camera.position.z = Math.sin( timer ) * 2;

	// camera.lookAt( scene.position );

	particleLight.position.x = Math.sin( timer * 4 ) * 3009;
	particleLight.position.y = Math.cos( timer * 5 ) * 4000;
	particleLight.position.z = Math.cos( timer * 4 ) * 3009;

	delta = clock.getDelta();

	THREE.AnimationHandler.update( delta );

	controls.update( delta );
	renderer.render( scene, camera );

}

// main

init();
animate();