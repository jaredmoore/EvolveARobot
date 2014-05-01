'use strict';

Physijs.scripts.worker = 'js/physijs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

function simulator() {

	var ground_material, projector, renderer, render_stats, physics_stats, 
		scene, ground, light, camera, box, steps, MAX_STEPS = 1000, 
		scale_factor = 1, reset_counter = 0;

	// Origin Ball Material
	var origin_ball_material = new THREE.MeshLambertMaterial();

	var breadcrumb_ball_material = new THREE.MeshLambertMaterial();
	breadcrumb_ball_material.color = new THREE.Color("rgb(0,255,255)");		

	// Ball at the origin.
	var origin_ball = new THREE.Mesh(new THREE.SphereGeometry(1,12,12), origin_ball_material);
	origin_ball_material.color = new THREE.Color("rgb(0,0,255)");

	var breadcrumb_balls = [];
	for (var i = 0; i < 10; ++i ) {
		breadcrumb_balls.push(new THREE.Mesh(new THREE.SphereGeometry(0.5,12,12), breadcrumb_ball_material));
		breadcrumb_balls[i].position.set( 0,0,0 );
	}

	var ground_material = Physijs.createMaterial(
				new THREE.MeshLambertMaterial( ),
				.8, // high friction
				.4 // low restitution
			);
	var ground_geometry = new THREE.CubeGeometry(500, 0.2, 500);

	var radius   = 1,
    	segments = 64;
    var floor_mesh = new THREE.Mesh( new THREE.CircleGeometry( radius, segments ), 
    								 new THREE.LineBasicMaterial( { transparent: true, opacity: 0.1, color: 0x0000ff } ) );
    floor_mesh.rotation.x = -Math.PI/2;
    floor_mesh.position.set ( 0,0.11,0 );

    this.scene = function() {
    	return scene;
    }

	this.initScene = function( div_to_place ) {

		projector = new THREE.Projector;
		
		var canvas = document.createElement('canvas');
		canvas.id     = "Evolution_Canvas";
		canvas.width  = 1280;
		canvas.height = 750;
		// canvas.style.zIndex   = 8;
		// canvas.style.position = "absolute";
		// canvas.style.border   = "1px solid";

		renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true });
		renderer.setSize( 1280, 750 );
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;
		document.getElementById( div_to_place ).appendChild( renderer.domElement );
		
		render_stats = new Stats();
		render_stats.domElement.style.position = 'absolute';
		render_stats.domElement.style.top = '1px';
		render_stats.domElement.style.zIndex = 100;
		document.getElementById( div_to_place ).appendChild( render_stats.domElement );

		physics_stats = new Stats();
		physics_stats.domElement.style.position = 'absolute';
		physics_stats.domElement.style.top = '50px';
		physics_stats.domElement.style.zIndex = 100;
		document.getElementById( div_to_place ).appendChild( physics_stats.domElement );
		
		initScene(true);
	};

	var initScene = function(full_init) {
		if (!scene) {
			scene = new Physijs.Scene;
			scene.addEventListener(
				'update',
				function() {

					// Set the camera to follow the center body of the robot.
					var pos = Robot.position();
					camera.position.set(60+pos.x,50,60+pos.z);

					// Update the breadcrumb trail.
					if (steps % 100 == 0 && steps/100 < breadcrumb_balls.length) {
						breadcrumb_balls[steps/100].position.set( pos.x,0,pos.z );
					}

					// Update the robot.
					Robot.update(steps);

					steps += 1;

					if (steps > MAX_STEPS) {
						// Get the position of the quadrupus
						var pos = Robot.position();

						// Synchronize with the evolutionary algorithm, return fitness and get new genome.
						if (validate) {
							validate = false;

							// Log the validated fitness.
							console.log(HillClimber.requestFitness(pos.x,pos.y,pos.z));

							Robot.setGenome(HillClimber.getGenome());
						} else {
							Robot.setGenome(HillClimber.newRobot(pos.x,pos.y,pos.z));
						}

						// Reset simulation parameters.
						steps = 0;
						resetBodies();
					} else if (validate_clicked) {
						validate_clicked = false;
						validate = true;

						Robot.setGenome(HillClimber.getBestGenomeFromIteration());

						// Reset simulation parameters.
						steps = 0;
						resetBodies();
					}

					scene.simulate( 0.005, 1 );

					physics_stats.update();
				}
			);
			
			camera = new THREE.PerspectiveCamera(
				35,
				document.getElementById("Evolution_Canvas").width / document.getElementById("Evolution_Canvas").height,
				1,
				1000
			);
			camera.position.set( 60, 50, 60 );
			camera.lookAt( scene.position );
			scene.add( camera );
			
			// Light
			light = new THREE.DirectionalLight( 0xFFFFFF );
			light.position.set( 20, 40, -15 );
			light.target.position.copy( scene.position );
			light.castShadow = true;
			light.shadowCameraLeft = -60;
			light.shadowCameraTop = -60;
			light.shadowCameraRight = 60;
			light.shadowCameraBottom = 60;
			light.shadowCameraNear = 20;
			light.shadowCameraFar = 200;
			light.shadowBias = -.0001
			light.shadowMapWidth = light.shadowMapHeight = 2048;
			light.shadowDarkness = .7;
			scene.add( light );

			// Grid on ground.
			var grid = new THREE.GridHelper(500, 10);
			grid.position = new THREE.Vector3(0,0.51,0);
			scene.add(grid);

			// Ball at the origin.
			scene.add(origin_ball);

			// Add breadcrumbs.
			for (var i = 0; i < 10; ++i ) {
				scene.add( breadcrumb_balls[i] ); 
			}

			// Circle to indicate how far the best individual has gone.
			scene.add( floor_mesh );

			// Initialize the first genome for the robot.
			Robot.setGenome(HillClimber.getGenome());
		}
		if (full_init) {
			// Ground
			ground = new Physijs.BoxMesh(
				ground_geometry,
				ground_material,
				0 // mass
			);

			// Set the collision flag and mask for the ground.
			ground._physijs.collision_type = 1;
			ground._physijs.collision_masks = 4;

			ground.receiveShadow = true;
			scene.add( ground );

			scene.setFixedTimestep = 0.005;
			scene.setGravity(new THREE.Vector3( 0, -12, 0 ));
		}
		
		// Robot.setGenome(HillClimber.getGenome());

		Robot.createRobot(validate);

		steps = 0;
	}

	this.launchSimulation = function(gen) {
		Robot.setGenome(gen);

		requestAnimationFrame( render );
		scene.simulate( 0.005, 1);
	};

	// Reset the physics worker.  Needed as ammo.js is
	// leaky.  This allows for prolonged runs.
	var resetWorker = function() {
		// Remove the ground as we reset it.
		scene.remove(ground);

		scene.replaceWorker();
	};

	// Remove an object and all associated THREE.JS objects
	// during a resetWorker situation.
	var disposeObject = function(obj) {
	    if (obj instanceof THREE.Mesh) {
	        if (obj.material.map instanceof THREE.Texture) {
	            obj.material.map.dispose();
	        }
	        obj.material.dispose();
	        if (!obj.isConnector) {
	            obj.geometry.dispose();
	        }
	    } else if (obj instanceof THREE.AxisHelper) {
	        obj.material.dispose();
	        obj.geometry.dispose();
	    }
	    if (obj.children) {
	        for (var i = 0; i < obj.children.length; i++) {
	            disposeObject(obj.children[i]);
	        }
	    }
	};

	// Remove an object from the simulation.
	var removeObject = function(obj) {
		scene.remove(obj);
        obj.removeAllEvents && obj.removeAllEvents();
        disposeObject(obj);
	}

	// Only clear objects with associated physics when resetting the
	// worker.
	var clearObjects = function() {
		for (var i = 0; i < scene.children.length; ++i) {
			var o = scene.children[i];
			if (!(o instanceof THREE.Mesh) && 
				!(o instanceof THREE.PerspectiveCamera) && 
				!(o instanceof THREE.OrthographicCamera) &&
				!(o instanceof THREE.DirectionalLight) &&
				!(o instanceof THREE.Object3D) && 
				!(o instanceof THREE.GridHelper)) {
		        removeObject(o);
		    }
		}
	};

	// Reset the state of the simulation.
	var resetBodies = function() {

		// Reset the position of the breadcrumb trail.
		for ( var i = 0; i < breadcrumb_balls.length; ++i ) {
			breadcrumb_balls[i].position.set( 0,0,0 );
		}

		// TODO: Validate Update
		// // Get the position of the quadrupus
		// var pos = Robot.position();

		// // Synchronize with the evolutionary algorithm, return fitness and get new genome.
		// Robot.setGenome(HillClimber.newRobot(pos.x,pos.y,pos.z));

		// Remove the robot.
		Robot.removeRobot();

		// Update the floor circle to the best individual.
		floor_mesh.scale.x = 1/scale_factor;
		floor_mesh.scale.y = 1/scale_factor;
		scale_factor = HillClimber.requestBestFitness();
		floor_mesh.scale.x = scale_factor;
		floor_mesh.scale.y = scale_factor;

		if (reset_counter == 1000) {
			clearObjects();
			resetWorker();
			reset_counter = 0;
			initScene(true);
		} else {
			initScene(false);
		}
		reset_counter += 1;
	};

	var render = function() {
		// console.log(renderer.domElement);
		window.requestAnimationFrame( render );
		renderer.render( scene, camera );
		render_stats.update();
	};
}

var Simulator = Simulator || new simulator();