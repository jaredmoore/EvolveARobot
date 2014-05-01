Math.degrees = function(rad)
{
	return rad*(180/Math.PI);
}
 
Math.radians = function(deg)
{
	return deg * (Math.PI/180);
}

function octopod() {

	var octopod = [], constraints = [];
	// Octopod constants for materials, don't need to be creating and deleting these all the time.
	var box_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial(),
		.95, // low friction
		.6 // high restitution
	);
	// box_material.color = new THREE.Color("rgb(255,0,0)");

	var main_body_leg_connector = new THREE.CubeGeometry( 4, 1, 4 );
	var main_body_spine_segment = new THREE.CubeGeometry( 3, 1, 2 );
	var upp_leg = new THREE.CubeGeometry( 0.75, 0.75, 3.0 );
	var ver_leg = new THREE.CubeGeometry( 0.75, 3.0, 0.75 );

	var evo_color = new THREE.Color("rgb(255,0,0)");
	var val_color = new THREE.Color("rgb(0,255,0)");

	var genome;

	// Initialize a genome for this robot, handled by HillClimber
	this.initGenome = function() {
		var gen = [];

		// Start with a randomized genome.
		// Randomize the speed.
		for (var i = 0; i < 22; ++i) {
			gen.push((-1.0 + 2.0*Math.random()).toFixed(8));
		}

		// Randomize the duration.
		for (var i = 22; i < 44; ++i) {
			gen.push(10 + Math.floor(190*Math.random()));	
		}

		// Randomize the axis of the spine joints.
		for (var i = 0; i < 6; ++i) {
			if (Math.random() < 0.5) {
				gen.push([0,0,1]);
			} else {
				gen.push([0,1,0]);
			}
		}

		// Randomize the axis of the hip joints.
		var chance = Math.random();
		if (chance < 0.33) {
			gen.push([1,0,0]);
		} else if (chance < 0.66) {
			gen.push([0,1,0]);
		} else {
			gen.push([0,0,1]);
		}

		// Randomize the axis of the knee joints.
		var chance = Math.random();
		if (chance < 0.33) {
			gen.push([1,0,0]);
		} else if (chance < 0.66) {
			gen.push([0,1,0]);
		} else {
			gen.push([0,0,1]);
		}

		return gen;
	}

	this.genomeLength = function() {
		return genome.length;
	}

	// Mutate a genome for this robot, handled by HillClimber
	this.mutateGenome = function(gen) {
		for (var index = 0; index < genome.length; ++index) {
			if (Math.random() < 0.05) {
				if (index < 22) {
					gen[index] = (-1.0 + 2.0*Math.random()).toFixed(8);
				} else if (index < 44) {
					gen[index] = Math.floor(10 + Math.floor(190*Math.random()));	
				} else if (index < 50) {
					if (Math.random() < 0.5) {
						gen[index] = [0,0,1];
					} else {
						gen[index] = [0,1,0];
					}
				} else {
					var chance = Math.random();
					if (chance < 0.33) {
						gen[index] = [1,0,0];
					} else if (chance < 0.66) {
						gen[index] = [0,1,0];
					} else {
						gen[index] = [0,0,1];
					}
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
			if((steps % genome[i+16]) < genome[i+16]/2 == 0) {
				constraints[i].enableAngularMotor(-4.0*genome[i],1000);
			} else {
				constraints[i].enableAngularMotor(4.0*genome[i],1000);
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
		return octopod[21].position;
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
		var spine_joint_range = Math.radians(15);
		var joint_range = Math.radians(90);
		var bias = 0.1, relaxation = 0.1;

		var seg_locations = [10.5,3.5,-3.5,-10.5];
		var spine_seg_locations = [6.5,0.0,-6.5];

		// Create the main body leg segments and legs.
		for (var i = 0; i < seg_locations.length; ++i) {
		
			// Front body segment
			box = new Physijs.BoxMesh(
				main_body_leg_connector,
				box_material,
				2
			);
			box.position.set(seg_locations[i],body_height,0);
			box.scale.set(1,1,1);
			box.castShadow = true;

			// Collision filtering to only collide with the ground.
			box._physijs.collision_type = 4;
			box._physijs.collision_masks = 1;

			Simulator.scene().add( box );
			octopod.push( box );

			// Left Front Upper Leg
			box = new Physijs.BoxMesh(
				upp_leg,
				box_material,
				1
			);
			box.position.set(seg_locations[i],body_height,-3.5);
			box.scale.set(1,1,1);
			box.castShadow = true;

			// Collision filtering to only collide with the ground.
			box._physijs.collision_type = 4;
			box._physijs.collision_masks = 1;

			Simulator.scene().add( box );
			octopod.push( box );

			// Create Hinge between Front Body and Left Leg
			var hinge = new Physijs.HingeConstraint(octopod[0+(5*i)],octopod[1+(5*i)],
							new THREE.Vector3(seg_locations[i],body_height,-2),
							new THREE.Vector3(genome[50][0],genome[50][1],genome[50][2]));
			Simulator.scene().addConstraint(hinge);
			constraints.push(hinge);
			hinge.setLimits(-joint_range,joint_range,bias,relaxation);

			// Right Front Upper Leg
			box = new Physijs.BoxMesh(
				upp_leg,
				box_material,
				1
			);
			box.position.set(seg_locations[i],body_height,3.5);
			box.scale.set(1,1,1);
			box.castShadow = true;

			// Collision filtering to only collide with the ground.
			box._physijs.collision_type = 4;
			box._physijs.collision_masks = 1;
			
			Simulator.scene().add( box );
			octopod.push( box );

			// Create Hinge between Front Body and Left Leg
			var hinge = new Physijs.HingeConstraint(octopod[0+(5*i)],octopod[2+(5*i)],
							new THREE.Vector3(seg_locations[i],body_height,2),
							new THREE.Vector3(-genome[50][0],genome[50][1],genome[50][2]));
			Simulator.scene().addConstraint(hinge);
			constraints.push(hinge);
			hinge.setLimits(-joint_range,joint_range,bias,relaxation);

			// Left Front Lower Leg
			box = new Physijs.BoxMesh(
				ver_leg,
				box_material,
				1
			);
			box.position.set(seg_locations[i],body_height-1.5,-5);
			box.scale.set(1,1,1);
			box.castShadow = true;

			// Collision filtering to only collide with the ground.
			box._physijs.collision_type = 4;
			box._physijs.collision_masks = 1;
			
			Simulator.scene().add( box );
			octopod.push( box );

			// Create Hinge between Front Body and Left Leg
			var hinge = new Physijs.HingeConstraint(octopod[1+(5*i)],octopod[3+(5*i)],
							new THREE.Vector3(seg_locations[i],body_height,-5),
							new THREE.Vector3(genome[51][0],genome[51][1],genome[51][2]));
			Simulator.scene().addConstraint(hinge);
			constraints.push(hinge);
			hinge.setLimits(-joint_range,joint_range,bias,relaxation);

			// Right Front Lower Leg
			box = new Physijs.BoxMesh(
				ver_leg,
				box_material,
				1
			);
			box.position.set(seg_locations[i],body_height-1.5,5);
			box.scale.set(1,1,1);
			box.castShadow = true;

			// Collision filtering to only collide with the ground.
			box._physijs.collision_type = 4;
			box._physijs.collision_masks = 1;
			
			Simulator.scene().add( box );
			octopod.push( box );

			// Create Hinge between Front Body and Left Leg
			var hinge = new Physijs.HingeConstraint(octopod[2+(5*i)],octopod[4+(5*i)],
							new THREE.Vector3(seg_locations[i],body_height,5),
							new THREE.Vector3(-genome[51][0],genome[51][1],genome[51][2]));
			Simulator.scene().addConstraint(hinge);
			constraints.push(hinge);
			hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		}

		// Create the spine segments connecting the bodies.
		for (var i = 0; i < 3; ++i) {
			// Spine Segment
			box = new Physijs.BoxMesh(
				main_body_spine_segment,
				box_material,
				1
			);
			box.position.set(spine_seg_locations[i],body_height,0.0);
			box.scale.set(1,1,1);
			box.castShadow = true;

			// Collision filtering to only collide with the ground.
			box._physijs.collision_type = 4;
			box._physijs.collision_masks = 1;
			
			Simulator.scene().add( box );
			octopod.push( box );

			// Create Hinge between Forward Body and Spine
			var hinge = new Physijs.HingeConstraint(octopod[0+(5*i)],octopod[20+(i)],
													new THREE.Vector3(seg_locations[i]-2.0,body_height,0),
													new THREE.Vector3(genome[44+(i*2)][0],genome[44+(i*2)][1],genome[44+(i*2)][2]));
			Simulator.scene().addConstraint(hinge);
			constraints.push(hinge);
			hinge.setLimits(-spine_joint_range,spine_joint_range,bias,relaxation);

			// Create Hinge between Rearward Body and Spine
			var hinge = new Physijs.HingeConstraint(octopod[5+(5*i)],octopod[20+(i)],
													new THREE.Vector3(seg_locations[i+1]+2.0,body_height,0),
													new THREE.Vector3(genome[44+(i*2+1)][0],genome[44+(i*2+1)][1],genome[44+(i*2+1)][2]));
			Simulator.scene().addConstraint(hinge);
			constraints.push(hinge);
			hinge.setLimits(-spine_joint_range,spine_joint_range,bias,relaxation);
		}

	}

	this.removeRobot = function() {
		// Remove the hinges
		for (var i = 0; i < constraints.length; ++i) {
			Simulator.scene().removeConstraint(constraints[i]);
		}

		// Remove the bodies
		for (var i = 0; i < octopod.length; ++i) {
			Simulator.scene().remove(octopod[i]);
		}

		// Clear the arrays.
		for (var i = 0; i < constraints.length; ++i) {
			constraints[i] = null;
		}

		for (var i = 0; i < octopod.length; ++i) {
			octopod[i] = null;
		}

		constraints = [];
		octopod = [];
	}
};