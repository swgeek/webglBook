// PointedLightCube.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'attribute vec4 a_Color; \n' +
   'attribute vec4 a_Normal; \n' +
   'uniform mat4 u_MvpMatrix; \n' +
   'uniform mat4 u_ModelMatrix; \n' +
   'uniform mat4 u_NormalMatrix; \n' +
   'varying vec4 v_Color; \n' +
   'varying vec3 v_Normal; \n' +
   'varying vec3 v_Position; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = u_MvpMatrix * a_Position; \n' +
   '   // need position in world coord as well \n' +
   '   v_Position = vec3(u_ModelMatrix * a_Position); \n' +
   '   v_Normal = normalize(vec3(u_NormalMatrix * a_Normal)); \n' +
   '   v_Color = a_Color;\n' +
   '}\n';

var FSHADER_SOURCE = 
   '#ifdef GL_ES \n' +
   'precision mediump float; \n' +
   '#endif \n' +
   'uniform vec3 u_LightColor; \n' +
   'uniform vec3 u_LightPosition; \n' +
   'uniform vec3 u_AmbientLight; \n' +
   'varying vec3 v_Normal; \n' +
   'varying vec3 v_Position; \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   vec3 normal = normalize(v_Normal);\n' +
   '   vec3 lightDirection = normalize(u_LightPosition - v_Position); \n' +
   '   float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
   '   vec3 diffuse = u_LightColor * v_Color.rgb * nDotL; \n' +
   '   vec3 ambient = u_AmbientLight * v_Color.rgb; \n' +
   '   gl_FragColor = vec4(diffuse + ambient, v_Color.a); \n' +
   '}';


function main()
{
   var canvas = document.getElementById('webgl');
   var gl = getWebGLContext(canvas);
   if (!gl)
      throw 'could not get gl context';

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
      throw 'could not init shaders';

   var n = initVertexBuffers(gl);
   if (n < 0)
      throw 'could not init vertex buffers';

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.enable(gl.DEPTH_TEST);

   var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
   var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
   var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
   var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
   var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
   var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

   if (!u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor ||
        !u_LightPosition || !u_AmbientLight)
      throw 'could not get uniform location';

   gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
   gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
   gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

   modelMatrix = new Matrix4();
   mvpMatrix = new Matrix4();
   normalMatrix = new Matrix4();

   modelMatrix.setRotate(90, 0, 1, 0);
   mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
   mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
   mvpMatrix.multiply(modelMatrix);
   normalMatrix.setInverseOf(modelMatrix);
   normalMatrix.transpose();

   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
   gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl)
{
  var vertices = new Float32Array([
     2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
     2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
     2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
    -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
     2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
  ]);

  // Colors
  var colors = new Float32Array([
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
 ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);

   if (! initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
   if (! initArrayBuffer(gl, 'a_Color', colors, 3)) return -1;
   if (! initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;

   gl.bindBuffer(gl.ARRAY_BUFFER, null);

   var indexBuffer = gl.createBuffer();
   if (! indexBuffer)
       throw 'could not create indexbuffer';

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

   return indices.length;
}

function initArrayBuffer(gl, attribute, data, num)
{
   var buffer = gl.createBuffer();
   if (! buffer) throw 'could not create buffer';

   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

   var location = gl.getAttribLocation(gl.program, attribute);
   if (location < 0)
      throw 'could not get attribute location';

   gl.vertexAttribPointer(location, num, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(location);

   return true;
}

