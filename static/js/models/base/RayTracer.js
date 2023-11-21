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
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    this.checkIntersections();
  }

  checkIntersections() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      if (this.intersected != intersects[0].object) {
        if (this.intersected) this.intersected.material.color.set(this.originalColor);
        this.intersected = intersects[0].object;
        this.intersected.material.color.set(this.hoverColor);
      }
    } else {
      if (this.intersected) this.intersected.material.color.set(this.originalColor);
      this.intersected = null;
    }
  }

}
