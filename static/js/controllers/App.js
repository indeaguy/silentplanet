import { Scene } from '../models/base/Scene.js';
import { Globe } from '../models/base/Globe.js';
import { DataLoader } from '../models/base/DataLoader.js';
import { RayTracer } from '../models/base/RayTracer.js';

/**
 * The base application controller
 * Named App.js by sheer coincidence. Does not use React, Vue.js, Express.js, etc.
 */

export class App {
  constructor(config) {
    

    this.renderer = new Scene(config.CAMERA, config.SCENE);
    this.globe = new Globe(config.SPHERE, this.renderer); 
    this.globe.createSphere();
    this.renderer.renderables.push(this.globe);

    const loader = new DataLoader('geojson/usa.geojson');
    
    loader.loadData().then(data => {
      const result = loader.mapDataToSphere(data, config.SPHERE.RADIUS, config.POLYGONS.COLOR, config.POLYGONS.RISE, config.POLYGONS.SUBDIVIDE_DEPTH, config.POLYGONS.MIN_EDGE_LENGTH);
      result.meshes.forEach(mesh => this.renderer.scene.add(mesh));
    });

    // a custom raycaster handler
    this.rayTracer = new RayTracer(this.renderer.scene, this.renderer.camera);

    this.renderer.animate();

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.renderer.onWindowResize(), false);
    window.addEventListener('mousemove', (event) => this.rayTracer.onMouseMove(event), false);
  }

}