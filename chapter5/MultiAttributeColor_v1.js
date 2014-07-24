// MultiAttributeSize.js

var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'attribute vec4 a_Color; \n' +
   'varying vec4 v_Color; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = a_Position;\n' +
   '   gl_PointSize = 10.0; \n' +
   '   v_Color = a_Color; \n' +
   '}';

var FSHADER_SOURCE =
   'precision mediump float;\n' +
   'varying vec4 v_Color; \n void main() { gl_FragColor = v_Color; }';

function getGLContext()
{
   var canvas = document.getElementById('webgl');
   var context = canvas.getContext('webgl');
   return context;
}

function loadAndCompileShader(gl, shaderSource, type)
{
   var shader = gl.createShader(type);
   if (shader == null)
   {
      throw 'loadAndCompileShader: could not create shader';
   }

   gl.shaderSource(shader, shaderSource)
   gl.compileShader(shader);

   var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
   if (! compiled)
   {
      var error = gl.getShaderInfoLog(shader);
      console.log('Shader compilation failed: ' + error);
      gl.deleteShader(shader);
      throw 'loadAndCompileShader: compile failed';
   }

   return shader;
}


function compileShadersIntoProgram(gl)
{
   var program = gl.createProgram();
   var vertexShader = loadAndCompileShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
   var fragmentShader = loadAndCompileShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   gl.useProgram(program);
   gl.program = program;
}

function initVertexBuffers(gl)
{
   var numVertices = 3;
   var vertices = new Float32Array([ 0.0, 0.5, 1.0, 0.0, 0.0, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, -0.5, 0.0, 0.0, 1.0]);

   var vertexBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var FSIZE = vertices.BYTES_PER_ELEMENT;

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
   gl.enableVertexAttribArray(a_Position);

   var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
   gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
   gl.enableVertexAttribArray(a_Color);

   return numVertices;
}

function main()
{
   var gl = getGLContext();
   compileShadersIntoProgram(gl);
   var numOfVertices = initVertexBuffers(gl);
  
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);
   gl.drawArrays(gl.TRIANGLES, 0, numOfVertices);
}
