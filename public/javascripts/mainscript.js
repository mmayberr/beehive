if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer, objects;
var particleLight;
var dae;
var structView = "Deep Frame Detail";
var isHiveStress = false;
var hiveMonth = "March";

//mousedown events
var mouse = new THREE.Vector2(), INTERSECTED;
raycaster = new THREE.Raycaster();
document.addEventListener( 'click', onDocumentMouseMove, false );
function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// find intersections
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( scene.children );
	if( intersects.length > 0 ){// if an object was clicked
		var intersect	= intersects[ 0 ];
		var newSelected	= intersect.object;
		console.log('you clicked on mesh', newSelected)
		if(newSelected.name=='Ground' || newSelected.name==""){
			$('#info').html('Use WASD to fly, QE to tilt, & arrow keys to pivot. Click objects to see what they are!');
		}else{
			$('#info').html(newSelected.name);
		}
	}else{
		$('#info').html('Use WASD to fly, QE to tilt, & arrow keys to pivot. Click objects to see what they are!');
	}
}

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

var circ = new THREE.Shape();
circ.moveTo( 0, 0.1 );
circ.quadraticCurveTo( 0.36, 0.1, 0.36, 0.45 );
circ.quadraticCurveTo( 0.36, 0.9, 0, 0.9 );
circ.quadraticCurveTo( -0.36, 0.9, -0.36, 0.45 );
circ.quadraticCurveTo( -0.36, 0.1, 0, 0.1 );
var circGeom = new THREE.ShapeGeometry( circ );

var combTex = new THREE.MeshLambertMaterial( { color: 0x925425 } );
var eggTex1 = THREE.ImageUtils.loadTexture('images/egg.png');
var eggTex = new THREE.MeshBasicMaterial({map:eggTex1}); 
var larvaTex1 = THREE.ImageUtils.loadTexture('images/larva.png');
var larvaTex = new THREE.MeshBasicMaterial({map:larvaTex1}); 
var broodTex1 = THREE.ImageUtils.loadTexture('images/cap.png');
var broodTex = new THREE.MeshBasicMaterial({map:broodTex1}); 
//var broodTex = new THREE.MeshLambertMaterial( { color: 0xf08000 } );
var honeyTex = new THREE.MeshPhongMaterial( { color: 0xfffee5, shininess: 100 } );
var pollenTex = new THREE.MeshLambertMaterial( { color: 0xf08000 } );

var combRatios = {
	"January": {
		"numSups": 0,
		"numDeeps": 2,
		"super": {
			empty:0 //there is no super
		},
		"deep": {
			empty: 0,
			honey: 1
		},
		"activity": {
			"normal": "The bees are huddling together to stay warm, keeping the hive at a near-constant temperature.",
			"stress": "Moisture in the hive, excess space from supers which should have been removed, and extreme cold can make it difficult for the bees to stay warm. They may have trouble reaching the honey stored near the top of their hive."
		}
	},
	"February": {
		"numSups": 0,
		"numDeeps": 2,
		"super": {
			empty:0 //there is no super
		},
		"deep": {
			empty: 0,
			honey: 1
		},
		"activity": {
			"normal": "This month is generally a transition period from winter to spring. On days when the temperature is above 50°F, bees will go on cleansing flights to avoid soiling the hive. Being a crutial time for the hive, internal hive inspections are not recommended.",
			"stress": "A long winter can be fatal to a hive. Without the ability to go outside, bees may soil the hive, inviting harmful bacteria into their living space. They also won't have an early food supply to support the new brood."
		}
	},
	"March": {
		"numSups": 1,
		"numDeeps": 2,
		"super": {
			honey:0,
			empty:0.5 
		},
		"deep": {
			brood: 0.3,
			pollen:0.5,
			honey: 1
		},
		"workToDroneRatio": {
			"normal": [2.2,0.5],
			"stress": [2.1,1.2]
		},
		"activity": {
			"normal": "The weather should be warm enough for the hive to become fully active again. Deceased bees are removed from the hive and the queen begins laying her eggs.",
			"stress": "Hives often die in the early spring due to a lack of food supply. In the Deep Frame Detail notice how so few cells contain pollen or nectar."
		}
	},
	"April": {
		"numSups": 2,
		"numDeeps": 2,
		"super": {
			honey:0.2,
			empty:0.7
		},
		"deep": {
			brood: 0.5,
			pollen:0.8,
			honey: 0.9
		},
		"workToDroneRatio": {
			"normal": [2.9,1.6],
			"stress": [2,2]
		},
		"activity": {
			"normal": "The hive population explodes, as the queen is at her peak rate of egg-laying. Foragers bring back pollen and nectar from early-blooming flowers, and beekeepers should begin adding supers to the hive to prevent swarming.",
			"stress": "The queen may be weak from the winter and not laying eggs as much as she should, or a neglegent beekeeper may not have allowed enough space in the hive. Notice the increased capped drone-to-worker ratio, as well as the large swarm and supersedure cells. Both of these types of cells will create a new queen, the former for leaving the hive and the latter for overthrowing the current queen."
		}
	},
	"May": {
		"numSups": 3,
		"numDeeps": 2,
		"super": {
			honey:0.5,
			empty: 1
		},
		"deep": {
			brood: 0.8,
			pollen:1
		},
		"workToDroneRatio": {
			"normal": [3.5,0.4],
			"stress": [1,0.7]
		},
		"activity": {
			"normal": "The hive is foraging extensively, building up comb and filling up supers as they're added to the hive.",
			"stress": "The springtime is when bees are most vulnerable to spring diseases, such as chalkbrood, European foulbrood, and nosema. Remember, not adding enough supers will cause a colony to swarm!"
		}
	},
	"June": {
		"numSups": 3,
		"numDeeps": 2,
		"super": {
			honey:0
		},
		"deep": {
			brood: 0.5,
			pollen:0.8,
			honey: 0.9
		},
		"workToDroneRatio": {
			"normal": [3.6,0.2],
			"stress": [1,0.7]
		},
		"activity": {
			"normal": "It's nearing the end of the spring honey flow. Swarming becomes less likely and spring honey can be collected.",
			"stress": "The increasing heat means that more workers need to focus on water collection. If there is no source of water or no ventilation in the hive, the temperature will overwhelm them."
		}
	},
	"July": {
		"numSups": 2,
		"numDeeps": 2,
		"super": {
			honey:0.5,
			empty: 1
		},
		"deep": {
			brood: 0.5,
			pollen:0.8,
			honey: 1
		},
		"workToDroneRatio": {
			"normal": [3.5,0.3],
			"stress": [1,0.7]
		},
		"activity": {
			"normal": "The spring flow is over, but there are plenty of locations which have enough summer flowers for the bees to continue producing summer honey. Excess spring honey can be collected this month.",
			"stress": "The lack of available nectar is dangerous to the hive, especially when robber bees from other hives will invade to steal some of the vectar collected in the spring for themselves."
		}
	},
	"August": {
		"numSups": 1,
		"numDeeps": 2,
		"super": {
			honey:0
		},
		"deep": {
			brood: 0.2,
			pollen:0.4,
			honey: 0.8
		},
		"workToDroneRatio": {
			"normal": [2.8,0.2],
			"stress": [1,0.7]
		},
		"activity": {
			"normal": "The size of the colony is decreasing, both in the amount of brood and the amount of adult bees. Summer honey can be harvested.",
			"stress": "Yellow jackets and other animals may attempt to invade the hive for its honey stores. This can reduce the hive's ability to survive the winter."
		}
	},
	"September": {
		"numSups": 0,
		"numDeeps": 2,
		"super": {
			empty: 1
		},
		"deep": {
			brood: 0.2,
			pollen:0.4,
			honey: 0.5
		},
		"workToDroneRatio": {
			"normal": [1,0],
			"stress": [1,0]
		},
		"activity": {
			"normal": "Hives should be actively preparing for winter, and all excess supers should be removed from the hive to force the consolidation of resources.",
			"stress": "Hives hindered by varroa mites become easy to see; these hives will not likely survive the winter."
		}
	},
	"October": {
		"numSups": 0,
		"numDeeps": 2,
		"super": {
			empty: 1
		},
		"deep": {
			pollen:0.3,
			honey: 0.4
		},
		"activity": {
			"normal": "The hive should be ready for winter by now. Their comb should be filled with honey and pollen.",
			"stress": "Unfortunately, not all hives can find enough to forage to prepare for winter. If their comb is empty, they will need suplement sugar water to survive over winter."
		}
	},
	"November": {
		"numSups": 0,
		"numDeeps": 2,
		"super": {
			honey:0 
		},
		"deep": {
			empty: 0,
			honey: 0.2
		},
		"activity": {
			"normal": "Temperatures are dropping, and bees are rarely seen outside due to the lack of forage to collect. The queen has completely stopped laying eggs so the deeps can be filled with honey.",
			"stress": "Insufficient honey means a hive needs to be fed suplement sugar water. They also run the risk of freezing to death over the winter, especially in poorly made boxes which collect mildew."
		}
	},
	"December": {
		"numSups": 0,
		"numDeeps": 2,
		"super": {
			honey:0 
		},
		"deep": {
			empty: 0,
			honey: 0.7
		},
		"activity": {
			"normal": "Over the winter, the bees huddle together to stay warm. They surround the queen and shuffle around to comb containing honey for them to eat.",
			"stress": "If there are not enough strong, surviving bees, they may not be able to stay warm enough to survive an especially harsh winter."
		}
	}
}

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

			var material = new THREE.MeshBasicMaterial();
			if(name == "Deep Frame" || name == "Super Frame"){
            	material.map = THREE.ImageUtils.loadTexture('../images/wood.png');
        	}else{
        		material.map = THREE.ImageUtils.loadTexture('../images/wood2.png');
        	}
			setMaterial(dae, material);

			scene.add(dae);

            render();
        }, function(progress) {
            // show some progress
    });
}

function addHex(geometry, x, y, z, distFromCen, boxType){
	var mesh = new THREE.Mesh( geometry, combTex );
	var leftdepth = 1.5; // 0.175 minimum. no need to adjust
	var rightdepth = 1.5; // 0.175 minimum. need to adjust point which attaches to frame
	var adjustment = (rightdepth - 0.175) * 0.3;
	mesh.position.set( x + adjustment, y, z );
	mesh.rotation.set( 0, -Math.PI/2, 0 );
	mesh.scale.set( 0.35, 0.35, leftdepth+rightdepth );
	mesh.name = "Honeycomb Cell";
	scene.add( mesh );

	if(structView == "Super Frame Detail" || structView == "Deep Frame Detail"){
		var state = (isHiveStress) ? "stress" : "normal";
		for(var i = -1 ; i <= 1 ; i=i+2){
			if(Math.random() < 0.005){continue;}

			var cellType;
			var mindiff = 2; // max is 1, so it will always initiate cellType
			var randLvl = (boxType == "deep") ? 5 : 3;
			var distFromCen = distFromCen + (Math.random()-0.5) / randLvl;
			var combs = combRatios[hiveMonth][boxType];
			for( var index in combs ){
				if(Math.abs(combs[index]-distFromCen) < mindiff){
					mindiff = Math.abs(combs[index]-distFromCen);
					cellType = index;
				}
			}

			x = x-0.03;
			if(cellType == "brood"){
				var broodmesh
				var rats = combRatios[hiveMonth]["workToDroneRatio"][state];
				var stage = Math.random();
				var stageComp = (isHiveStress) ? [1.0/3, 2.0/3] : [1.0/7, 3.0/7]
				if(isHiveStress && stage < 0.002){ // chance of queen cell
					// Queen Cell
					broodmesh = new THREE.Mesh( new THREE.SphereGeometry( 0.42, 32, 32 ), broodTex );
					broodmesh.scale.set( 0.35, 0.9, 0.5 );
					broodmesh.rotation.set( 0, -Math.PI/2*i, 0 );
					broodmesh.position.set( x - 0.42*i, y, z );
					broodmesh.name = "Queen Cell";
					mesh.name = "Queen Cell";
				}else if( stage < stageComp[0] ){ // 1 egg : 2 : 4
					broodmesh = new THREE.Mesh( circGeom, eggTex );
					broodmesh.scale.set( 0.35, 0.35 );
					broodmesh.rotation.set( 0, -Math.PI/2*i, 0 );
					broodmesh.position.set( x - 0.2*i, y, z );
					broodmesh.name = "Egg";
					mesh.name = "Egg";
				}else if( stage < stageComp[1] ){ // 1 : 2 larva : 4
					//broodmesh = new THREE.Mesh( circGeom, larvaTex );
					broodmesh = new THREE.Mesh( new THREE.SphereGeometry( 0.42, 32, 32 ), larvaTex );
					broodmesh.scale.set( 0.3, 0.3, 0.3 );
					broodmesh.rotation.set( 0, -Math.PI/2*i, 0 );
					broodmesh.position.set( x - 0.2*i, y+0.18, z );
					broodmesh.name = "Larva";
					mesh.name = "Larva";
				}else{ // 1 : 2 : 4 capped
					if(Math.random() < rats[0] / (rats[0]+rats[1]) ){
						// worker
						broodmesh = new THREE.Mesh( circGeom, broodTex );
						broodmesh.scale.set( 0.35, 0.35 );
						broodmesh.rotation.set( 0, -Math.PI/2*i, 0 );
						broodmesh.position.set( x - 0.42*i, y, z );
						broodmesh.name = "Capped Worker Brood";
						mesh.name = "Capped Worker Brood";
					}else{
						// drone
						broodmesh = new THREE.Mesh( new THREE.SphereGeometry( 0.42, 32, 32 ), broodTex );
						broodmesh.scale.set( 0.35, 0.35, 0.35 );
						broodmesh.rotation.set( 0, -Math.PI/2*i, 0 );
						broodmesh.position.set( x - 0.42*i, y+0.18, z );
						broodmesh.name = "Capped Drone Brood";
						mesh.name = "Capped Drone Brood";
					}
				}
				scene.add( broodmesh );
			}else if(cellType == "honey"){
				if( isHiveStress && Math.random() < 0.3 && boxType == "deep" ){ continue; }
				var honmesh = new THREE.Mesh( circGeom, honeyTex );
				honmesh.position.set( x - 0.42*i, y, z );
				honmesh.rotation.set( 0, -Math.PI/2*i, 0 );
				honmesh.scale.set( 0.35, 0.35 );
				honmesh.name = "Capped Honey Cell";
				mesh.name = "Capped Honey Cell";
				scene.add( honmesh );
			}else if(cellType == "pollen"){
				if( isHiveStress && Math.random() < 0.8 ){ continue; }
				if( !isHiveStress && Math.random() < 0.1 ){ continue; }
				var polmesh = new THREE.Mesh( circGeom, pollenTex );
				polmesh.position.set( x - 0.35*i, y, z );
				polmesh.rotation.set( 0, -Math.PI/2*i, 0 );
				polmesh.scale.set( 0.35, 0.35 );
				polmesh.name = "Pollen Cell";
				mesh.name = "Pollen Cell";
				scene.add( polmesh );
			}
		}
	}
}

function buildHive(numdeeps, numsupers){
	// ready cells
	var extrudeSettings = { amount: 0.3, bevelEnabled: false, bevelSegments: 1, steps: 1, bevelSize: 0.2, bevelThickness: 0.2 };
	var geometry = new THREE.ExtrudeGeometry( hexShape, extrudeSettings );

	// deeps
	if(structView != "Super" && structView != "Super Frame Detail"){
		if(structView != "Deep Frame Detail"){
			// base entrance
			load('../models/bottomboard.dae', 0, -1.4, 0, "Bottom Board");

			if(structView == "Deep"){ numdeeps = 1; }
			for(var deepcount = 0 ; deepcount < numdeeps ; deepcount++){
				var ybase = deepcount * 12.2;
				load('../models/deep.dae', 0, ybase, 0, "Deep");
				for(var deepframecount = 0 ; deepframecount < 4 ; deepframecount++){
					load("../models/deepframe.dae", 1.1 + deepframecount*2.2, ybase + 0.27, 0, "Deep Frame");
					load("../models/deepframe.dae", -(1.1 + deepframecount*2.2), ybase + 0.27, 0, "Deep Frame");
					if(structView != "Full Structure"){
						for(var rownum = 0; rownum < 43 ; rownum++ ){
							for(var colnum = 0; colnum < 68 ; colnum++ ){
								var horizontal = -10.64 + colnum*0.315 + (rownum % 2) * 0.1575;
								var vertical = ybase+1+ rownum * 0.237;
								// distance from center is sqrt(a^2 + b^2) / 39.96, max dist
								var dist = Math.pow( Math.pow(Math.abs(22-rownum), 2) + Math.pow(Math.abs(34-colnum), 2), 1/2) / 39.96;
								/*(Math.abs(22-rownum) + Math.abs(34-colnum))/56*/ // close to 1 = more likely honey
								addHex(geometry, 1.15 + deepframecount*2.2, vertical, horizontal, dist, "deep" );
								addHex(geometry, -(1.05 + deepframecount*2.2), vertical, horizontal, dist, "deep" );
							}
						}
					}
				}
			}
		}else{
			load("../models/deepframe.dae", 1.1 + 2.2, 0.27, 0, "Deep Frame");
			for(var rownum = 0; rownum < 43 ; rownum++ ){
				for(var colnum = 0; colnum < 68 ; colnum++ ){
					var horizontal = -10.64 + colnum*0.315 + (rownum % 2) * 0.1575;
					var vertical = 1+ rownum * 0.237;
					// distance from center is sqrt(a^2 + b^2) / 39.96, max dist
					var dist = Math.pow( Math.pow(Math.abs(22-rownum), 2) + Math.pow(Math.abs(34-colnum), 2), 1/2) / 39.96;
					/*(Math.abs(22-rownum) + Math.abs(34-colnum))/56*/ // close to 1 = more likely honey
					addHex(geometry, 1.15 + 2.2, vertical, horizontal, dist, "deep" );
				}
			}
		}
	}

	// supers
	if(structView != "Deep" && structView != "Deep Frame Detail"){
		if(structView != "Super Frame Detail"){
			if(structView == "Super"){ numdeeps = 0; numsupers = 1;}
			for(var supercount = 0 ; supercount < numsupers ; supercount++){
				var ybase = (numdeeps * 12.2) + supercount * 8.4;
				load('../models/super.dae', 0, ybase, 0, "Super");
				for(var superframecount = 0 ; superframecount < 4 ; superframecount++){
					load("../models/superframe.dae", 1.1 + superframecount*2.2, ybase + 0.2, 0, "Super Frame");
					load("../models/superframe.dae", -(1.1 + superframecount*2.2), ybase + 0.2, 0, "Super Frame");
					if(structView != "Full Structure"){
						for(var rownum = 0; rownum < 28 ; rownum++ ){
							for(var colnum = 0; colnum < 68 ; colnum++ ){
								var horizontal = -10.64 + colnum*0.315 + (rownum % 2) * 0.1575;
								var vertical = ybase+1+ rownum * 0.237;
								// distance from center is sqrt(a^2 + b^2) / 36.77, max dist
								var dist = Math.pow( Math.pow(Math.abs(22-rownum), 2) + Math.pow(Math.abs(34-colnum), 2), 1/2) / 36.77;
								addHex(geometry, 1.4 + superframecount*2.2, vertical, horizontal, dist, "super" );
								addHex(geometry, -(0.8 + superframecount*2.2), vertical, horizontal, dist, "super" );
							}
						}
					}
				}
			}

			// inner cover
			load('../models/innercover.dae', 0, (numdeeps * 12.2) + (numsupers * 8.4), 0, "Inner Cover");
		}else{
			load("../models/superframe.dae", 1.1 + 2.2, 0.2, 0, "Super Frame");
			for(var rownum = 0; rownum < 28 ; rownum++ ){
				for(var colnum = 0; colnum < 68 ; colnum++ ){
					var horizontal = -10.64 + colnum*0.315 + (rownum % 2) * 0.1575;
					var vertical = 1+ rownum * 0.237;
					// distance from center is sqrt(a^2 + b^2) / 36.77, max dist
					var dist = Math.pow( Math.pow(Math.abs(22-rownum), 2) + Math.pow(Math.abs(34-colnum), 2), 1/2) / 36.77;
					addHex(geometry, 1.4 + 1*2.2, vertical, horizontal, dist, "super" );
				}
			}
		}
	}
}

function setEnv(){
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
	ground.name = "Ground";
	scene.add(ground); 

	//skybox

/*
	var urls = [ 
	    "images/sky.png", 
	    "images/sky.png", 
	    "images/sky.png", 
	    "images/sky.png", 
	    "images/sky.png", 
	    "images/sky.png", 
	]; 

	textureCube = new THREE.CubeTextureLoader().load( urls );

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = textureCube;

	var material = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide

	} ),

	mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
	mesh.position.y = 40;
	scene.add( mesh );
*/
	// Lights

	//particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
	//scene.add( particleLight );

	scene.add( new THREE.AmbientLight( 0xcccccc ) );

	var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee );
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.add( directionalLight );

	//var pointLight = new THREE.PointLight( 0xffffff, 4 );
	//particleLight.add( pointLight );
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

	setEnv();

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

	var status = (isHiveStress) ? "stress" : "normal";
	$('#act').html(combRatios[hiveMonth]["activity"][status]);

	// GUI
	gui = new dat.GUI({
	    height : 3 * 32 - 1
	});
	
	parameters = 
	{
		month: hiveMonth,
		hivestress: isHiveStress,
		visibility: structView
	};

	var newHiveMonth = gui.add( parameters, 'month', [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ] ).name('Month').listen();
	newHiveMonth.onChange(function(value){
		hiveMonth = value;
		for( var i = scene.children.length - 1; i >= 0; i--) {
     		scene.remove(scene.children[i]);
		}
		var status = (isHiveStress) ? "stress" : "normal";
		$('#act').html(combRatios[hiveMonth]["activity"][status]);
		setEnv();
		buildHive(combRatios[hiveMonth]["numDeeps"],combRatios[hiveMonth]["numSups"]); });

	var newHiveStress = gui.add( parameters, 'hivestress' ).name('Hive stress?').listen();
	newHiveStress.onChange(function(value){
		isHiveStress = !isHiveStress;
		for( var i = scene.children.length - 1; i >= 0; i--) {
     		scene.remove(scene.children[i]);
		}
		var status = (isHiveStress) ? "stress" : "normal";
		$('#act').html(combRatios[hiveMonth]["activity"][status]);
		setEnv();
		buildHive(combRatios[hiveMonth]["numDeeps"],combRatios[hiveMonth]["numSups"]); });
	
	var newStructView = gui.add( parameters, 'visibility', [ "Full Structure", "Super", "Deep", "Super Frame Detail", "Deep Frame Detail" ] ).name('View Type').listen();
	newStructView.onChange(function(value){
		structView = value;
		for( var i = scene.children.length - 1; i >= 0; i--) {
     		scene.remove(scene.children[i]);
		}
		setEnv();
		buildHive(combRatios[hiveMonth]["numDeeps"],combRatios[hiveMonth]["numSups"]); });
	
	gui.open();


	// Add Objects
	buildHive(2,2);
	
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

	//particleLight.position.x = Math.sin( 4 ) * 3009;
	//particleLight.position.y = Math.cos( 5 ) * 4000;
	//particleLight.position.z = Math.cos( 4 ) * 3009;

	delta = clock.getDelta();

	//THREE.AnimationHandler.update( delta );

	controls.update( delta );
	//renderer.setClearColor(0xffffff, 0);
	renderer.render( scene, camera );

}

// main

init();
animate();