import * as THREE from 'three.js';
import { OrbitControls } from 'three/controls/OrbitControls.js';
import { RayTracer } from './RayTracer.js';

export class Scene {

  constructor(cameraConfig, sceneConfig) {

    this.cameraConfig = cameraConfig;
    this.sceneConfig = sceneConfig;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      cameraConfig.FOV, 
      (window.innerWidth * sceneConfig.WIDTH_PERCENTAGE) / (window.innerHeight * sceneConfig.HEIGHT_PERCENTAGE), 
      cameraConfig.MIN_VISIBLE, 
      cameraConfig.MAX_VISIBLE
    );
    this.camera.position.set(
      cameraConfig.DEFAULT_POINT_X,
      cameraConfig.DEFAULT_POINT_Y,
      cameraConfig.DEFAULT_POINT_Z
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(
      window.innerWidth * sceneConfig.WIDTH_PERCENTAGE,
      window.innerHeight * sceneConfig.HEIGHT_PERCENTAGE
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    /**
     * Renderables
     */

    this.renderables = [];

    /**
     * Observers
     * 
     * when something changes here inform anything 'observing' these
     */

    this.resizeObservers = [];

    

    // Handle screen resizing
    this.size = new THREE.Vector2(window.innerWidth * sceneConfig.WIDTH_PERCENTAGE, window.innerHeight * sceneConfig.HEIGHT_PERCENTAGE);
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize, false);

  }

  // allow other objects to subscribe to resize events
  addResizeObserver(observer) {
    this.resizeObservers.push(observer);
  }

  animate() {
    const animateFunc = () => {
      requestAnimationFrame(animateFunc);
      this.render();
    }
    animateFunc();
  }

  render() {
    this.controls.update();
    for (let renderable of this.renderables) {
      renderable.render();
    }
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Supporting methods
   */

  onWindowResize() {
    const newSize = new THREE.Vector2(window.innerWidth * this.sceneConfig.WIDTH_PERCENTAGE, window.innerHeight * this.sceneConfig.HEIGHT_PERCENTAGE);
    if (!newSize.equals(this.size)) {

        this.camera.aspect = (window.innerWidth * this.sceneConfig.WIDTH_PERCENTAGE) / (window.innerHeight * this.sceneConfig.HEIGHT_PERCENTAGE);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(newSize.x, newSize.y);
        this.controls.dispose();  // dispose old controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);  // add new controls
        this.size.copy(newSize);
    }

    // Notify all observers about the resize event
    for (let observer of this.resizeObservers) {
      observer.onResize(this.camera, this.controls);
    }
}

}