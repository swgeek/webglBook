// RotatedTranslatedTriangle.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'uniform mat4 u_ModelMatrix; \n' + 
   'void main() \n' + 
   '{ \n' + 
   'gl_Position = u_ModelMatrix * a_Position; \n' + 
   '}';

var FSHADER_SOURCE = 'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }';

function webGlContext(canvas)
{
   var context = canvas.getContext('webgl');

   if (! context)
      throw 'could not get webgl context';

   return context;
}

function compileShader(gl, shaderSource, type)
{
   var shader = gl.createShader(type);
   gl.shaderSource(shader, shaderSource);
   gl.compileShader(shader);

   // check for errors
   var compileStatus = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
   if (! compileStatus)
   {
      var compileError = gl.getShaderInfoLog(shader);
      console.log('compile error: ' + compileError);
      gl.deleteShader(shader);
      throw 'shader compile failed';
   }

   return shader;
}

function createAndLinkProgram(gl, vertexShader, fragmentShader)
{
   var program = gl.createProgram();
   if (! program)
      throw 'could not create program';

   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   var linkStatus = gl.getProgramParameter(program, gl.LINK_STATUS);
   if (! linkStatus)
   {
      var linkError = gl.getProgramInfoLog(program);
      console.log('link error: ' + linkError);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      throw 'link error'; 
   }

   gl.useProgram(program);
   gl.program = program;
}

function main()
{
   var canvas = document.getElementById('webgl');
   var gl = webGlContext(canvas);
   var vertexShader = compileShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
   var fragmentShader = compileShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
   createAndLinkProgram(gl, vertexShader, fragmentShader);

   var n = initVertexBuffers(gl);

   var modelMatrixBuffer = createModelMatrix();
   var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
   if (! u_ModelMatrix)
      throw 'could not get location for u_ModelMatrix';

   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrixBuffer);

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl)
{
   var vertices = new Float32Array([0.0, 0.3, -0.3, -0.3, 0.3, -0.3]);
   var n = 3;

   var vertexBuffer = gl.createBuffer();
   if (! vertexBuffer)
      throw 'could not create vertexBuffer';

   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(a_Position);

   return n;
}

function createModelMatrix()
{
   var ANGLE = 60.0;
   var Tx = 0.5; 

   var radians = ANGLE * Math.PI / 180.0;
   var cosValue = Math.cos(radians);
   var sinValue = Math.sin(radians);

   // use row major to be more intuitive, change at the end
   var rotateMatrix =  new Float32Array([
      cosValue, -sinValue, 0.0, 0.0,
      sinValue, cosValue, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0]);

   var translateMatrix = new Float32Array([
   1.0, 0.0, 0.0, Tx,
   0.0, 1.0, 0.0, 0.0,
   0.0, 0.0, 1.0, 0.0,
   00, 0.0, 0.0, 1.0]);

   resultMatrix = multiplyMatrices(translateMatrix, rotateMatrix);
   //resultMatrix = multiplyMatrices(rotateMatrix, translateMatrix);

   // transpose to columnMajor
   modelMatrix = new Float32Array(16);

   modelMatrix[ 0] = resultMatrix[ 0];
   modelMatrix[ 1] = resultMatrix[ 4];
   modelMatrix[ 2] = resultMatrix[ 8];
   modelMatrix[ 3] = resultMatrix[12];
   modelMatrix[ 4] = resultMatrix[ 1];
   modelMatrix[ 5] = resultMatrix[ 5];
   modelMatrix[ 6] = resultMatrix[ 9];
   modelMatrix[ 7] = resultMatrix[13];
   modelMatrix[ 8] = resultMatrix[ 2];
   modelMatrix[ 9] = resultMatrix[ 6];
   modelMatrix[10] = resultMatrix[10];
   modelMatrix[11] = resultMatrix[14];
   modelMatrix[12] = resultMatrix[ 3];
   modelMatrix[13] = resultMatrix[ 7];
   modelMatrix[14] = resultMatrix[11];
   modelMatrix[15] = resultMatrix[15];

   return modelMatrix;
}

function multiplyMatrices(lhs, rhs)
{
   var resultMatrix = new Float32Array(16);

   resultMatrix[0] = lhs[0]*rhs[0] + lhs[1]*rhs[4] + lhs[2]*rhs[8] + lhs[3]*rhs[12];
   resultMatrix[1] = lhs[0]*rhs[1] + lhs[1]*rhs[5] + lhs[2]*rhs[9] + lhs[3]*rhs[13];
   resultMatrix[2] = lhs[0]*rhs[2] + lhs[1]*rhs[6] + lhs[2]*rhs[10] + lhs[3]*rhs[14];
   resultMatrix[3] = lhs[0]*rhs[3] + lhs[1]*rhs[7] + lhs[2]*rhs[11] + lhs[3]*rhs[15];
   
   resultMatrix[4] = lhs[4]*rhs[0] + lhs[5]*rhs[4] + lhs[6]*rhs[8] + lhs[7]*rhs[12];
   resultMatrix[5] = lhs[4]*rhs[1] + lhs[5]*rhs[5] + lhs[6]*rhs[9] + lhs[7]*rhs[13];
   resultMatrix[6] = lhs[4]*rhs[2] + lhs[5]*rhs[6] + lhs[6]*rhs[10] + lhs[7]*rhs[14];
   resultMatrix[7] = lhs[4]*rhs[3] + lhs[5]*rhs[7] + lhs[6]*rhs[11] + lhs[7]*rhs[15];
   
   resultMatrix[8] = lhs[8]*rhs[0] + lhs[9]*rhs[4] + lhs[10]*rhs[8] + lhs[11]*rhs[12];
   resultMatrix[9] = lhs[8]*rhs[1] + lhs[9]*rhs[5] + lhs[10]*rhs[9] + lhs[11]*rhs[13];
   resultMatrix[10] = lhs[8]*rhs[2] + lhs[9]*rhs[6] + lhs[10]*rhs[10] + lhs[11]*rhs[14];
   resultMatrix[11] = lhs[8]*rhs[3] + lhs[9]*rhs[7] + lhs[10]*rhs[11] + lhs[11]*rhs[15];
   
   resultMatrix[12] = lhs[12]*rhs[0] + lhs[13]*rhs[4] + lhs[14]*rhs[8] + lhs[15]*rhs[12];
   resultMatrix[13] = lhs[12]*rhs[1] + lhs[13]*rhs[5] + lhs[14]*rhs[9] + lhs[15]*rhs[13];
   resultMatrix[14] = lhs[12]*rhs[2] + lhs[13]*rhs[6] + lhs[14]*rhs[10] + lhs[15]*rhs[14];
   resultMatrix[15] = lhs[12]*rhs[3] + lhs[13]*rhs[7] + lhs[14]*rhs[11] + lhs[15]*rhs[15];

   return resultMatrix;
}



