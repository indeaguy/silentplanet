import * as THREE from 'three';
import { Earcut } from 'extras/Earcut.js'; // Import the earcut library for triangulation.
import { ConvexGeometry } from 'three/geometries/ConvexGeometry.js';

export class DataLoader {
  constructor(url) {
    this.url = url;
  }

  async loadData() {
    // Fetch data from the specified URL.
    const response = await fetch(this.url);
    // Parse the response as JSON data.
    const data = await response.json();
    return data;
  }

  subdivideTriangle(triangleVertices, depth, radius, rise, meshes, color, minEdgeLength) {
    const edgeLengths = [
        triangleVertices[0].distanceTo(triangleVertices[1]),
        triangleVertices[1].distanceTo(triangleVertices[2]),
        triangleVertices[2].distanceTo(triangleVertices[0])
    ];
    const longestEdge = Math.max(...edgeLengths);

    // Check against the minimum edge length
    if (longestEdge < minEdgeLength) {
        depth = 0;
    }

    if (depth <= 0) {
        // Base case: No more subdivision needed. Create the mesh triangle.
        const geometry = new THREE.BufferGeometry();
        const positions = triangleVertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setIndex([0, 1, 2]);
        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, wireframe: false });
        const mesh = new THREE.Mesh(geometry, material);
        meshes.push(mesh);
        return;
    }
  
    // Calculate midpoints and ensure they lie on the surface of the sphere.
    const edgeMidpoints = [
        triangleVertices[0].clone().lerp(triangleVertices[1], 0.5).normalize().multiplyScalar(radius + rise),
        triangleVertices[1].clone().lerp(triangleVertices[2], 0.5).normalize().multiplyScalar(radius + rise),
        triangleVertices[2].clone().lerp(triangleVertices[0], 0.5).normalize().multiplyScalar(radius + rise)
    ];
  
    // Define the new triangles.
    const newTriangles = [
        [triangleVertices[0], edgeMidpoints[0], edgeMidpoints[2]],
        [edgeMidpoints[0], triangleVertices[1], edgeMidpoints[1]],
        [edgeMidpoints[1], triangleVertices[2], edgeMidpoints[2]],
        [edgeMidpoints[2], edgeMidpoints[0], edgeMidpoints[1]]
    ];
  
    // Recursively subdivide each triangle.
    for (let t of newTriangles) {
        this.subdivideTriangle(t, depth - 1, radius, rise, meshes, color, minEdgeLength);
    }
}



mapDataToSphere(data, radius, color, rise = 0, subdivisionDepth = 3, minEdgeLength = 0.05) {
  // Calculate the altitude from the radius and rise.
  let altitude = radius + rise;

  // Create an empty array to store mesh objects.
  let meshes = [];

  // Helper function to ensure CCW order for a given triangle.
  function ensureCCW(vertices) {
      // Using the shoelace formula to calculate the signed area of a triangle.
      const area = (vertices[1].x - vertices[0].x) * (vertices[2].y - vertices[0].y) - 
                   (vertices[2].x - vertices[0].x) * (vertices[1].y - vertices[0].y);

      // If the area is negative, the winding is CW and we need to swap vertices.
      if (area < 0) {
          const temp = vertices[1];
          vertices[1] = vertices[2];
          vertices[2] = temp;
      }
      return vertices;
  }

  // Loop through features in the data.
  for (let feature of data.features) {
    if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
      continue;
    }

    // Check the geometry type and prepare an array of polygons.
    let polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;

    for (let polygon of polygons) {
      // Extract the coordinates from the polygon data.
      let coordinates = polygon[0];

      // Triangulate the polygon interior using Earcut.
      const triangles = Earcut.triangulate(coordinates.flat());

      // Iterate through the triangle indices and create triangles.
      for (let i = 0; i < triangles.length; i += 3) {
        const triangleIndices = [triangles[i], triangles[i + 1], triangles[i + 2]];

        // Convert triangle coordinates to 3D vectors on the sphere.
        const triangleVertices = triangleIndices.map((index) => {
          const vertex = coordinates[index];
          const latRad = vertex[1] * (Math.PI / 180);
          const lonRad = -vertex[0] * (Math.PI / 180);
          const x = radius * Math.cos(latRad) * Math.cos(lonRad);
          const y = radius * Math.sin(latRad);
          const z = radius * Math.cos(latRad) * Math.sin(lonRad);
          return new THREE.Vector3(x, y, z);
        });

        // Ensure the triangle vertices are in CCW order.
        const orderedVertices = ensureCCW(triangleVertices);

        // Use the subdivideTriangle method to handle potential triangle subdivisions.
        this.subdivideTriangle(orderedVertices, subdivisionDepth, radius, rise, meshes, color, minEdgeLength);
      }
    }
  }

  return meshes;
}


}
