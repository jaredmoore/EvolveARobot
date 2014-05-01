function quadrupus() {

	var quadrupus = [], constraints = [];
	// Quadrupus constants for materials, don't need to be creating and deleting these all the time.
	var box_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial(),
		.4, // low friction
		.6 // high restitution
	);
	// box_material.color = new THREE.Color("rgb(255,0,0)");

	var main_body = new THREE.CubeGeometry( 4, 1, 4 );
	var ew_leg = new THREE.CubeGeometry( 6, 0.75, 0.75 );
	var ns_leg = new THREE.CubeGeometry( 0.75, 0.75, 6.0 );
	var ver_leg = new THREE.CubeGeometry( 0.75, 4.0, 0.75 );

	var evo_color = new THREE.Color("rgb(255,0,0)");
	var val_color = new THREE.Color("rgb(0,255,0)");

	var genome;

	// Initialize a genome for this robot, handled by HillClimber
	this.initGenome = function() {
		var gen = [];

		// Start with a randomized genome.
		// Randomize the speed.
		for (var i = 0; i < 8; ++i) {
			gen.push((-1.0 + 2.0*Math.random()).toFixed(8));
		}

		// Randomize the duration.
		for (var i = 8; i < 16; ++i) {
			gen.push(100 + Math.floor(100*Math.random()));	
		}

		return gen;
	}

	// Mutate a genome for this robot, handled by HillClimber
	this.mutateGenome = function(gen) {
		var index = Math.floor(Math.random() * 16);
		if (index == 16) {
			index = 15;
		}
		if (index < 8) {
			gen[index] = (-1.0 + 2.0*Math.random()).toFixed(8);
		} else {
			gen[index] = Math.floor(200*Math.random());	
		}

		return gen;
	}

	this.setGenome = function(gen) {
		genome = gen.slice();
	}

	this.update = function(steps) {
		// Actuate joints in the constraints.
		for(var i = 0; i < constraints.length; ++i) {
			if((steps % genome[i+8]) < genome[i+8]/2 == 0) {
				constraints[i].enableAngularMotor(-2.0*genome[i],500);
			} else {
				constraints[i].enableAngularMotor(2.0*genome[i],500);
			}
		}

		// //Actuate joints in the constraints.
		// for(var i = 0; i < constraints.length; ++i) {
		// 	if(steps % 200 < 100) {
		// 		constraints[i].enableAngularMotor(-1.0,100);
		// 	} else {
		// 		constraints[i].enableAngularMotor(1.0,100);
		// 	}
		// }
	}

	// Get the position of the main body.
	this.position = function() {
		return quadrupus[0].position;
	}

	this.createRobot = function(validate) {
		
		var body_height = 16;

		if (validate) {
			box_material.color = val_color;
		} else {
			box_material.color = evo_color;
		}

		var joint_range = 1.04719755;

		// Main Body
		box = new Physijs.BoxMesh(
			main_body,
			box_material,
			10
		);
		box.position.set(0,body_height,0);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );

		// West Upper Leg
		box = new Physijs.BoxMesh(
			ew_leg,
			box_material,
			1
		);
		box.position.set(-5,body_height,0);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );

		var bias = 0.5, relaxation = 0.0;

		// Create Hinge between MB and WUL
		var hinge = new Physijs.HingeConstraint(quadrupus[0],quadrupus[1],new THREE.Vector3(-2,body_height,0),new THREE.Vector3(0,0,1));//,new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// South Upper Leg
		box = new Physijs.BoxMesh(
			ns_leg,
			box_material,
			1
		);
		box.position.set(0,body_height,5);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );	

		hinge = new Physijs.HingeConstraint(quadrupus[0],quadrupus[2],new THREE.Vector3(0,body_height,2),new THREE.Vector3(1,0,0));//,new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// East Upper Leg
		box = new Physijs.BoxMesh(
			ew_leg,
			box_material,
			1
		);
		box.position.set(5,body_height,0);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );	

		hinge = new Physijs.HingeConstraint(quadrupus[0],quadrupus[3],new THREE.Vector3(2,body_height,0),new THREE.Vector3(0,0,-1));//,new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// North Upper Leg
		box = new Physijs.BoxMesh(
			ns_leg,
			box_material,
			1
		);
		box.position.set(0,body_height,-5);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );	

		hinge = new Physijs.HingeConstraint(quadrupus[0],quadrupus[4],new THREE.Vector3(0,body_height,-2),new THREE.Vector3(-1,0,0));//,new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// West Lower Leg
		box = new Physijs.BoxMesh(
			ver_leg,
			box_material,
			1
		);
		box.position.set(-8,body_height-2,0);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );	

		hinge = new Physijs.HingeConstraint(quadrupus[1],quadrupus[5],new THREE.Vector3(-8,body_height,0),new THREE.Vector3(0,0,1));//,new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// South Lower Leg
		box = new Physijs.BoxMesh(
			ver_leg,
			box_material,
			1
		);
		box.position.set(0,body_height-2,8);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );	

		hinge = new Physijs.HingeConstraint(quadrupus[2],quadrupus[6],new THREE.Vector3(0,body_height,8),new THREE.Vector3(1,0,0));//,new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// East Lower Leg
		box = new Physijs.BoxMesh(
			ver_leg,
			box_material,
			1
		);
		box.position.set(8,body_height-2,0);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );	

		hinge = new Physijs.HingeConstraint(quadrupus[3],quadrupus[7],new THREE.Vector3(8,body_height,0),new THREE.Vector3(0,0,-1));//,new THREE.Vector3(0,0,1));
		Simulator.scene().addConstraint(hinge);
		constraints.push(hinge);
		hinge.setLimits(-joint_range,joint_range,bias,relaxation);

		// North Lower Leg
		box = new Physijs.BoxMesh(
			ver_leg,
			box_material,
			1
		);
		box.position.set(0,body_height-2,-8);
		box.scale.set(1,1,1);
		box.castShadow = true;

		// Collision filtering to only collide with the ground.
		box._physijs.collision_type = 4;
		box._physijs.collision_masks = 1;
		
		Simulator.scene().add( box );
		quadrupus.push( box );	

		hinge = new Physijs.HingeConstraint(quadrupus[4],quadrupus[8],new THREE.Vector3(0,body_height,-8),new THREE.Vector3(-1,0,0));//,new THREE.Vector3(0,0,1));
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
		for (var i = 0; i < quadrupus.length; ++i) {
			Simulator.scene().remove(quadrupus[i]);
		}

		// Clear the arrays.
		for (var i = 0; i < constraints.length; ++i) {
			constraints[i] = null;
		}

		for (var i = 0; i < quadrupus.length; ++i) {
			quadrupus[i] = null;
		}

		constraints = [];
		quadrupus = [];
	}
};