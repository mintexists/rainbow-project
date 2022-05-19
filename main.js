let canvas = document.getElementById("canvas");

let res = 1000;

canvas.width = res;
canvas.height = res;

function  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    let scaleX = 1 / rect.width;
    let scaleY = 1 / rect.height;
    let x = (evt.clientX - rect.left) * scaleX;
    let y = (evt.clientY - rect.top) * scaleY;
    y = 1 - y;
    return { x, y };
}

let cursor = [0, 0];
document.addEventListener("mousemove", e => {
    let pos = getMousePos(canvas, e);
    cursor = [pos.x, pos.y];
});
let mouseDown = false;
document.addEventListener("mousedown", e => {
    let pos = getMousePos(canvas, e);
    cursor = [pos.x, pos.y];
    mouseDown = true;
    i = 0;
});
document.addEventListener("mouseup", e => {
    let pos = getMousePos(canvas, e);
    cursor = [pos.x, pos.y];
    mouseDown = false;
});


const gl = canvas.getContext("webgl");

function getShaderFromUrl(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return req.responseText;
}

let vs = getShaderFromUrl("shader.vert");
let fs = getShaderFromUrl("shader.frag");

console.group("%cShader", "font-size: large");
console.log(vs);
console.log(fs);
console.groupEnd();

const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

const arrays = {
    position:  {
        data: [
            // 1.0,  1.0,
            // -1.0,  1.0,
            //  1.0, -1.0,
            // -1.0, -1.0,
            -1.0, 3.0,
            3.0, -1.0,
            -1.0, -1.0,
        ],
        numComponents: 2,
    }
};

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

let i = 0;

function step() {
    if (i < res * res) {
        i += 1000 * 5;
        // i += 1;
    }
}

function render() {
    step();

    let uniforms = {
        resolution: [gl.canvas.width, gl.canvas.height],
        cursor: cursor,
        mouseDown: mouseDown,
        i: i,
    };

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP);

    requestAnimationFrame(render);
}

window.onload = () => {
    requestAnimationFrame(render);
}