/***********
 * knot.js
 *
 * Xiuhcoatl XIII
 * August 2024
 ***********/



var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var mat, linemat, knot;

function createScene() {
    mat = new THREE.MeshPhongMaterial({color: 0x1562c9,  specular: 0xFF9999, shininess: 100});
    linemat = new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.5 } );
    var light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    var light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 0, -40);
    var ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
}

var controls = new function () {
    this.radius = 10;
    this.tube = 3;
    this.radialSegments = 8;
    this.tubularSegments = 64;
    this.p = 2;
    this.q = 3;
    this.smooth = true;
}



function update() {
    if (knot)
        scene.remove(knot);
    var geom = new THREE.TorusKnotGeometry(controls.radius, controls.tube, Math.round(controls.tubularSegments), Math.round(controls.radialSegments), Math.round(controls.p), Math.round(controls.q));
    knot = new THREE.Object3D();
    knot.add(new THREE.Mesh(geom, mat));
    if (controls.smooth) {
        mat.flatShading = false;
    } else {
        knot.add(new THREE.LineSegments(geom, linemat));
        mat.flatShading = true;
    }
    mat.needsUpdate = true;
    scene.add(knot);
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

	renderer = new THREE.WebGLRenderer({antialias : true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 40);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'radius', 1, 20).onChange(update);
    gui.add(controls, 'tube', 0.1, 10).onChange(update);
    gui.add(controls, 'tubularSegments', 3, 300).step(1).onChange(update);
    gui.add(controls, 'radialSegments', 3, 30).step(1).onChange(update);
    gui.add(controls, 'p', 1, 20).step(1).onChange(update);
    gui.add(controls, 'q', 1, 20).step(1).onChange(update);
    gui.add(controls, 'smooth').onChange(update);
    update();
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
initGui();
addToDOM();
render();
animate();

