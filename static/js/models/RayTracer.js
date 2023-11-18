import * as THREE from 'three'; // Import the earcut library for triangulation.

export class RayTracer {
  constructor(url) {
    //this.url = url;
  }

  // @TODO
  // This was inside DataLoader.subdivideTriangle in an attempt to make sure the resulting polygons were inside the bounds of the original polygon
      
  // Check if all vertices of the triangle are inside the polygon
      // @here.. trying to check if the triangle is in the original polygon. but the polygon is not added to the scene yet to check maybe?
      //   const verticesInside = triangleVertices.map(vertex => {
      //     const isInside = this.isInsidePolygon(vertex, polygonMesh);
      //     if (isInside)
      //     console.log(`Vertex at position (${vertex.x}, ${vertex.y}, ${vertex.z}) is inside polygon: ${isInside}`);
      //     return isInside;
      // });

  isInsidePolygon(point, polygonMesh) {

    const raycaster = new THREE.Raycaster();
    const up = new THREE.Vector3(0, 1, 0); // Up direction for raycasting

    raycaster.set(point, up);
    const intersects = raycaster.intersectObject(polygonMesh);
    const doesintersect = intersects.length % 2 === 1;
    return doesintersect;
  }


}
