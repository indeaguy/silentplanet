import { App } from './controllers/App.js';

//@TODO override these with json provided from somewhere  
const CONFIG = {
  SCENE: {
    WIDTH_PERCENTAGE: 1, // 100% of the window's width, also used for camera aspect ratio
    HEIGHT_PERCENTAGE: 1, // 100% of the window's height, also used for camera aspect ratio
  },
  CAMERA: {
    FOV: 75, // degrees visible in the field of view
    MAX_VISIBLE: 1000, // maximum 'units' away objects will be visible
    MIN_VISIBLE: 0.1, // minimum 'units' away objects will be visible
    DEFAULT_POINT_X: 1,
    DEFAULT_POINT_Y: 3,
    DEFAULT_POINT_Z: 10,
  },
  GLOBE: {
    RADIUS: 1,
    FILL_COLOUR: 0x000000,
    WIDTH_SEGMENTS: 20, // pizza slices in the sphere
    HEIGHT_SEGMENTS: 20, // verticle pizza slices
    MIN_DISTANCE: 0.1, // min zoom distance from surface
    MAX_DISTANCE: 20, // max zoom distance from center
    WIREFRAME: false,
    TRANSPARENT: true,
    OPACITY: 0.35,
    GRIDS: {
      O: {
        COLOR: 0xffffff,
        COLOR_FINAL: 0x000000,
        LAT_DENSITY: 10,
        LON_DENSITY: 10,
        FADE_START: 0.1,
        FADE_END: 1.0,
        FADE_SPEED: 0.01
      },
      1: {
        COLOR: 0x808080,
        COLOR_FINAL: 0x000000,
        LAT_DENSITY: 5,
        LON_DENSITY: 5,
        FADE_START: 0.2,
        FADE_END: 0.8,
        FADE_SPEED: 0.02
      }
    }
  },
  POLYGONS: {
    RISE: 0, // how high off the sphere the polygons rise
    COLOR: 0xff0000, // color of the polygons
    SUBDIVIDE_DEPTH: 3, // how many times to subdivide the polygons
    MIN_EDGE_LENGTH: 0.05, // minimum edge length of the polygons
    LAYER_OVERRIDES: {
      O: {
        
      }
    }
  }
};

new App(CONFIG);


