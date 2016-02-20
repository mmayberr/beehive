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

function load(daeLocation, x, y, z, name){
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
            dae.name = name;
            scene.add(dae);

			var material = new THREE.MeshBasicMaterial();
            material.map = THREE.ImageUtils.loadTexture('../images/wood.png');
            material.bumpMap = THREE.ImageUtils.loadTexture('../images/woodbw.png');
			material.bumpScale = 0.05;
			setMaterial(dae, material);
			// is texture even working??

            render();
        }, function(progress) {
            // show some progress
    });
}

function addHex(geometry, x, y, z){
	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xf08000 } ) );
	mesh.position.set( x, y, z );
	mesh.rotation.set( 0, 1.55, 0 );
	mesh.scale.set( 0.7, 0.7, 0.7 );
	mesh.name = "Honeycomb Cell";
	scene.add( mesh );
	//render();
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

	// ready cells
	var hexShape = new THREE.Shape();
	hexShape.moveTo( 0,0 );
	hexShape.lineTo( 0.5, 0.25 );
	hexShape.lineTo( 0.5, 0.75 );
	hexShape.lineTo( 0, 1 );
	hexShape.lineTo( -0.5, 0.75 );
	hexShape.lineTo( -0.5, 0.25 );
	hexShape.lineTo( 0, 0 );

	var extrudeSettings = { amount: 0.2, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.2, bevelThickness: 0.2 };
	var geometry = new THREE.ExtrudeGeometry( hexShape, extrudeSettings );

	// base entrance
	load('../models/bottomboard.dae', 0, -1.4, 0, "Bottom Board");

	// deeps
	var numdeeps = 2;
	for(var deepcount = 0 ; deepcount < numdeeps ; deepcount++){
		var ybase = deepcount * 12.2;
		load('../models/deep.dae', 0, ybase, 0, "Deep");
		for(var deepframecount = 0 ; deepframecount < 4 ; deepframecount++){
			load("../models/deepframe.dae", 1.1 + deepframecount*2.2, ybase + 0.27, 0, "Deep Frame");
			load("../models/deepframe.dae", -(1.1 + deepframecount*2.2), ybase + 0.27, 0, "Deep Frame");
			for(var rownum = 0; rownum < 14 ; rownum++ ){
				for(var colnum = 0; colnum < 22 ; colnum++ ){
					addHex(geometry, 1.1 + deepframecount*2.2, ybase+1+ rownum * 0.75, -10.75 + colnum+ (rownum % 2) * 0.5 );
					addHex(geometry, -(1.15 + deepframecount*2.2), ybase+1+ rownum * 0.75, -10.75 + colnum+ (rownum % 2) * 0.5 );
				}
			}
		}
	}

	// supers
	var numsupers = 2;
	for(var supercount = 0 ; supercount < numsupers ; supercount++){
		var ybase = (numdeeps * 12.2) + supercount * 8.4;
		load('../models/super.dae', 0, ybase, 0, "Super");
		for(var superframecount = 0 ; superframecount < 4 ; superframecount++){
			load("../models/superframe.dae", 1.1 + superframecount*2.2, ybase + 0.2, 0, "Super Frame");
			load("../models/superframe.dae", -(1.1 + superframecount*2.2), ybase + 0.2, 0, "Super Frame");
			for(var rownum = 0; rownum < 9 ; rownum++ ){
				for(var colnum = 0; colnum < 22 ; colnum++ ){
					addHex(geometry, 1.1 + superframecount*2.2, ybase+1+ rownum * 0.75, -10.75 + colnum+ (rownum % 2) * 0.5 );
					addHex(geometry, -(1.15 + superframecount*2.2), ybase+1+ rownum * 0.75, -10.75 + colnum+ (rownum % 2) * 0.5 );
				}
			}
		}
	}

	// inner cover
	load('../models/innercover.dae', 0, (numdeeps * 12.2) + (numsupers * 8.4), 0, "Inner Cover");

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

	//var timer = Date.now() * 0.0005;
	var timer = 1

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