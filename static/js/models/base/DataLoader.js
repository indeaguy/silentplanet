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

  mapDataToSphere(data, radius, color, rise = 0) {
    // Calculate the altitude from the radius and rise.
    let altitude = radius + rise;

    // Create an empty array to store mesh objects.
    let meshes = [];

    // Loop through features in the data.
    for (let feature of data.features) {
      if (feature.geometry.type !== 'Polygon' && feature.geometry.type === 'MultiPolygon') {
        continue;
      }

      // Check the geometry type and prepare an array of polygons.
      let polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;

      for (let polygon of polygons) {
        // Extract the coordinates from the polygon data.
        let coordinates = polygon[0];
  
        // Triangulate the polygon interior.

        /*
        using the Earcut library to triangulate a set of 2D coordinates. Let's break it down step by step:

            coordinates: This is an array of 2D points that define the vertices of a polygon. Each point is represented as an array with two values: [x, y], where x is the horizontal coordinate and y is the vertical coordinate.

            .flat(): The .flat() method is used on the coordinates array to convert a multi-dimensional array (possibly an array of arrays) into a flat one-dimensional array. It essentially flattens nested arrays. For example, if you have an array of arrays like [[1, 2], [3, 4], [5, 6]], calling .flat() on it will transform it into [1, 2, 3, 4, 5, 6].

            Earcut.triangulate(): This is a function provided by the Earcut library. It takes a flat array of 2D coordinates (in your case, the flattened coordinates array) and performs polygon triangulation. Triangulation is the process of dividing a polygon into triangles such that no two triangles intersect and the triangles collectively cover the entire polygon. The Earcut.triangulate() function returns an array of indices that represent the vertices of these triangles.

            triangles: The result of the Earcut.triangulate() function is stored in the triangles variable. This will be an array of integers, where each group of three integers represents the indices of the vertices of a triangle in the coordinates array.

        In summary, this line of code takes a set of 2D coordinates that define a polygon, flattens them into a one-dimensional array, and then uses the Earcut library to perform triangulation on the polygon, returning an array of triangle vertex indices. These triangles can then be used to create a 3D representation of the polygon or for other geometric calculations.
        */
        const triangles = Earcut.triangulate(coordinates.flat());
  
        // Iterate through the triangle indices and create triangles.
        for (let i = 0; i < triangles.length; i += 3) {
          const triangleIndices = [triangles[i], triangles[i + 1], triangles[i + 2]];
  
          // Create an array of vertices for this triangle.
          const triangleVertices = triangleIndices.map((index) => {
            const vertex = coordinates[index];
            const latRad = vertex[1] * (Math.PI / 180);
            const lonRad = -vertex[0] * (Math.PI / 180);
            const x = radius * Math.cos(latRad) * Math.cos(lonRad);
            const y = radius * Math.sin(latRad);
            const z = radius * Math.cos(latRad) * Math.sin(lonRad);
            return new THREE.Vector3(x, y, z);
          });
  
          // Create an array of midpoints for the edges.
          const edgeMidpoints = [
            triangleVertices[0].clone().lerp(triangleVertices[1], 0.5),
            triangleVertices[1].clone().lerp(triangleVertices[2], 0.5),
            triangleVertices[2].clone().lerp(triangleVertices[0], 0.5),
          ];
  
          // Normalize the edge midpoints to the sphere's surface.
          const normalizedMidpoints = edgeMidpoints.map((midpoint) => {
            midpoint.normalize().multiplyScalar(radius + rise);
            return midpoint;
          });
  
          // Create new triangles using the normalized midpoints and original vertices.
          const newTriangles = [
            triangleVertices[0], normalizedMidpoints[0], normalizedMidpoints[2],
            normalizedMidpoints[0], triangleVertices[1], normalizedMidpoints[1],
            normalizedMidpoints[1], triangleVertices[2], normalizedMidpoints[2],
            normalizedMidpoints[2], normalizedMidpoints[0], normalizedMidpoints[1],
          ];
  
          // Create a BufferGeometry for the new triangles.
          const geometry = new THREE.BufferGeometry();
          const positions = newTriangles.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

          // @TODO make this better

          /*
          The line geometry.setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]); is setting the index buffer for the geometry. In Three.js, a geometry consists of two main components: vertex attributes (e.g., positions, normals, colors) and an index buffer.

          Here's what this line specifically does:

              geometry: This refers to the BufferGeometry instance you are working with. In Three.js, a BufferGeometry represents the geometry of a 3D object and stores various attributes of its vertices.

              setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]): This method is used to set the index buffer of the geometry. The argument [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] is an array of indices that define the order in which vertices should be connected to create triangles.

          In this case, you are specifying a list of indices that will be used to connect vertices to form triangles. The numbers in the array correspond to the indices of vertices in the vertex buffer of the geometry.

          For example, [0, 1, 2] represents the first triangle and instructs Three.js to connect vertices with indices 0, 1, and 2 in the vertex buffer to create that triangle. Similarly, [3, 4, 5] defines the second triangle, and so on.

          By specifying the index buffer, you can reuse vertices for multiple triangles, which can be more memory-efficient when rendering complex 3D models. It also allows you to describe the geometry of the object more compactly since you don't need to duplicate shared vertices for each triangle they belong to.
          */
          geometry.setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  
          // Create a material and mesh for the triangle.
          const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, wireframe: true });
          const mesh = new THREE.Mesh(geometry, material);
          meshes.push(mesh);
        }
      }
  
      return meshes;
    }
  }
}
