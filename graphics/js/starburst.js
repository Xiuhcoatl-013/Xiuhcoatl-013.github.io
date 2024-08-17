/***********
 * starburst.js
 * 
 * Xiuhcoatl XIII
 * August 2024
 ***********/



var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();

function starburst(n, innerColor, outerColor) {
    var rad = 10;
    var origin = new THREE.Vector3(0, 0, 0);
    var geom = new THREE.Geometry();
    for (var i = 0; i < n; i++) {
        var dest = getRandomPointOnSphere(rad);
        geom.vertices.push(origin, dest);
        geom.colors.push(innerColor, outerColor);
    }
    var args = {vertexColors: true, linewidth: 2};
    var mat = new THREE.LineBasicMaterial(args);
    return new THREE.Line(geom, mat, THREE.LineSegments);
}


function createScene() {
    var inner = new THREE.Color(0xff00ff);
    var outer = new THREE.Color(0x00ff00);
    var n = 400;
    var mesh = starburst(n, inner, outer);
    scene.add(mesh);
}


function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
	renderer.render(scene, camera);
}


function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 40);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}



init();
createScene();
addToDOM();
render();
animate();

