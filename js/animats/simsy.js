Math.degrees = function(rad)
{
	return rad*(180/Math.PI);
}
 
Math.radians = function(deg)
{
	return deg * (Math.PI/180);
}

function simsy() {

	var simsy = [], constraints = [], num_segs = 10;
	// Simsy constants for materials, don't need to be creating and deleting these all the time.
	var box_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial(),
		.95, // low friction
		.6 // high restitution
	);
	// box_material.color = new THREE.Color("rgb(255,0,0)");

	var bodies = [];

	for (var i = 0; i < num_segs; ++i) {
		bodies.push(new THREE.CubeGeometry( 1, 1, 1 ));
	}

	var evo_color = new THREE.Color("rgb(255,0,0)");
	var val_color = new THREE.Color("rgb(0,255,0)");

	var genome;

	// Initialize a genome for this robot, handled by HillClimber
	this.initGenome = function() {
		var gen = [];

		// Start with a randomized genome.

		//Randomize the length, width, and height for each box.
		for (var i = 0; i < num_segs; ++i) {
			gen.push((4. * Math.random()).toFixed(4)); // Length
			gen.push((4. * Math.random()).toFixed(4)); // Width
			gen.push((4. * Math.random()).toFixed(4)); // Height
		}

		// Randomize the Joint Axis
		for (var i = 0; i < num_segs-1; ++i) {
			var rand = Math.random();
			if (rand < 0.33) {
				gen.push([1,0,0]);
			} else if (rand < 0.66) {
				gen.push([0,1,0]);
			} else {
				gen.push([0,0,1]);
			}
		}

		// Randomize the Range of Motion
		for (var i = 0; i < num_segs-1; ++i) {
			gen.push((90. * Math.random()).toFixed(4));
		}

		// Randomize the speed.
		for (var i = 0; i < num_segs-1; ++i) {
			gen.push((-1.0 + 2.0*Math.random()).toFixed(4));
		}

		// Randomize the duration.
		for (var i = 0; i < num_segs-1; ++i) {
			gen.push(10 + Math.floor(190*Math.random()));
		}

		return gen;
	}

	this.genomeLength = function() {
		return genome.length;
	}

	this.cameraFollow = function() {
		return null;
	}

	// Mutate a genome for this robot, handled by HillClimber
	this.mutateGenome = function(gen) {
		for (var index = 0; index < genome.length; ++index) {
			if (Math.random() < 0.05) {
				if (index < num_segs * 3) {
					gen[index] = (4. * Math.random()).toFixed(4);
				} else if (index < num_segs*3 + (num_segs-1)) {
					var rand = Math.random();
					if (rand < 0.33) {
						gen[index] = [1,0,0];
					} else if (rand < 0.66) {
						gen[index] = [0,1,0];
					} else {
						gen[index] = [0,0,1];
					}
				} else if (index < num_segs*3 + (num_segs-1)*2) {
					gen[index] = (90. * Math.random()).toFixed(4);
				} else if (index < num_segs*3 + (num_segs-1)*3 ) {
					gen[index] = (-1.0 + 2.0*Math.random()).toFixed(4);
				} else {
					gen[index] = 10 + Math.floor(190*Math.random());
				}
			}
		}

		return gen;
	}

	this.setGenome = function(gen) {
		genome = gen.slice();
	}

	this.update = function(steps) {
		// Actuate joints in the constraints.
		for(var i = 0; i < constraints.length; ++i) {
			if((steps % genome[(num_segs*3) + ((num_segs-1)*3) + i]) < genome[(num_segs*3) + ((num_segs-1)*3) + i]/2 == 0) {
				constraints[i].enableAngularMotor(-3.0*genome[(num_segs*3) + ((num_segs-1)*2) + i],1000);
			} else {
				constraints[i].enableAngularMotor( 3.0*genome[(num_segs*3) + ((num_segs-1)*2) + i],1000);
			}
		}

		//Actuate joints in the constraints.
		// for(var i = 8; i < constraints.length; ++i) {
		// 	if(steps % 200 < 100) {
		// 		constraints[i].enableAngularMotor(-4.0,1000000);
		// 	} else {
		// 		constraints[i].enableAngularMotor(4.0,1000000);
		// 	}
		// }

		//Actuate joints in the constraints.
		// for(var i = 16; i < constraints.length; ++i) {
		// 	if(steps % 200 < 100) {
		// 		constraints[i].enableAngularMotor(-4.0,2000);
		// 	} else {
		// 		constraints[i].enableAngularMotor(4.0,2000);
		// 	}
		// }

		// if(steps % 200 < 100) {
		// 	constraints[17].enableAngularMotor(-4.0,2000);
		// } else {
		// 	constraints[17].enableAngularMotor(4.0,2000);
		// }

		// if(steps % 200 < 100) {
		// 	constraints[19].enableAngularMotor(-4.0,100);
		// } else {
		// 	constraints[19].enableAngularMotor(4.0,100);
		// }

		// if(steps % 200 < 100) {
		// 	constraints[21].enableAngularMotor(-4.0,100);
		// } else {
		// 	constraints[21].enableAngularMotor(4.0,100);
		// }
	}

	// Get the position of the main body.
	this.position = function() {
		var pos = -1;
		for (var i = Math.floor(num_segs/2)-2; i < Math.floor(num_segs/2)+2; ++i) {
			if (pos == -1) {
				pos = simsy[i].position;
			} else {
				var tmp_pos = simsy[i].position;
				pos.x += tmp_pos.x;
				pos.z += tmp_pos.z;
			}
		}

		pos.x = pos.x/((Math.floor(num_segs/2)+2) - (Math.floor(num_segs/2)-2));
		pos.z = pos.z/((Math.floor(num_segs/2)+2) - (Math.floor(num_segs/2)-2));

		return pos;
	}

	this.createRobot = function(validate) {

		// Color body based on whether or not we're validating.
		if (validate) {
			box_material.color = val_color;
		} else {
			box_material.color = evo_color;
		}

		// Constants for the robot.
		var body_height = 4.0;
		var bias = 0.5, relaxation = 0.0;

		var pos = [0,body_height,0];
		
		// Set the starting position so that the middle of the robot is at 0, body_height ,0
		for(var i = 0; i < num_segs/2; ++i) {
			pos[0] -= genome[i*3];
		}

		for ( var i = 0; i < num_segs; ++i) {
			// Front body segment
			box = new Physijs.BoxMesh(
				bodies[i],
				box_material,
				2
			);

			box._physijs.collision_type = 4;
			box._physijs.collision_masks = 1;

			// Setup the position based on half the x length of the body.
			if (i > 0) {
				pos[0] += genome[i*3]/2.;
			}

			box.position.set(pos[0],pos[1],pos[2]);
			box.scale.set(1,1,1);
			box.scale.set(genome[i*3],genome[i*3+1],genome[i*3+2])
			box.castShadow = true;
			Simulator.scene().add( box );
			simsy.push( box );

			// Add the rest of the current box to position.
			pos[0] += genome[i*3]/2.;

			if (i > 0) {
				// Add a constraint between the current body and previous one.
				var hinge = new Physijs.HingeConstraint(simsy[i-1],simsy[i],
								new THREE.Vector3(pos[0]-(genome[i*3]),pos[1],pos[2]),
								new THREE.Vector3(genome[(num_segs*3)+i-1][0],genome[(num_segs*3)+i-1][1],genome[(num_segs*3)+i-1][2]));
				Simulator.scene().addConstraint(hinge);
				constraints.push(hinge);
				// hinge.setLimits(-genome[(num_segs*3)+(num_segs-1)+i],genome[(num_segs*3)+(num_segs-1)+i],bias,relaxation);
			}
		}

	}

	this.removeRobot = function() {
		// Remove the hinges
		for (var i = 0; i < constraints.length; ++i) {
			Simulator.scene().removeConstraint(constraints[i]);
		}

		// Remove the bodies
		for (var i = 0; i < simsy.length; ++i) {
			Simulator.scene().remove(simsy[i]);
		}

		// Clear the arrays.
		for (var i = 0; i < constraints.length; ++i) {
			constraints[i] = null;
		}

		for (var i = 0; i < simsy.length; ++i) {
			simsy[i] = null;
		}

		constraints = [];
		simsy = [];
	}
};