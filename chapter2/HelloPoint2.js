// HelloPoint2.js

// Vertex Shader
var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n'+ 
   'attribute float a_PointSize; \n'+ 
   'void main() \n' +
   '{' +
   '   gl_Position = a_Position; \n' + 
   '   gl_PointSize = a_PointSize; \n' + 
   '} \n';

// Fragment shader
var FSHADER_SOURCE = 
   'void main() \n' + 
   '{ \n' +
   '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n' +  // set the fragment color
   '} \n';

function main()
{
   // retrieve canvas element
   var canvas = document.getElementById('webgl');

   // get the rendering context for WebGL
   var gl = getWebGLContext(canvas);
   if (!gl)
   {
      console.log('failed to get rendering context for WebGL');
      return;
   }

   // initialize shaders
   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      console.log('failed to initialize shaders');
      return; 
   }

   // get storage location of attribute variable
   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0)
   {
      console.log('Failed to get the storage location of a_Position');
      return;
   }

   // pass vertex position to attribute variable
   gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

   // get storage location of attribute variable
   var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
   if (a_PointSize < 0)
   {
      console.log('Failed to get the storage location of a_PointSize');
      return;
   }

   // pass vertex position to attribute variable
   gl.vertexAttrib1f(a_PointSize, 5.0);
   // set the color for clearing canvas
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   // clear canvas
   gl.clear(gl.COLOR_BUFFER_BIT);

   // draw the point
   gl.drawArrays(gl.POINTS, 0, 1);
}

