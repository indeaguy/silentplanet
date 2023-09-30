// Globe.js and Scene.js
import * as THREE from 'three.js';


export class Globe {
  constructor(config, sceneRenderer) {

    this.config = config;
    this.sceneRenderer = sceneRenderer;
    this.sceneRenderer.controls.minDistance = this.config.RADIUS + this.config.MIN_DISTANCE;  
    this.sceneRenderer.controls.maxDistance = this.config.MAX_DISTANCE;
    this.gridMaterials = {};

    this.createGrids(this.config.GRIDS);

    // handle resize
    this.sceneRenderer.addResizeObserver(this);
  }


  createSphere() {
    var sphereGeometry = new THREE.SphereGeometry(this.config.RADIUS, this.config.WIDTH_SEGMENTS, this.config.HEIGHT_SEGMENTS);
    var sphereMaterial = new THREE.MeshBasicMaterial({ color: this.config.FILL_COLOUR, wireframe: this.config.WIREFRAME, transparent: this.config.TRANSPARENT, opacity: this.config.OPACITY });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.sceneRenderer.scene.add(sphere);
  }


  createGrids(grids) {
    Object.entries(grids).forEach(([key, gridConfig]) => {
      const material = new THREE.LineBasicMaterial({color: gridConfig.COLOR});
      this.createGrid(gridConfig.LAT_DENSITY, gridConfig.LON_DENSITY, material);
      this.gridMaterials[key] = {
        material: material,
        config: gridConfig
      };
    });
  }


  createGrid(latDensity, lonDensity, material) {
    for (let i = -80; i <= 80; i += latDensity) {
      let theta = (90 - i) * (Math.PI / 180);
      let line = this.createLatitudeLine(theta, material);
      this.sceneRenderer.scene.add(line);
    }
    for (let i = -180; i <= 180; i += lonDensity) {
      let phi = (i + 180) * (Math.PI / 180);
      let line = this.createLongitudeLine(phi, material);
      this.sceneRenderer.scene.add(line);
    }
  }


  createLatitudeLine(theta, material) {
    var points = [];
    for (let i = 0; i <= 360; i += 2) {
        let rad = Math.PI / 180;
        let phi = i * rad;
        let x = -(this.config.RADIUS * Math.sin(theta) * Math.cos(phi));
        let y = (this.config.RADIUS * Math.cos(theta));
        let z = (this.config.RADIUS * Math.sin(theta) * Math.sin(phi));
        points.push(new THREE.Vector3(x, y, z));
    }
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var line = new THREE.Line(geometry, material);
    return line;
  }


  createLongitudeLine(phi, material) {
    var points = [];
    for (let i = 0; i <= 180; i += 2) {
        let rad = Math.PI / 180;
        let theta = i * rad;
        let x = -(this.config.RADIUS * Math.sin(theta) * Math.cos(phi));
        let y = (this.config.RADIUS * Math.cos(theta));
        let z = (this.config.RADIUS * Math.sin(theta) * Math.sin(phi));
        points.push(new THREE.Vector3(x, y, z));
    }
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var line = new THREE.Line(geometry, material);
    return line;
  }


  onResize(camera, controls) {

    this.sceneRenderer.controls.minDistance = this.config.RADIUS + this.config.MIN_DISTANCE;
    this.sceneRenderer.controls.maxDistance = this.config.MAX_DISTANCE;
  }


  // @TODO: fade with three colours based on distance:
  // invisible > vibrant > invisible
  fadeGrid(material, config, distance) {
    let normalized;
  
    const fadeStart = config.FADE_START * (this.sceneRenderer.controls.minDistance + this.sceneRenderer.controls.maxDistance);
    const fadeEnd = config.FADE_END * (this.sceneRenderer.controls.minDistance + this.sceneRenderer.controls.maxDistance);
    if (distance > fadeEnd) {
      normalized = 1;
    } else if (distance < fadeStart) {
      normalized = 0;
    } else {
      normalized = (distance - fadeStart) / (fadeEnd - fadeStart);
    }
  
    var color1 = new THREE.Color(config.COLOR_FINAL); // what it fades to
    var color2 = new THREE.Color(config.COLOR);
    var color = color1.clone().lerp(color2, normalized);
  
    material.color.lerp(color, config.FADE_SPEED);
  }


  render() {
    //this.camera.position.z = 10;
    var distance = this.sceneRenderer.camera.position.length();
    
    Object.values(this.gridMaterials).forEach(({material, config}) => {
      this.fadeGrid(material, config, distance);
    });

  }
}