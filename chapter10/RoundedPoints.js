var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = a_Position; \n' +
   '   gl_PointSize = 10.0;\n ' +
   '}';

var FSHADER_SOURCE = 
   '#ifdef GL_ES \n' +
   'precision mediump float; \n' +
   '#endif GL_ES \n' +
   'void main() \n' +
   '{ \n' +
   '   float d = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' +
   '   if (d < 0.5) \n' +
   '   { \n' +
   '      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n' +
   '   } \n' +
   '   else \n' +
   '   { \n' +
   '      discard; \n' +
   '   } \n' +
   '}';

function main()
{
  
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw three points
  gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

