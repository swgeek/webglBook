var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'uniform mat4 u_ModelMatrix; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = u_ModelMatrix * a_Position;\n' + 
   '}';

var FSHADER_SOURCE = 'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }';

var ANGLE_STEP = 45.0; // degrees per second

function getGLContext(canvas)
{
   // this is in its own function as is implementation specific. Change this code to make more generic 
   // if plan to run on other browsers. 
   // currently set up for Chrome
   var context = canvas.getContext('webgl');
   if (! context)
   {
      throw 'could not create webgl context';
   }

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

function createAndLinkProgram(gl, vertexShader, fragmentShader)
{
   var program = gl.createProgram();
   if (! program)
   {
      throw 'createAndLinkProgram: could not create program';
   }

   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);

   var linkInfo = gl.getProgramParameter(program, gl.LINK_STATUS);
   if (! linkInfo)
   {
      var error = gl.getProgramInfoLog(program);
      console.log('link program failed: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      throw 'link failed';
   }

   return program;
}

function compileShadersIntoProgram(gl)
{
   var vertexShader = loadAndCompileShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
   var fragmentShader = loadAndCompileShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);
   program = createAndLinkProgram(gl, vertexShader, fragmentShader);
   gl.useProgram(program);
   gl.program = program;
}


function main() 
{
   var canvas = document.getElementById('webgl');
   var gl = getGLContext(canvas);
   compileShadersIntoProgram(gl);

   var n = initVertexBuffers(gl);

   var currentAngle = 0.0;
 
   var modelMatrix = new Matrix4();

   var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
   if (! u_ModelMatrix)
      throw 'could not get location of u_ModelMatrix';

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   var tick = function()
   {
      currentAngle = animate(currentAngle);
      draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
      requestAnimationFrame(tick); // request that browser calls tick   
   };
   tick();
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix)
{
   modelMatrix.setRotate(currentAngle, 0, 0, 1);

   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

   gl.clear(gl.COLOR_BUFFER_BIT);

   gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_last = Date.now();

function animate(angle)
{
   var now = Date.now();
   var elapsed = now - g_last; // milliseconds
   g_last = now;
   var newAngle = angle + (ANGLE_STEP * elapsed)/1000.0;
   return newAngle %= 360;
}
   


function initVertexBuffers(gl)
{
   var vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);

   var n = 3;

   var vertexBuffer = gl.createBuffer();
   if (! vertexBuffer)
      throw 'could not create vertex buffer';

   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0)
      throw 'could not get location for a_Position';

   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

   gl.enableVertexAttribArray(a_Position);

   return n;
}

function up()
{
   ANGLE_STEP +=10;
}

function down()
{
   ANGLE_STEP -= 10;
}
