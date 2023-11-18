import { Scene } from '../models/base/Scene.js';
import { Globe } from '../models/base/Globe.js';
import { DataLoader } from '../models/base/DataLoader.js';

/**
 * The base application controller
 * Named App.js by sheer coincidence. Does not use React, Vue.js, Express.js, etc.
 */

export class App {
  constructor(config) {
    
    this.renderer = new Scene(config.CAMERA, config.SCENE);

    this.globe = new Globe(config.GLOBE, this.renderer); 
    this.globe.createSphere();
    this.renderer.renderables.push(this.globe);

    const loader = new DataLoader('geojson/usa.geojson');

    // Create a Vector2 for the mouse position
    //const mouse = new THREE.Vector2();

    // Raycaster for mouse picking
    //const raycaster = new THREE.Raycaster();

    
    loader.loadData().then(data => {
      const result = loader.mapDataToSphere(data, config.GLOBE.RADIUS, config.POLYGONS.COLOR, config.POLYGONS.RISE, config.POLYGONS.SUBDIVIDE_DEPTH, config.POLYGONS.MIN_EDGE_LENGTH);
      result.meshes.forEach(mesh => this.renderer.scene.add(mesh));
      
      // Add the polygonMeshes to the scene for debugging earclipping
      result.polygonMeshes.forEach(polygonMesh => this.renderer.scene.add(polygonMesh));
    });

    this.renderer.animate();

    window.addEventListener('resize', () => this.renderer.onWindowResize(), false);
    //window.addEventListener('mousemove', this.onMouseMove, false);
  }

  onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

}