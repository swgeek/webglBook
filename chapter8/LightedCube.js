var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'attribute vec4 a_Color; \n' + 
   'attribute vec4 a_Normal; \n' + 
   'uniform mat4 u_MvpMatrix; \n' + 
   'uniform mat4 u_NormalMatrix; \n' +
   'uniform vec3 u_LightColor; \n' + 
   'uniform vec3 u_LightDirection; \n' + 
   'uniform vec3 u_AmbientLight; \n' +
   'varying vec4 v_Color; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = u_MvpMatrix * a_Position; \n' + 
   '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal)); \n' +
   '   float nDotL = max(dot(u_LightDirection, normal), 0.0); \n' + 
   '   vec3 diffuse = u_LightColor * a_Color.rgb * nDotL; \n' + 
   '   vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
   '   v_Color = vec4(diffuse + ambient, a_Color.a); \n' + 
   '}';

var FSHADER_SOURCE = 
   '#ifdef GL_ES \n' + 
   'precision mediump float; \n' + 
   '#endif \n' + 
   'varying vec4 v_Color; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_FragColor = v_Color; \n' + 
   '}';

function main()
{
   var canvas = document.getElementById('webgl');

   var gl = getWebGLContext(canvas);
   if (!gl)
      throw 'could not get gl context';

   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
      throw 'error initing shaders';

   var n = initVertexBuffers(gl);
   if (n < 0)
      throw 'could not set up vertex buffers';

   gl.clearColor(0, 0, 0, 1);
   gl.enable(gl.DEPTH_TEST);

   var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
   var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
   var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
   var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
   var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
   if (! u_MvpMatrix || !u_LightColor || ! u_LightDirection)
      throw 'could not get uniform location';

   gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
   gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
   var lightDirection = new Vector3([0.5, 3.0, 4.0]);
   lightDirection.normalize();
   gl.uniform3fv(u_LightDirection, lightDirection.elements);

   var modelMatrix = new Matrix4();
   var mvpMatrix = new Matrix4();
   var normalMatrix = new Matrix4();
   modelMatrix.setTranslate(0, 1, 0);
   modelMatrix.rotate(90, 0, 0, 1);

   mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
   mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
   mvpMatrix.multiply(modelMatrix);
   gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

   normalMatrix.setInverseOf(modelMatrix);
   normalMatrix.transpose();
   gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl)
{
  var vertices = new Float32Array([   // Coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);


  var colors = new Float32Array([    // Colors
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
 ]);

  var normals = new Float32Array([    // Normal
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

   if (! initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
   if (! initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
   if (! initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

   var indexBuffer = gl.createBuffer();
   if (! indexBuffer)
      throw 'could not create indexbuffer';

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

   return indices.length;
}

function initArrayBuffer(gl, attribute, data, num, type)
{
   var buffer = gl.createBuffer();
   if (! buffer)
      throw 'could not create buffer';
   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

   var attributeLocation = gl.getAttribLocation(gl.program, attribute);
   if (attributeLocation < 0)
      throw 'could not get attribute location';
 
   gl.vertexAttribPointer(attributeLocation, num, type, false, 0,  0);
   gl.enableVertexAttribArray(attributeLocation);
   gl.bindBuffer(gl.ARRAY_BUFFER, null);
   return true;
}

