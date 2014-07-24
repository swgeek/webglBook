// HelloCanvas.js
function main()
{
   // retrieve <canvas> element
   var canvas = document.getElementById('webgl');

   // Get the rendering context for WebGL
   var gl = getWebGLContext(canvas);
   if (! gl)
   {
      console.log('Failed to get the rendering context for WebGL');
      return;
   }

   // Specify the color for clearing <canvas>
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   
   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT);
}
