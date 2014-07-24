//HelloPoint1.js

// Vertex shader program
var VSHADER_SOURCE = 
   'void main() {\n ' + 
   '   gl_Position = vec4(0.0, 0.0, 0.0, 1.0); \n' + 
   '   gl_PointSize = 10.0; \n' +     // set the point size
   '}\n';

// Fragment shader program
var FSHADER_SOURCE = 
   'void main() {\n' + 
   '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n' + // set the color
   '} \n';

function main()
{
   // retrieve the canvas element
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

   // set color for clearing canvas
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   // clear canvas
   gl.clear(gl.COLOR_BUFFER_BIT);

   // draw a point
   gl.drawArrays(gl.POINTS, 0, 1);
}
