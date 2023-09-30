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

    const loader = new DataLoader('geojson/usa.geojson');
    loader.loadData().then(data => {
      const points = loader.mapDataToSphere(data, config.GLOBE.RADIUS, 0xff0000);
      points.forEach(point => this.renderer.scene.add(point));
    });

    this.renderer.renderables.push(this.globe);
    this.renderer.animate();

    window.addEventListener('resize', () => this.renderer.onWindowResize(), false);
  }
}