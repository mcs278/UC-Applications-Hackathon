"use strict";

var year = 2007;
var rotationRadians = 0;  // ##
var school = -1;

var cubePositions = [
  [-150,150,0],
  [0,150,0],
  [150,150,0],
  [-150,0,0],
  [0,0,0],
  [150,0,0],
  [-150,-150,0],
  [0,-150,0],
  [150,-150,0]
];

var colors = [
    [ 1, 0.647059, 0.0, 1.0 ],  // orange
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 0.498039, 0.313725, 1.0 ],   // coral
    [ 0.690196, 0.768627, 0.870588, 1.0]    // lightsteelblue
];

// UC Application Counts
var data = [
// 2007   2008    2009    2010    2011    2012    2013    2014    2015    2016    2017
  [55103,	60709,	61882,	65474,	68932,	77378,	83640,	90284,	96082,	101655,	103616],   // UC Berkeley
  [42311,	48653,	51298,	54521,	59360,	62515,	69642,	74909,	79930,	86041,	89657 ],   // UC Davis
  [48527,	51935,	54640,	59628,	63250,	69008,	76235,	82450,	88792,	97759,	104672],   // UC Irvine
  [64049,	70328,	72106,	76313,	81235,	91512,	99559,	105824,	112744,	119326,	123992],   // UC Los Angeles
  [8818,	10180,	10219,	12636,	13701,	15054,	17191,	17469,	19932,	22632,	24988 ],   // UC Merced
  [23773,	25370,	27236,	30293,	34290,	37606,	42178,	43395,	47669,	52467,	53618 ],   // UC Riverside
  [53845,	57116,	58513,	62376,	70474,	75987,	82391,	89537,	94280,	102692,	106202],   // UC San Diego
  [48728,	55871,	54758,	58992,	63303,	68331,	76039,	80893,	85208,	94015,	98584 ],   // UC Santa Barbara
  [29139,	33055,	32847,	34630,	36262,	40622,	46640,	48849,	54333,	59102,	62509 ]    // UC Santa Cruz
];

window.onload = function init() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("gl-canvas");
  var gl = WebGLUtils.setupWebGL( canvas );
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = initShaders( gl, "3d-vertex-shader", "3d-fragment-shader" );
  //var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var normalLocation = gl.getAttribLocation(program, "a_normal");

  // lookup uniforms
  var worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
  var worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  var reverseLightDirectionLocation =
      gl.getUniformLocation(program, "u_reverseLightDirection");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put geometry data into buffer
  setGeometry(gl);

  // Create a buffer to put normals in
  var normalBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  // Put normals data into buffer
  setNormals(gl);

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);
  //var fRotationRadians = 0;

  //document.onkeydown = handleKeyDown;

  document.getElementById( "UCB" ).onclick = function () {
    if (school == 0){
      school = -1;
    }
    else {
      school = 0;
    }
  };
  document.getElementById( "UCD" ).onclick = function () {
    if (school == 1){
      school = -1;
    }
    else {
      school = 1;
    }
  };
  document.getElementById( "UCI" ).onclick = function () {
    if (school == 2){
      school = -1;
    }
    else {
      school = 2;
    }
  };
  document.getElementById( "UCLA" ).onclick = function () {
    if (school == 3){
      school = -1;
    }
    else {
      school = 3;
    }
  };
  document.getElementById( "UCM" ).onclick = function () {
    if (school == 4){
      school = -1;
    }
    else {
      school = 4;
    }
  };
  document.getElementById( "UCR" ).onclick = function () {
    if (school == 5){
      school = -1;
    }
    else {
      school = 5;
    }
  };
  document.getElementById( "UCSD" ).onclick = function () {
    if (school == 6){
      school = -1;
    }
    else {
      school = 6;
    }
  };
  document.getElementById( "UCSB" ).onclick = function () {
    if (school == 7){
      school = -1;
    }
    else {
      school = 7;
    }
  };
  document.getElementById( "UCSC" ).onclick = function () {
    if (school == 8){
      school = -1;
    }
    else {
      school = 8;
    }
  };

  drawScene();


  // Setup a ui.
  webglLessonsUI.setupSlider("#Year", {value: year, slide: updateYear, min: 2007, max: 2017});

  function updateYear(event, ui) {
    year = ui.value;
    //drawScene();
  }


  // Draw the scene.
  function drawScene() {
    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);  // ###
    rotationRadians += 0.05;
    var stack = [];

    // Tell WebGL how to convert from clip space to pixels
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floating point values
    var normalize = false; // normalize the data (convert from 0-255 to 0-1)
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        normalLocation, size, type, normalize, stride, offset)

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Compute the camera's matrix
    var camera = [0, 35, 250];
    var target = [0, 35, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(camera, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    // Compute a view projection matrix
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
    viewProjectionMatrix = m4.scale(viewProjectionMatrix, 0.5,0.5,0.5);

    stack.push(viewProjectionMatrix);

    for ( var n = 0; n < 9; ++n ){
    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset)

    // Turn on the normal attribute
    gl.enableVertexAttribArray(normalLocation);

    // Bind the normal buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    viewProjectionMatrix = stack.pop();
    stack.push(viewProjectionMatrix);
    //viewProjectionMatrix = m4.translate(viewProjectionMatrix,-100,30,0);

    // Draw a cube at the origin
    var worldMatrix = m4.yRotation(0);
    //worldMatrix = m4.scale(worldMatrix, data[n][year]/50000,data[n][year]/50000,data[n][year]/50000);
    if (school == n){
      worldMatrix = m4.scale(worldMatrix, 1.2,1.2,1.2);
    }
    worldMatrix = m4.translate(worldMatrix, cubePositions[n][0],cubePositions[n][1],cubePositions[n][2]);
    worldMatrix = m4.yRotate(worldMatrix,rotationRadians*data[n][year%2007]/50000);

    // Multiply the matrices.
    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = m4.inverse(worldMatrix);
    var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    // Set the matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);

    // Set the color to use
    gl.uniform4fv(colorLocation, colors[n]);

    // set the light direction.
    gl.uniform3fv(reverseLightDirectionLocation, m4.normalize([0, 0.7, 1]));

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6 * 6;
    gl.drawArrays(primitiveType, offset, count);
    }

    requestAnimFrame( drawScene );
  }
}

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
  var positions = new Float32Array([
    // front
    -30,-30,-30,
    -30,30,-30,
    30,-30,-30,
    -30,30,-30,
    30,30,-30,
    30,-30,-30,

    // left
    -30,-30,-30,
    -30,-30,30,
    -30,30,30,
    -30,-30,-30,
    -30,30,30,
    -30,30,-30,

    // right
    30,-30,-30,
    30,30,-30,
    30,30,30,
    30,-30,-30,
    30,30,30,
    30,-30,30,

    // back
    -30,-30,30,
    30,-30,30,
    -30,30,30,
    -30,30,30,
    30,-30,30,
    30,30,30,

    // top
    -30,-30,-30,
    30,-30,-30,
    30,-30,30,
    -30,-30,-30,
    30,-30,30,
    -30,-30,30,
/*
    // bottom
    -30,30,-30,
    30,30,-30,
    -30,30,30,
    30,30,-30,
    -30,30,30,
    30,30,30
*/
    // bottom
    30,30,30,
    -30,30,30,
    -30,30,-30,
    30,30,30,
    -30,30,-30,
    30,30,-30

        ]);

  // Center the F around the origin and Flip it around. We do this because
  // we're in 3D now with and +Y is up where as before when we started with 2D
  // we had +Y as down.

  // We could do by changing all the values above but I'm lazy.
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  var matrix = m4.xRotation(Math.PI);
  matrix = m4.translate(matrix, 0, -40, 0);
  //matrix = m4.translate(matrix, -50, -75, -15);
  //matrix = m4.scale(matrix, 0.5,0.5,0.5);

  for (var ii = 0; ii < positions.length; ii += 3) {
    var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setNormals(gl) {
  var normals = new Float32Array([
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Left
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,
     -1.0,  0.0,  0.0,

    // Right
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0

        ]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}

function handleKeyDown(e) {
  e = e || window.event;
  var keycode = e.keyCode;
  switch (keycode) {
    case 39:  // ->
      year = (year + 1) % 10;
      break;
  }
}
