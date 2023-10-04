import { Scene } from '../models/base/Scene.js';
import { Globe } from '../models/base/Globe.js';
import { DataLoader } from '../models/base/DataLoader.js';

/**
 * The base application controller
 * Named App.js by sheer coincidence. Does not use React, Vue.js, Express.js, etc.
 */

export class App {
  constructor(config) {

    // @TODO decouple the radius 
    this.renderer = new Scene(config.CAMERA, config.SCENE);
    this.globe = new Globe(config.GLOBE, this.renderer);

    this.globe.createSphere();

    const loader = new DataLoader('geojson/map.geojson');
    loader.loadData().then(data => {
      const result = loader.mapDataToSphere(data, config.GLOBE.RADIUS, 0xff0000);
      result.meshes.forEach(mesh => this.renderer.scene.add(mesh));
      
      // Add the polygonMeshes to the scene for debugging earclipping
      result.polygonMeshes.forEach(polygonMesh => this.renderer.scene.add(polygonMesh));
    });

    this.renderer.renderables.push(this.globe);
    this.renderer.animate();

    window.addEventListener('resize', () => this.renderer.onWindowResize(), false);
  }
}