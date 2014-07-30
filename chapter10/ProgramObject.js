var SOLID_VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n'+
   'attribute vec4 a_Normal; \n'+
   'uniform mat4 u_MvpMatrix; \n'+
   'uniform mat4 u_NormalMatrix; \n'+
   'varying vec4 v_Color; \n'+
   'void main() \n'+
   '{ \n'+
   '   vec3 lightDirection = vec3(0.0, 0.0, 1.0); \n'+
   '   vec4 color = vec4(0.0, 1.0, 1.0, 1.0); \n'+
   '   gl_Position = u_MvpMatrix * a_Position; \n'+
   '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal)); \n'+
   '   float nDotL = max(dot(normal, lightDirection), 0.0); \n'+
   '   v_Color = vec4(color.rgb * nDotL, color.a); \n'+
   '}';

var SOLID_FSHADER_SOURCE = 
   '#ifdef GL_ES \n'+
   'precision mediump float; \n'+
   '#endif \n'+
   'varying vec4 v_Color; \n'+
   'void main() \n'+
   '{ \n'+
   '   gl_FragColor = v_Color; \n'+
   '}';

var TEXTURE_VSHADER_SOURCE =
   'attribute vec4 a_Position; \n'+
   'attribute vec4 a_Normal; \n'+
   'attribute vec2 a_TexCoord; \n'+
   'uniform mat4 u_MvpMatrix; \n'+
   'uniform mat4 u_NormalMatrix; \n'+
   'varying float v_NdotL; \n'+
   'varying vec2 v_TexCoord; \n'+
   'void main() \n'+
   '{ \n'+
   '   vec3 lightDirection = vec3(0.0, 0.0, 1.0); \n'+
   '   gl_Position = u_MvpMatrix * a_Position; \n'+
   '   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal)); \n'+
   '   v_NdotL = max(dot(normal, lightDirection), 0.0); \n'+
   '   v_TexCoord = a_TexCoord; \n'+
   '}';

var TEXTURE_FSHADER_SOURCE = 
   '#ifdef GL_ES \n'+
   'precision mediump float; \n'+
   '#endif \n'+
   'uniform sampler2D u_Sampler; \n'+
   'varying vec2 v_TexCoord; \n'+
   'varying float v_NdotL; \n'+
   'void main() \n'+
   '{ \n'+
   '   vec4 color = texture2D(u_Sampler, v_TexCoord); \n'+
   '   gl_FragColor = vec4(color.rgb * v_NdotL, color.a); \n'+
   '} \n';

function main()
{
   var canvas = document.getElementById("webgl");
   var gl = getWebGLContext(canvas);
   if (! gl) throw 'error';

   // initialize shaders
   var solidProgram = createProgram(gl, SOLID_VSHADER_SOURCE, SOLID_FSHADER_SOURCE);
   var texProgram = createProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);
   if (!solidProgram ) throw 'error';
   if (!texProgram) throw 'error';

  // Get storage locations of attribute and uniform variables in program object for single color drawing
  solidProgram.a_Position = gl.getAttribLocation(solidProgram, 'a_Position');
  solidProgram.a_Normal = gl.getAttribLocation(solidProgram, 'a_Normal');
  solidProgram.u_MvpMatrix = gl.getUniformLocation(solidProgram, 'u_MvpMatrix');
  solidProgram.u_NormalMatrix = gl.getUniformLocation(solidProgram, 'u_NormalMatrix');

  // Get storage locations of attribute and uniform variables in program object for texture drawing
  texProgram.a_Position = gl.getAttribLocation(texProgram, 'a_Position');
  texProgram.a_Normal = gl.getAttribLocation(texProgram, 'a_Normal');
  texProgram.a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
  texProgram.u_MvpMatrix = gl.getUniformLocation(texProgram, 'u_MvpMatrix');
  texProgram.u_NormalMatrix = gl.getUniformLocation(texProgram, 'u_NormalMatrix');
  texProgram.u_Sampler = gl.getUniformLocation(texProgram, 'u_Sampler');

  if (solidProgram.a_Position < 0 || solidProgram.a_Normal < 0 ||
      !solidProgram.u_MvpMatrix || !solidProgram.u_NormalMatrix ||
      texProgram.a_Position < 0 || texProgram.a_Normal < 0 || texProgram.a_TexCoord < 0 ||
      !texProgram.u_MvpMatrix || !texProgram.u_NormalMatrix || !texProgram.u_Sampler) {
    console.log('Failed to get the storage location of attribute or uniform variable');
    return;
  }

   var cube = initVertexBuffers(gl);
   if (! cube) throw 'error';

   var textures = initTextures(gl, texProgram);
   if (! textures) throw 'error';

   gl.enable(gl.DEPTH_TEST);
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   var viewProjMatrix = new Matrix4();
   viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0);
   viewProjMatrix.lookAt(0, 0, 15, 0, 0, 0, 0, 1, 0);

   var currentAngle = 0.0;

   var tick = function() { 
      currentAngle = animate(currentAngle);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      drawSolidCube(gl, solidProgram, cube, -2.0, currentAngle, viewProjMatrix);
      drawTexCube(gl, texProgram, cube, textures, 2.0, currentAngle, viewProjMatrix);
      window.requestAnimationFrame(tick, canvas);
   };
   tick();
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  var normals = new Float32Array([   // Normal
     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
     0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
     0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
  ]);
  var texCoords = new Float32Array([   // Texture coordinates
     1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
     0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
     1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
     1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
     0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
     0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([        // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

   var o = new Object();
   o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
   o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
   o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
   o.indexBuffer  = initElementArrayBufferForLaterUse(gl, indices,  gl.UNSIGNED_BYTE);
   if (! o.vertexBuffer || ! o.normalBuffer || ! o.texCoordBuffer || ! o.indexBuffer) throw 'error';

   o.numIndices = indices.length;

   gl.bindBuffer(gl.ARRAY_BUFFER, null);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

   return o;
}

function initTextures(gl, program)
{
   var texture = gl.createTexture();
   if (! texture) throw 'error';

   var image = new Image();
   if (! image) throw 'error'

   image.onload = function() {
      // write image data to texture object 
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // pass the texture unit 0 to u_Sampler
      gl.useProgram(program);
      gl.uniform1i(program.u_Sampler, 0);

      gl.bindTexture( gl.TEXTURE_2D, null); // clean up, unbind texture
   };

   image.src = 'orange.jpg'; // load image
   return texture;
}

function drawSolidCube(gl, program, o, x, angle, viewProjMatrix)
{
   gl.useProgram(program);
   
  // Assign the buffer objects and enable the assignment
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer); // Vertex coordinates
  initAttributeVariable(gl, program.a_Normal, o.normalBuffer);   // Normal
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);  // Bind indices

  drawCube(gl, program, o, x, angle, viewProjMatrix);   // Draw
}

function drawTexCube(gl, program, o, texture, x, angle, viewProjMatrix) {
  gl.useProgram(program);   // Tell that this program object is used

  // Assign the buffer objects and enable the assignment
  initAttributeVariable(gl, program.a_Position, o.vertexBuffer);  // Vertex coordinates
  initAttributeVariable(gl, program.a_Normal, o.normalBuffer);    // Normal
  initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);// Texture coordinates
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices

  // Bind texture object to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  drawCube(gl, program, o, x, angle, viewProjMatrix); // Draw
}

// Assign the buffer objects and enable the assignment
function initAttributeVariable(gl, a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

// Coordinate transformation matrix
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();


function drawCube(gl, program, o, x, angle, viewProjMatrix) {
  // Calculate a model matrix
  g_modelMatrix.setTranslate(x, 0.0, 0.0);
  g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
  g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);

  // Calculate transformation matrix for normals and pass it to u_NormalMatrix
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

  // Calculate model view projection matrix and pass it to u_MvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);   // Draw
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Keep the information necessary to assign to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
  var buffer = gl.createBuffer();　  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}

var ANGLE_STEP = 30;   // The increments of rotation angle (degrees)

var last = Date.now(); // Last time that this function was called
function animate(angle) {
  var now = Date.now();   // Calculate the elapsed time
  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

