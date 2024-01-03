import * as THREE from 'three'; // Import the earcut library for triangulation.

export class RayTracer {
  constructor(scene, camera, originalColour = 0x00ff00, eventColour = 0xFFC0CB) {
    this.scene = scene;
    this.camera = camera;
    this.originalColour = new THREE.Color(originalColour);
    this.eventColour = new THREE.Color(eventColour);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane();
    this.planeNormal = new THREE.Vector3();
    this.intersected = null;
  }

  handleRayEvent(event) {
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
            if (this.intersected) this.intersected.material.color.set(this.originalColour);
            this.intersected = firstNamedIntersect.object;
            this.intersected.material.color.set(this.eventColour);
        }
    } else {
        if (this.intersected) this.intersected.material.color.set(this.originalColour);

        this.intersected = null;
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
