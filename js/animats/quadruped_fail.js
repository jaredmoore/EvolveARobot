function quadruped() {

	var quadruped = [], constraints = [];
	// Quadruped constants for materials, don't need to be creating and deleting these all the time.
	var box_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial(),
		.95, // low friction
		.6 // high restitution
	);
	// box_material.color = new THREE.Color("rgb(255,0,0)");

	var main_body_leg_connector = new THREE.CubeGeometry( 4, 1, 4 );
	var main_body_spine_segment = new THREE.CubeGeometry( 3, 1, 2 );
	var upp_leg_1 = new THREE.CubeGeometry( 0.75, 0.75, 0.25 );
	var upp_leg_2 = new THREE.CubeGeometry( 0.75, 0.75, 5.75 );
	var ver_leg = new THREE.CubeGeometry( 0.75, 6.0, 0.75 );

	var evo_color = new THREE.Color("rgb(255,0,0)");
	var val_color = new THREE.Color("rgb(0,255,0)");

	var genome;

	// Initialize a genome for this robot, handled by HillClimber
	this.initGenome = function() {
		var gen = [];

		// Start with a randomized genome.
		// Randomize the speed.
		for (var i = 0; i < 16; ++i) {
			gen.push((-1.0 + 2.0*Math.random()).toFixed(8));
		}

		// Randomize the duration.
		for (var i = 16; i < 32; ++i) {
			gen.push(10 + Math.floor(190*Math.random()));	
		}

		return gen;
	}

	// Mutate a genome for this robot, handled by HillClimber
	this.mutateGenome = function(gen) {
		var index = Math.floor(Math.random() * 32);
		if (index == 32) {
			index = 31;
		}
		if (index < 16) {
			gen[index] = (-1.0 + 2.0*Math.random()).toFixed(8);
		} else {
			gen[index] = Math.floor(10 + Math.floor(190*Math.random()));	
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
				constraints[i].enableAngularMotor(-4.0*genome[i],10000);
			} else {
				constraints[i].enableAngularMotor(4.0*genome[i],10000);
			}
		}

		// // //Actuate joints in the constraints.
		// for(var i = 4; i < constraints.length; ++i) {
		// 	if(steps % 200 < 100) {
		// 		constraints[i].enableAngularMotor(-4.0,1000000);
		// 	} else {
		// 		constraints[i].enableAngularMotor(4.0,1000000);
		// 	}
		// }

		// //Actuate joints in the constraints.
		// for(var i = 8; i < constraints.length; ++i) {
		// 	if(steps % 200 < 100) {
		// 		constraints[i].enableAngularMotor(-4.0,2000);
		// 	} else {
		// 		constraints[i].enableAngularMotor(4.0,2000);
		// 	}
		// }
	}

	// Get the position of the main body.
	this.position = function() {
		return quadruped[2].position;
	}

	this.createRobot = function(validate) {

		// Color body based on whether or not we're validating.
		if (validate) {
			box_material.color = val_color;
		} else {
			box_material.color = evo_color;
		}

		// Constants for the robot.
		var body_height = 16;
		var spine_joint_range = 0.523598776; // 30 Degrees
		var joint_range = 1.04719755; // 90 Degrees
		var bias = 0.1, relaxation = 0.1;

		// Main Body

		// Front body segment
		box = new Physijs.BoxMesh(
			main_body_leg_connector,
			box_material,
			2
		);
		box.position.set(6.5,body_height,0);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Front spine segment
		box = new Physijs.BoxMesh(
			main_body_spine_segment,
			box_material,
			2
		);
		box.position.set(3,body_height,0);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between Front Body and Front Spine
		var hinge = new Physijs.HingeConstraint(quadruped[0],quadruped[1],new THREE.Vector3(4.5,body_height,0),new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-spine_joint_range,spine_joint_range,bias,relaxation);

		// Middle spine segment
		box = new Physijs.BoxMesh(
			main_body_spine_segment,
			box_material,
			2
		);
		box.position.set(0,body_height,0);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between Front Spine and Mid Spine
		var hinge = new Physijs.HingeConstraint(quadruped[1],quadruped[2],new THREE.Vector3(1.5,body_height,0),new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-spine_joint_range,spine_joint_range,bias,relaxation);

		// Rear spine segment
		box = new Physijs.BoxMesh(
			main_body_spine_segment,
			box_material,
			2
		);
		box.position.set(-3,body_height,0);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between Mid Spine and Rear Spine
		var hinge = new Physijs.HingeConstraint(quadruped[2],quadruped[3],new THREE.Vector3(-1.5,body_height,0),new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-spine_joint_range,spine_joint_range,bias,relaxation);

		// Rear body segment
		box = new Physijs.BoxMesh(
			main_body_leg_connector,
			box_material,
			2
		);
		box.position.set(-6.5,body_height,0);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between Rear Spine and Rear Body Segment
		var hinge = new Physijs.HingeConstraint(quadruped[3],quadruped[4],new THREE.Vector3(-4.5,body_height,0),new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-spine_joint_range,spine_joint_range,bias,relaxation);

		// Left Front Upper Leg
		box = new Physijs.BoxMesh(
			upp_leg_1,
			box_material,
			1
		);
		box.position.set(6.5,body_height,-2.125);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between Front Body and Left Leg
		var hinge = new Physijs.HingeConstraint(quadruped[0],quadruped[5],new THREE.Vector3(6.5,body_height,-2),new THREE.Vector3(0,-1,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Right Front Upper Leg
		box = new Physijs.BoxMesh(
			upp_leg_1,
			box_material,
			1
		);
		box.position.set(6.5,body_height,2.125);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between Front Body and Right Leg
		var hinge = new Physijs.HingeConstraint(quadruped[0],quadruped[6],new THREE.Vector3(6.5,body_height,2),new THREE.Vector3(0,1,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Left Rear Upper Leg
		box = new Physijs.BoxMesh(
			upp_leg_1,
			box_material,
			1
		);
		box.position.set(-6.5,body_height,-2.125);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between Rear Body and Left Leg
		var hinge = new Physijs.HingeConstraint(quadruped[4],quadruped[7],new THREE.Vector3(-6.5,body_height,-2),new THREE.Vector3(0,-1,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Right Rear Upper Leg
		box = new Physijs.BoxMesh(
			upp_leg_1,
			box_material,
			1
		);
		box.position.set(-6.5,body_height,2.125);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between Rear Body and Right Leg
		var hinge = new Physijs.HingeConstraint(quadruped[4],quadruped[8],new THREE.Vector3(-6.5,body_height,2),new THREE.Vector3(0,1,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Left Front Upper Leg 2
		box = new Physijs.BoxMesh(
			upp_leg_2,
			box_material,
			1
		);
		box.position.set(6.5,body_height,-5.125);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between FLUL1 and FLUL2
		var hinge = new Physijs.HingeConstraint(quadruped[5],quadruped[9],new THREE.Vector3(6.5,body_height,-2.25),new THREE.Vector3(-1,0,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Right Front Upper Leg 2
		box = new Physijs.BoxMesh(
			upp_leg_2,
			box_material,
			1
		);
		box.position.set(6.5,body_height,5.125);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between FRUL1 and FRUL2
		var hinge = new Physijs.HingeConstraint(quadruped[6],quadruped[10],new THREE.Vector3(6.5,body_height,2.25),new THREE.Vector3(1,0,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Left Rear Upper Leg 2
		box = new Physijs.BoxMesh(
			upp_leg_2,
			box_material,
			1
		);
		box.position.set(-6.5,body_height,-5.125);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between RLUL1 and RLUL2
		var hinge = new Physijs.HingeConstraint(quadruped[7],quadruped[11],new THREE.Vector3(-6.5,body_height,-2.25),new THREE.Vector3(-1,0,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Right Rear Upper Leg 2
		box = new Physijs.BoxMesh(
			upp_leg_2,
			box_material,
			1
		);
		box.position.set(-6.5,body_height,5.125);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between RRUL1 and RRUL2
		var hinge = new Physijs.HingeConstraint(quadruped[8],quadruped[12],new THREE.Vector3(-6.5,body_height,2.25),new THREE.Vector3(1,0,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Left Front Vertical Leg
		box = new Physijs.BoxMesh(
			ver_leg,
			box_material,
			1
		);
		box.position.set(6.5,body_height-3,-8);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between FLUL2 and FLVL
		var hinge = new Physijs.HingeConstraint(quadruped[9],quadruped[13],new THREE.Vector3(6.5,body_height,-8),new THREE.Vector3(-1,0,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Right Front Vertical Leg
		box = new Physijs.BoxMesh(
			ver_leg,
			box_material,
			1
		);
		box.position.set(6.5,body_height-3,8);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between FRUL2 and FRUVL
		var hinge = new Physijs.HingeConstraint(quadruped[10],quadruped[14],new THREE.Vector3(6.5,body_height,8),new THREE.Vector3(1,0,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Left Rear Vertical Leg
		box = new Physijs.BoxMesh(
			ver_leg,
			box_material,
			1
		);
		box.position.set(-6.5,body_height-3,-8);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between RLUL2 and RLUVL
		var hinge = new Physijs.HingeConstraint(quadruped[11],quadruped[15],new THREE.Vector3(-6.5,body_height,-8),new THREE.Vector3(-1,0,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// Right Rear Vertical Leg
		box = new Physijs.BoxMesh(
			ver_leg,
			box_material,
			1
		);
		box.position.set(-6.5,body_height-3,8);
		box.scale.set(1,1,1);
		box.castShadow = true;
		Simulator.scene().add( box );
		quadruped.push( box );

		// Create Hinge between RRUL2 and RRVL
		var hinge = new Physijs.HingeConstraint(quadruped[12],quadruped[16],new THREE.Vector3(-6.5,body_height,8),new THREE.Vector3(1,0,0));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

	}

	this.removeRobot = function() {
		// Remove the hinges
		for (var i = 0; i < constraints.length; ++i) {
			Simulator.scene().removeConstraint(constraints[i]);
		}

		// Remove the bodies
		for (var i = 0; i < quadruped.length; ++i) {
			Simulator.scene().remove(quadruped[i]);
		}

		// Clear the arrays.
		for (var i = 0; i < constraints.length; ++i) {
			constraints[i] = null;
		}

		for (var i = 0; i < quadruped.length; ++i) {
			quadruped[i] = null;
		}

		constraints = [];
		quadruped = [];
	}
};