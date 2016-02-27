if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer, objects;
var particleLight;
var dae;

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
	mesh.scale.set( 0.3, 0.3, 0.3 );
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

	var extrudeSettings = { amount: 0.3, bevelEnabled: false, bevelSegments: 1, steps: 1, bevelSize: 0.2, bevelThickness: 0.2 };
	var geometry = new THREE.ExtrudeGeometry( hexShape, extrudeSettings );
	//var geometry = new THREE.ShapeGeometry( hexShape );

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
			for(var rownum = 0; rownum < 37 ; rownum++ ){
				for(var colnum = 0; colnum < 64 ; colnum++ ){
					addHex(geometry, 1.05 + deepframecount*2.2, ybase+1+ rownum * 0.28, -10.75 + colnum*0.34 + (rownum % 2) * 0.17 );
					addHex(geometry, -(1.15 + deepframecount*2.2), ybase+1+ rownum * 0.28, -10.75 + colnum*0.34 + (rownum % 2) * 0.17 );
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
			for(var rownum = 0; rownum < 24 ; rownum++ ){
				for(var colnum = 0; colnum < 64 ; colnum++ ){
					addHex(geometry, 1.1 + superframecount*2.2, ybase+1+ rownum * 0.28, -10.75 + colnum*0.34 + (rownum % 2) * 0.17 );
					addHex(geometry, -(1.15 + superframecount*2.2), ybase+1+ rownum * 0.28, -10.75 + colnum*0.34 + (rownum % 2) * 0.17 );
				}
			}
		}
	}

	// inner cover
	load('../models/innercover.dae', 0, (numdeeps * 12.2) + (numsupers * 8.4), 0, "Inner Cover");

	// gui testing
/*
	var cubeGeometry = new THREE.CubeGeometry( 50, 50, 50 );
	var cubeMaterial = new THREE.MeshPhongMaterial( { color:0xff0000, transparent:true, opacity:1 } );
	cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
	cube.position.set(0,30,0);
	scene.add(cube);

	var axes = new THREE.AxisHelper();
	scene.add(axes);

	
	gui = new dat.GUI();
	
	parameters = 
	{
		x: 0, y: 30, z: 0,
		color: "#ff0000", // color (change "#" to "0x")
		opacity: 1, 
		visible: true,
		material: "Phong",
		reset: function() { resetCube() }
	};

	var folder1 = gui.addFolder('Position');
	var cubeX = folder1.add( parameters, 'x' ).min(-200).max(200).step(1).listen();
	var cubeY = folder1.add( parameters, 'y' ).min(0).max(100).step(1).listen();
	var cubeZ = folder1.add( parameters, 'z' ).min(-200).max(200).step(1).listen();
	folder1.open();
	
	cubeX.onChange(function(value) 
	{   cube.position.x = value;   });
	cubeY.onChange(function(value) 
	{   cube.position.y = value;   });
	cubeZ.onChange(function(value) 
	{   cube.position.z = value;   });
	
	var cubeColor = gui.addColor( parameters, 'color' ).name('Color').listen();
	cubeColor.onChange(function(value) // onFinishChange
	{   cube.material.color.setHex( value.replace("#", "0x") );   });
	
	var cubeOpacity = gui.add( parameters, 'opacity' ).min(0).max(1).step(0.01).name('Opacity').listen();
	cubeOpacity.onChange(function(value)
	{   cube.material.opacity = value;   });
	
	var cubeMaterial = gui.add( parameters, 'material', [ "Basic", "Lambert", "Phong", "Wireframe" ] ).name('Material Type').listen();
	cubeMaterial.onChange(function(value) 
	{   updateCube();   });
	
	var cubeVisible = gui.add( parameters, 'visible' ).name('Visible?').listen();
	cubeVisible.onChange(function(value) 
	{   cube.visible = value;  	});
	
	gui.add( parameters, 'reset' ).name("Reset Cube Parameters");
	
	gui.open();
	*/
}

/*
function updateCube()
{
	var value = parameters.material;
	var newMaterial;
	if (value == "Basic")
		newMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
	else if (value == "Lambert")
		newMaterial = new THREE.MeshLambertMaterial( { color: 0x000000 } );
	else if (value == "Phong")
		newMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );
	else // (value == "Wireframe")
		newMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
	cube.material = newMaterial;
	
	cube.position.x = parameters.x;
	cube.position.y = parameters.y;
	cube.position.z = parameters.z;
	cube.material.color.setHex( parameters.color.replace("#", "0x") );
	cube.material.opacity = parameters.opacity;  
	cube.material.transparent = true;
	cube.visible = parameters.visible;
	
}
function resetCube()
{
	parameters.x = 0;
	parameters.y = 30;
	parameters.z = 0;
	parameters.color = "#ff0000";
	parameters.opacity = 1;
	parameters.visible = true;
	parameters.material = "Phong";
	updateCube();
}
*/
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

	//camera.position.x = Math.cos( timer ) * 2;
	//camera.position.y = 2;
	//camera.position.z = Math.sin( timer ) * 2;

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