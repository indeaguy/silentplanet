import * as THREE from 'three'; // Import the earcut library for triangulation.

export class RayTracer {
  constructor(scene, camera, hoverColor = 0xFFC0CB, originalColor = 0x00ff00) {
    this.scene = scene;
    this.camera = camera;
    this.hoverColor = new THREE.Color(hoverColor);
    this.originalColor = new THREE.Color(originalColor);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.intersected = null;

    this.plane = new THREE.Plane();
    this.planeNormal = new THREE.Vector3();

    // @TODO should only do this when the appropriate debugging is enabled
    // A circle indicating where the ray is going
    const circleGeometry = new THREE.CircleGeometry(0.5, 32); // Small circle with a radius of 0.5
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    this.indicator = new THREE.Mesh(circleGeometry, circleMaterial);
    this.indicator.visible = false; // Initially hidden
    scene.add(this.indicator);

     // @TODO should only do this when the appropriate debugging is enabled
    // a dot indicating where the sphere was intersected
    const dotGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Small sphere geometry
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    this.indicatorDot = new THREE.Mesh(dotGeometry, dotMaterial);
    this.indicatorDot.visible = false; // Initially hidden
    scene.add(this.indicatorDot);

    
  }

  onMouseMove(event) {
    this.mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.offsetY / window.innerHeight) * 2 + 1;
    this.checkIntersections();

  }

  checkIntersections() {
    const ray = this.createRayFromCamera();

    // Perform the raycasting
    const intersects = ray.intersectObjects(this.scene.children, true);

    // Find the first intersected object with a non-empty name attribute
    const firstNamedIntersect = intersects.find(intersect => intersect.object.name);

    if (firstNamedIntersect) {
        // Log the name of the intersected object
        console.log('Intersected object name:', firstNamedIntersect.object.name);

        if (this.intersected !== firstNamedIntersect.object) {
            if (this.intersected) this.intersected.material.color.set(this.originalColor);
            this.intersected = firstNamedIntersect.object;
            this.intersected.material.color.set(this.hoverColor);

            this.indicatorDot.position.copy(firstNamedIntersect.point);
            this.indicatorDot.visible = true;
        }
    } else {
        if (this.intersected) this.intersected.material.color.set(this.originalColor);
        this.intersected = null;
        this.indicatorDot.visible = false;
    }
  }

  createRayFromCamera() {
      const raycaster = new THREE.Raycaster();
      const direction = new THREE.Vector3();
      
      // Get the direction in which the camera is looking
      this.camera.getWorldDirection(direction);

      // Set the raycaster with the camera's position and direction
      //raycaster.set(this.mouse, direction);
      raycaster.setFromCamera(this.mouse, this.camera);

      return raycaster; // This is the ray that moves directly away from the camera
  }

}
