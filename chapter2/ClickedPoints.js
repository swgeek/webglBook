// ClickedPoints.js

// Vertex Shader 
var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' + 
   'void main() \n' +
   '{ \n' + 
   '   gl_Position = a_Position; \n' + 
   '   gl_PointSize = 10.0; \n' + 
   '} \n';

// Fragment Shader
var FSHADER_SOURCE = 
   'void main() \n' + 
   '{ \n' +
   '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n' + 
   '} \n';


function main()
{
   // retrieve canvas element
   var canvas = document.getElementById('webgl');

   // get rendering context for webgl
   var gl = getWebGLContext(canvas);
    if (!gl)
   {
      console.log('failed to get rendering context for WebGL');
      return;
   }


   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      console.log('Could not initialize shaders');
      return;
   }

   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0)
   {
      console.log('Failed to get the storage location of a_Position');
      return;
   }

   // register event handler to call for mouse press
   canvas.onmousedown = function(ev) { click(ev, gl, canvas, a_Position); };

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT);

   var g_points = []; // array for mouse press

   function click(ev, gl, canvas, a_Position)
   {
      var x = ev.clientX; // x coord of mouse pointer
      var y = ev.clientY; // y coord if mouse pointer
      var rect = ev.target.getBoundingClientRect();

      x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
      y = (canvas.height/2 - (y - rect.top)) / (canvas.height/2);

      // store the coordinates to a point array
      g_points.push([x, y]);

      // clear canvas
      gl.clear(gl.COLOR_BUFFER_BIT);

      var len = g_points.length;

      for (var i=0; i<len; i++ )
      {
         var xy = g_points[i]
         gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
         gl.drawArrays(gl.POINTS, 0, 1);
      }

}


}
