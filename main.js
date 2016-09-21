"use strict";
twgl.setDefaults({attribPrefix: "a_"});
var m4 = twgl.m4;
var gl = twgl.getWebGLContext(document.getElementById("c"));
var programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

class TriangleMesh {
  constructor(nodes, edges, triangles) {
    this.nodes = nodes;
    this.edges = edges;
    this.triangles = triangles;
  }

  getArrays() {
    let position = [];
    /*
    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      position.push(node.pos[0], node.pos[1], node.pos[2]);
    }
    */
    let normal = [];
    for (let i = 0; i < this.triangles.length; i++) {
      let triangle = this.triangles[i];
      let a = this.nodes[triangle.na].pos;
      let b = this.nodes[triangle.nb].pos;
      let c = this.nodes[triangle.nc].pos;
      position.push(a[0], a[1], a[2]);
      position.push(b[0], b[1], b[2]);
      position.push(c[0], c[1], c[2]);
      let ba = vec3.sub(vec3.create(), b, a);
      let ca = vec3.sub(vec3.create(), c, a);
      let n = vec3.cross(vec3.create(), ba, ca);
      normal.push(n[0], n[1], n[2]);
      normal.push(n[0], n[1], n[2]);
      normal.push(n[0], n[1], n[2]);
    }
    return {
      position: position,
      normal: normal,
    };
  }
}

class Node {
  constructor(x, y, z) {
    this.pos = vec3.fromValues(x, y, z);
  }
}

class Edge {
  constructor(na, nb) {
    this.na = na;
    this.nb = nb;
  }
}

class Triangle {
  constructor(na, nb, nc) {
    this.na = na;
    this.nb = nb;
    this.nc = nc;
  }
}

function makeTetrahedron() {
  let nodes = [
    new Node(+1, +1, +1),
    new Node(-1, -1, +1),
    new Node(+1, -1, -1),
    new Node(-1, +1, -1),
  ];
  let edges = [];
  let triangles = [
    new Triangle(0, 1, 2),
    new Triangle(0, 3, 1),
    new Triangle(1, 3, 2),
    new Triangle(0, 2, 3),
  ];
  return new TriangleMesh(nodes, edges, triangles);
}

var mesh = makeTetrahedron();

var arrays = mesh.getArrays();

/*
var arrays = {
    position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
    normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
    indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
};
*/

var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

var uniforms = {
    u_lightWorldPos: [1, 8, -10],
    u_lightColor: [1, 0.8, 0.8, 1],
    u_ambient: [0, 0, 0, 1],
    u_specular: [1, 1, 1, 1],
    u_shininess: 50,
    u_specularFactor: 1,
};

function render(time) {
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projection = m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 10);
    var eye = [1, 4, -6];
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    var camera = m4.lookAt(eye, target, up);
    var view = m4.inverse(camera);
    var viewProjection = m4.multiply(view, projection);
    var world = m4.rotationY(time);

    uniforms.u_viewInverse = camera;
    uniforms.u_world = world;
    uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));
    uniforms.u_worldViewProjection = m4.multiply(world, viewProjection);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
