// ColoredPoints.js

// vertex shader
var VSHADER_SOURCE = 
   'attribute vec4 a_Position; \n' +
   'void main() \n' +
   '{ \n' +
   '   gl_Position = a_Position; \n' +
   '   gl_PointSize = 10.0; \n' +
   '} \n'; 

// fragment shader
var FSHADER_SOURCE = 
   'precision mediump float; \n' + 
   'uniform vec4 u_FragColor; \n' + // uniform variable
   'void main() \n' +
   '{ \n' +
   '   gl_FragColor = u_FragColor; \n' +
   '} \n';

function main()
{
   var canvas = document.getElementById('webgl');

   var gl = getWebGLContext(canvas);
   if (! gl)
   {
      console.log('could not get webgl context');
      return;
   }
 
   if (! initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
   {
      console.log('could not init shaders');
      return;
   }
  
   var a_Position = gl.getAttribLocation(gl.program, 'a_Position'); 
   if (a_Position < 0)
   {
      console.log('could not get location for a_Position');
      return;
   }

   var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (u_FragColor < 0)
   {
      console.log('could not get location for u_FragColor');
      return;
   }

   canvas.onmousedown = function(ev) { click(ev, gl, canvas, a_Position, u_FragColor); };

   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   gl.clear(gl.COLOR_BUFFER_BIT);
}

   var g_points = [];   // array for mouse press
   var g_colors = [];   // array for point colors

   function click(ev, gl, canvas, a_Position, u_FragColor)
   {
      var x = ev.clientX; // x coord of mouse pointer
      var y = ev.clientY; // y coord of mouse pointer
      var rect = ev.target.getBoundingClientRect();

      x = ((x - rect.left) - (canvas.width / 2)) / (canvas.width/2);
      y = ( canvas.height/2 - (y - rect.top)) / (canvas.height/2);

      // store the coords to g_points
      g_points.push([x, y]);

      // store to color to g_colors
      if (x >= 0.0 && y >= 0.0)
      { // first quadrant
         g_colors.push([1.0, 0.0, 0.0, 1.0]); // red
      }
      else if (x < 0.0 && y < 0.0)
      { // third quadrant
         g_colors.push([0.0, 1.0, 0.0, 1.0]); // green
      }
      else
      { // others
         g_colors.push([1.0, 1.0, 1.0, 1.0]); // white
      } 
     
      gl.clear(gl.COLOR_BUFFER_BIT);

      var len = g_points.length;
      for (var i=0; i<len; i++)
      {
         var xy = g_points[i];
         var rgb = g_colors[i];

         // pass position of point to a_Position attribute
         gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
  
         // pass color of point to u_FragColor uniform
         gl.uniform4f(u_FragColor, rgb[0], rgb[1], rgb[2], rgb[3]);
 
         // draw a point  
         gl.drawArrays(gl.POINTS, 0, 1); 
      } 
   }
