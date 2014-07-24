var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'attribute vec4 a_Normal; \n' +
   'uniform mat4 u_MvpMatrix; \n' +
   'uniform mat4 u_NormalMatrix; \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = u_MvpMatrix * a_Position; \n' +
   '   vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7)); \n' +
   '   vec4 color = vec4(1.0, 0.4, 0.0, 1.0); \n' +
   '   vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz); \n' +
   '   float nDotL = max(dot(normal, lightDirection), 0.0); \n' +
   '   v_Color = vec4(color.rgb * nDotL+ vec3(0.1), color.a); \n' +
   '}';

var FSHADER_SOURCE = 
   '#ifdef GL_ES \n' +
   'precision mediump float; \n' +
   '#endif \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_FragColor = v_Color;\n' +
   '}';

function main()
{
   var canvas = document.getElementById('webgl');

   var gl=getWebGLContext(canvas);
   if (!gl) throw 'could not get gl context';

   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
      throw 'could not init shaders';
  
  var n = initVertexBuffers(gl);
  if (n < 0) throw 'could not init vertex buffers';

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (! u_MvpMatrix || ! u_NormalMatrix)
     throw 'could not get uniform matrix location'

  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width/canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  document.onkeydown = function(ev) { keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); };

  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}


var ANGLE_STEP = 3.0;
var g_arm1Angle = 90.0;
var g_joint1Angle = 45.0;
var g_joint2Angle = 0.0;
var g_joint3Angle = 0.0;

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
{
   console.log(ev.keyCode);
   switch(ev.keyCode)
   {
      case 40: // up arrow
         if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
         break;

      case 38: // down arrow
         if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
         break;

      case 39: // right arrow
         g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360.0;
         break;

      case 37: // left arrow
         g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360.0;
         break;

      case 90: // z
         g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360.0;
         break;
 
      case 88: // x
         g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360.0;
         break;
 
      case 86: // v
         if (g_joint3Angle < 60.0) g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360.0;
         break;
 
      case 67: //  c
         if (g_joint3Angle > -60.0) g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360.0;
         break;
 
      default:
         return;
   }

  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
  // Coordinates（Cube which length of one side is 1 with the origin on the center of the bottom)
  var vertices = new Float32Array([
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
  ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
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

  // Write the vertex property to buffers (coordinates and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

   var indexBuffer = gl.createBuffer();
   if (! indexBuffer) throw 'could not create buffer';
 
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

   return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num)
{
   var buffer = gl.createBuffer();
   if (! buffer)
      throw 'could not create buffer';

   gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
   gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

   var attribLocation = gl.getAttribLocation(gl.program, attribute);
   if (attribLocation < 0)
      throw 'could not get attribute location';

   gl.vertexAttribPointer(attribLocation, num, type, false, 0, 0);
   gl.enableVertexAttribArray(attribLocation);

   return true;
}

var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
{
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   var baseHeight = 2.0;
   g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
   drawBox(gl, n, 10.0, baseHeight, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

   // arm1
   var arm1length = 10.0;
   g_modelMatrix.translate(0.0, baseHeight, 0.0);     // Move onto the base
   g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
   drawBox(gl, n, 3.0, arm1length, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

   // arm2
   var arm2length = 10.0;
   g_modelMatrix.translate(0.0, arm1length, 0.0);
   g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
   drawBox(gl, n, 4.0, arm2length, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

   // a palm
   var palmlength = 2.0;
   g_modelMatrix.translate(0.0, arm2length, 0.0);
   g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);
   drawBox(gl, n, 2.0, palmlength, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

   // move to the center of the tip of the palm
   g_modelMatrix.translate(0.0, palmlength, 0.0);

   // finger 1
   pushMatrix(g_modelMatrix);
   g_modelMatrix.translate(0.0, 0.0, 2.0);
   g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);
   drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
   g_modelMatrix = popMatrix();

   // finger 2
   g_modelMatrix.translate(0, 0, -2.0);
   g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);
   drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
   
}

var g_matrixStack = [];
function pushMatrix(m)
{
   var m2 = new Matrix4(m);
   g_matrixStack.push(m2);
}

function popMatrix()
{
   return g_matrixStack.pop();
}


var g_normalMatrix = new Matrix4();

function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
{
   pushMatrix(g_modelMatrix);
   g_modelMatrix.scale(width, height, depth);

   g_mvpMatrix.set(viewProjMatrix);
   g_mvpMatrix.multiply(g_modelMatrix);
   gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
   g_normalMatrix.setInverseOf(g_modelMatrix);
   g_normalMatrix.transpose();
   gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
   gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
   g_modelMatrix = popMatrix();
}

