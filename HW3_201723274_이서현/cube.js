var gl;

function testGLError(functionLastCalled) {
    /* gl.getError returns the last error that occurred using WebGL for debugging */ 
    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }
    return true;
}

function initialiseGL(canvas) {
    try {
        // Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }

    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }
    return true;
}


function createCubePosColor(sx, sy, sz){
    sx/=2.0; sy/=2.0; sz/=2.0;

    var vertex = [
        sx, sy, sz, 1.0, 0.0, 1.0, 1.0,  //1
        sx*(-1), sy*(-1), sz, 1.0, 1.0, 1.0, 1.0, //2  //1 triangle
        sx, sy*(-1), sz, 0.0, 0.0, 1.0, 1.0, //3

        sx, sy, sz, 1.0, 1.0, 1.0, 1.0,  //1
        sx*(-1), sy, sz, 1.0, 0.0, 1.0, 1.0, //4       //2 triangle
        sx*(-1), sy*(-1), sz, 1.0, 0.0, 0.0, 1.0, //2

        sx, sy, sz, 1.0, 0.0, 1.0, 1.0,  //1
        sx, sy, sz*(-1), 1.0, 1.0, 1.0, 1.0,  //5      //3 triangle
        sx*(-1), sy, sz*(-1), 0.0, 0.0, 1.0, 1.0, //8

        sx, sy, sz, 1.0, 0.0, 1.0, 1.0,  //1
        sx*(-1), sy, sz, 0.0, 1.0, 0.0, 1.0, //4      //4 triangle
        sx*(-1), sy, sz*(-1), 1.0, 1.0, 0.0, 1.0, //8

        sx*(-1), sy*(-1), sz, 1.0, 0.0, 0.5, 1.0, //2
        sx*(-1), sy, sz, 0.0, 1.0, 0.0, 1.0, //4      //5 triangle
        sx*(-1), sy, sz*(-1), 1.0, 0.0, 1.0, 1.0, //8

        sx*(-1), sy*(-1), sz, 1.0, 1.0, 0.0, 1.0, //2
        sx*(-1), sy, sz*(-1), 0.0, 1.0, 1.0, 1.0, //8  //6 triangle
        sx*-1, sy*(-1), sz*-1, 1.0, 0.0, 0.0, 1.0, //6

        sx*(-1), sy*(-1), sz, 1.0, 0.0, 1.0, 1.0, //2
        sx, sy*(-1), sz, 1.0, 0.0, 1.0, 1.0, //3       //7 triangle
        sx*-1, sy*(-1), sz*-1, 1.0, 0.0, 1.0, 1.0, //6

        sx, sy*(-1), sz, 1.0, 1.0, 1.0, 1.0, //3       
        sx*-1, sy*(-1), sz*-1, 1.0, 0.0, 0.0, 1.0, //6   //8 triangle
        sx*-1, sy*(-1), sz, 1.0, 1.0, 0.0, 1.0, //7

        sx, sy, sz, 0.0, 0.0, 1.0, 1.0, //1
        sx, sy*(-1), sz, 1.0, 1.0, 0.0, 1.0, //3         //9 triangle
        sx, sy, sz*-1, 0.0, 0.0, 1.0, 1.0, //5

        sx, sy*(-1), sz, 1.0, 1.0, 0.0, 1.0, //3 
        sx, sy*(-1), sz*-1, 1.0, 1.0, 1.0, 1.0, //7     //10 triangle
        sx, sy, sz*-1, 1.0, 0.0, 1.0, 1.0, //5

        sx*(-1), sy, sz*(-1), 1.0, 0.0, 0.0, 1.0, //8
        sx*-1, sy*(-1), sz*-1, 1.0, 0.0, 0.0, 1.0, //6   //11 triangle
        sx, sy, sz*-1, 1.0, 0.0, 0.0, 1.0, //5

        sx*-1, sy*(-1), sz*-1, 0.0, 0.0, 1.0, 1.0, //6
        sx, sy*(-1), sz*-1, 1.0, 0.0, 0.0, 1.0, //7      //12 triangle
        sx, sy, sz*-1, 1.0, 0.0, 1.0, 1.0, //5

    ];

    return vertex;
}

var shaderProgram;
var vertexData = createCubePosColor(1.0,1.0,1.0);
var elementData = [ 0,1,2,3,4,5]; 


function initialiseBuffer() {

    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

	gl.elementBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.elementBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elementData),gl.STATIC_DRAW);

    return testGLError("initialiseBuffers");
}

function initialiseShaders() {

    var fragmentShaderSource = '\
			varying highp vec4 color; \
			void main(void) \
			{ \
				gl_FragColor = color; \
			}';

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    var vertexShaderSource = '\
			attribute highp vec4 myVertex; \
			attribute highp vec4 myColor; \
			uniform mediump mat4 transformationMatrix; \
			uniform mediump mat4 virwMatrix; \
			uniform mediump mat4 projMatrix; \
			varying highp vec4 color;\
			void main(void)  \
			{ \
				gl_Position = transformationMatrix * myVertex; \
				color = myColor; \
			}';

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();
    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);
    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
    // Link the program
    gl.linkProgram(gl.programObject);
    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);
    console.log("myVertex Location is: ", gl.getAttribLocation(gl.programObject, "myColor"));

    return testGLError("initialiseShaders");
}
var rotY = 0.0;
function btnRotate() {
    rotY = 0.03;
}

function btnPause() {
    rotY = 0.0;
}


function renderScene() {

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");
    var transformationMatrix = [
        Math.cos(rotY),	0.0, -Math.sin(rotY),	0.0,
        0.0,			1.0,  0.0,				0.0, 
        Math.sin(rotY), 0.0, Math.cos(rotY),	0.0, // For pseudo perspective View
        0.0,			0.0, 0.0,				1.0
    ];



    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 28, 12);
	// gl.vertexAttrib4f(1, Math.random(), 0.0, 1.0, 1.0);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

	// gl.lineWidth(6.0);  // It is not working at Chrome!
    //gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT,0);
    // gl.drawArrays(gl.POINTS, 0, 6);
    // gl.drawArrays(gl.LINES, 0, 6);
    gl.drawArrays(gl.LINE_STRIP, 0, 36); 
	console.log("Enum for Primitive Assumbly", gl.TRIANGLES, gl.TRIANGLE, gl.POINTS);  
    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {
    var canvas = document.getElementById("helloapicanvas");

    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }

    // Render loop
    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			function (callback) {
			    window.setTimeout(callback, 1000, 60);
			};
    })();

    (function renderLoop() {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}
