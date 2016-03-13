if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer, objects;
var particleLight;
var dae;

var hexShape = new THREE.Shape();
hexShape.moveTo( 0,0 );
hexShape.lineTo( 0.5, 0.25 );
hexShape.lineTo( 0.5, 0.75 );
hexShape.lineTo( 0, 1 );
hexShape.lineTo( -0.5, 0.75 );
hexShape.lineTo( -0.5, 0.25 );
hexShape.lineTo( 0, 0 );

/*var hole = new THREE.Path();
hole.moveTo(0, 0.1);
hole.lineTo(0.4, 0.3);
hole.lineTo(0.4, 0.7);
hole.lineTo(0, 0.9);
hole.lineTo(-0.4, 0.7);
hole.lineTo(-0.4, 0.3);
hole.lineTo(0, 0.1);*/

var hole = new THREE.Path();
hole.moveTo( 0, 0.1 );
hole.quadraticCurveTo( 0.36, 0.1, 0.36, 0.45 );
hole.quadraticCurveTo( 0.36, 0.9, 0, 0.9 );
hole.quadraticCurveTo( -0.36, 0.9, -0.36, 0.45 );
hole.quadraticCurveTo( -0.36, 0.1, 0, 0.1 );

hexShape.holes.push(hole);

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
			setMaterial(dae, material);
			// is texture even working??

            render();
        }, function(progress) {
            // show some progress
    });
}

function addHex(geometry, x, y, z, honeyFactor, broodFactor){
	var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xf08000 } ) );
	var rand = Math.random();
	rand = rand + (1-rand)/3;
	var leftdepth = 1.5; // 0.175 minimum. no need to adjust
	var rightdepth = 1.5; // 0.175 minimum. need to adjust point which attaches to frame
	var adjustment = (rightdepth - 0.175) * 0.3
	mesh.position.set( x + adjustment /*- (1-rand/2) + 0.5*/, y, z );
	mesh.rotation.set( 0, -Math.PI/2, 0 );
	mesh.scale.set( 0.35, 0.35, leftdepth+rightdepth );
	mesh.name = "Honeycomb Cell";
	scene.add( mesh );
	//render();
}

function buildHive(numdeeps, numsupers){
	// ready cells
	var extrudeSettings = { amount: 0.3, bevelEnabled: false, bevelSegments: 1, steps: 1, bevelSize: 0.2, bevelThickness: 0.2 };
	var geometry = new THREE.ExtrudeGeometry( hexShape, extrudeSettings );

	// base entrance
	load('../models/bottomboard.dae', 0, -1.4, 0, "Bottom Board");

	// deeps
	for(var deepcount = 0 ; deepcount < numdeeps ; deepcount++){
		var ybase = deepcount * 12.2;
		load('../models/deep.dae', 0, ybase, 0, "Deep");
		for(var deepframecount = 0 ; deepframecount < 4 ; deepframecount++){
			load("../models/deepframe.dae", 1.1 + deepframecount*2.2, ybase + 0.27, 0, "Deep Frame");
			load("../models/deepframe.dae", -(1.1 + deepframecount*2.2), ybase + 0.27, 0, "Deep Frame");
			for(var rownum = 0; rownum < 43 ; rownum++ ){
				for(var colnum = 0; colnum < 68 ; colnum++ ){
					var horizontal = -10.64 + colnum*0.315 + (rownum % 2) * 0.1575;
					var vertical = ybase+1+ rownum * 0.237;
					var honey = (Math.abs(22-rownum) + Math.abs(34-colnum))/56 // close to 1 = more likely honey
					var brood = 1 - honey // close to 1 = more likely brood
					addHex(geometry, 1.15 + deepframecount*2.2, vertical, horizontal, honey, brood );
					addHex(geometry, -(1.05 + deepframecount*2.2), vertical, horizontal, honey, brood );
				}
			}
		}
	}

	// supers
	for(var supercount = 0 ; supercount < numsupers ; supercount++){
		var ybase = (numdeeps * 12.2) + supercount * 8.4;
		load('../models/super.dae', 0, ybase, 0, "Super");
		for(var superframecount = 0 ; superframecount < 4 ; superframecount++){
			load("../models/superframe.dae", 1.1 + superframecount*2.2, ybase + 0.2, 0, "Super Frame");
			load("../models/superframe.dae", -(1.1 + superframecount*2.2), ybase + 0.2, 0, "Super Frame");
			for(var rownum = 0; rownum < 28 ; rownum++ ){
				for(var colnum = 0; colnum < 68 ; colnum++ ){
					addHex(geometry, 1.4 + superframecount*2.2, ybase+1+ rownum * 0.236, -10.64 + colnum*0.315 + (rownum % 2) * 0.1575 );
					addHex(geometry, -(0.8 + superframecount*2.2), ybase+1+ rownum * 0.236, -10.64 + colnum*0.315 + (rownum % 2) * 0.1575 );
				}
			}
		}
	}

	// inner cover
	load('../models/innercover.dae', 0, (numdeeps * 12.2) + (numsupers * 8.4), 0, "Inner Cover");
}

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );
	camera.position.set( 2, 2, 3 );

	controls = new THREE.FlyControls( camera );

	controls.movementSpeed = 5;
	controls.domElement = container;
	controls.rollSpeed = Math.PI / 6;
	controls.autoForward = false;
	controls.dragToLook = false;

	scene = new THREE.Scene();

	// Ground
	var grassTex = THREE.ImageUtils.loadTexture('images/grass.png'); 
	grassTex.wrapS = THREE.RepeatWrapping; 
	grassTex.wrapT = THREE.RepeatWrapping; 
	grassTex.repeat.x = 256; 
	grassTex.repeat.y = 256; 
	var groundMat = new THREE.MeshBasicMaterial({map:grassTex}); 

	var groundGeo = new THREE.PlaneGeometry(400,400);

	var ground = new THREE.Mesh(groundGeo,groundMat); 
	ground.position.y = -1.3;
	ground.rotation.x = -Math.PI/2; //-90 degrees around the xaxis 
	ground.doubleSided = true; 
	scene.add(ground);  

	// Sky

	var urls = [ 
	    "images/sky.png", 
	    "images/sky.png", 
	    "images/sky.png", 
	    "images/sky.png", 
	    "images/sky.png", 
	    "images/sky.png", 
	]; 
	var textureCube = THREE.ImageUtils.loadTextureCube(urls);
	textureCube.format = THREE.RGBFormat; 
	//setup the cube shader 
	var shader = THREE.ShaderLib["cube"]; 
	var uniforms = THREE.UniformsUtils.clone(shader.uniforms); 
	uniforms['tCube'].texture = textureCube; 
	var material = new THREE.ShaderMaterial({ 
	        fragmentShader : shader.fragmentShader, 
	        vertexShader   : shader.vertexShader, 
	        uniforms       : uniforms 
	});
	//create a skybox 
	var size = 100; 
	skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry(size,size,size),material); 
	skyboxMesh.flipSided = true;
	scene.add(skyboxMesh);  

	// Lights

	particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
	scene.add( particleLight );

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


	// Add Objects
	buildHive(2,2);


	// GUI
	gui = new dat.GUI({
	    height : 4 * 32 - 1
	});
	
	parameters = 
	{
		month: "March",
		daytime: true,
		visibility: "All"
		//reset: function() { resetCube() }
	};

	var hiveMonth = gui.add( parameters, 'month', [ "January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ] ).name('Month').listen();
	hiveMonth.onChange(function(value) 
	{   /*updateCube(); */  });

	var hiveTime = gui.add( parameters, 'daytime' ).name('Daytime?').listen();
	
	hiveMonth.onFinishChange(function(value) 
	{   value = value;   });
	hiveTime.onChange(function(value) 
	{   /*cube.position.y = value; */  });
	
	var cubeMaterial = gui.add( parameters, 'visibility', [ "All", "Supers", "Deeps" ] ).name('View Type').listen();
	cubeMaterial.onChange(function(value) 
	{   /*updateCube(); */  });
	
	//gui.add( parameters, 'reset' ).name("Reset Cube Parameters");
	
	gui.open();
	
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

	var timer = 1

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