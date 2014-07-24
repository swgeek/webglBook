var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'attribute vec4 a_Color; \n' + 
   'uniform mat4 u_ModelMatrix; \n' + 
   'uniform mat4 u_ViewMatrix; \n' + 
   'uniform mat4 u_ProjMatrix; \n' + 
   'varying vec4 v_Color; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' + 
   '   v_Color = a_Color; \n' + 
   '}';

var FSHADER_SOURCE =
   '#ifdef GL_ES\n' +
   'precision mediump float;\n' +
   '#endif\n' +
   'varying vec4 v_Color; \n' + 
   'void main() \n' + 
   '{ \n' + 
   '   gl_FragColor = v_Color; \n' + 
   '}'

function main()
{
   var canvas = document.getElementById('webgl');
   var gl = canvas.getContext('webgl');

   if (!gl)
      throw 'could not get gl context';

   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
      throw 'could not init shaders';

   var n = initVertexBuffers(gl);
   if (n < 0)
      throw 'could not init vertex buffers';

   gl.clearColor(0, 0, 0, 1);

   var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
   var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
   var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
   if (!u_ViewMatrix || !u_ModelMatrix || !u_ProjMatrix)
      throw 'error getting uniform matrix location';

   var viewMatrix = new Matrix4();
   var modelMatrix = new Matrix4();
   var projMatrix = new Matrix4();

   modelMatrix.setTranslate(0.75, 0, 0);
   viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
   projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);

   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
   gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

   gl.clear(gl.COLOR_BUFFER_BIT);

   gl.drawArrays(gl.TRIANGLES, 0, n);

   modelMatrix.setTranslate(-0.75, 0, 0);

   gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

   gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl)
{
   var verticesColors = new Float32Array([

      0.0, 1.0, 0.0, 0.4, 0.4, 1.0,
      -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
      0.5, -1.0, 0.0, 1.0, 0.4, 0.4,

      0.0, 1.0, -2.0, 1.0, 1.0, 0.4,
      -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
      0.5, -1.0, -2.0, 1.0, 0.4, 0.4,

      0.0, 1.0, -4.0, 0.4, 1.0, 0.4,
      -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
      0.5, -1.0, -4.0, 1.0, 0.4, 0.4,
   ]);
   var n = 9;

   var vertexColorBuffer = gl.createBuffer();
   if (!vertexColorBuffer)
      throw 'could not create buffer';

   gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

   var FSIZE = verticesColors.BYTES_PER_ELEMENT;
   
   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0)
      throw 'could not get attribute location';

   gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
   gl.enableVertexAttribArray(a_Position);

   var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
   if (a_Color < 0)
      throw 'could not get color attribute location';

   gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
   gl.enableVertexAttribArray(a_Color);

   return n;
}
