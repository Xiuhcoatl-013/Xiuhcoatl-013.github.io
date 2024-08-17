/***********
 * zigguratD.js
 * 
 * Xiuhcoatl XIII
 * August 2024
 ***********/



let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let zig, mats, nbrLevels;



function createScene() {
    nbrLevels = controls.nbrLevels;
    zig = ziggurat(controls.nbrLevels, controls.nbrSides, controls.height, controls.scale, controls.opacity);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(20, 40, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(zig);

    let circleGeom = new THREE.CircleGeometry(3, 24);
    let circleMat = new THREE.MeshBasicMaterial({color: 0x333333, side: THREE.DoubleSide});
    let circle = new THREE.Mesh(circleGeom, circleMat);
    circle.rotateX(Math.PI / 2.0);
    circle.position.y = -0.01;
    scene.add(circle);
}



function ziggurat(nbrLevels, nbrSides, height, sfactor, opacity, materials) {
    let radius = 1.0;
    let ypos = height / 2.0;
    let sf = sfactor;
    if (!materials) mats = [];
    root = new THREE.Object3D();
    for (let i = 0; i < nbrLevels; i++) {
        let geom = new THREE.CylinderGeometry(radius, radius, height, nbrSides);
        let mat;
        if (!materials) {
            let matArgs = {transparent: true, opacity: opacity, color: getRandomColor()};
            mat = new THREE.MeshLambertMaterial(matArgs);
            mats.push(mat);
        } else {
            mat = mats[i];
        }
        let cyl = new THREE.Mesh(geom, mat);
        cyl.position.y = ypos;
        cyl.scale.set(sf, 1, sf);
        root.add(cyl);
        ypos += height;
        sf *= sfactor;
    }
    return root;
}

var controls = new function() {
    this.nbrLevels = 20;
    this.nbrSides = 8;
    this.opacity = 0.8;
    this.height = 0.5;
    this.scale = 0.9;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 1, 80).step(1).onChange(update);
    gui.add(controls, 'nbrSides', 3, 18).step(1).onChange(update);
    gui.add(controls, 'opacity', 0.0, 1.0).onChange(updateOpacity);
    gui.add(controls, 'height', 0.1, 0.8).onChange(update);
    gui.add(controls, 'scale', 0.7, 1).onChange(update);
}

function updateOpacity() {
    let opacity = controls.opacity;
    for (mat of mats)
        mat.opacity = opacity;
}

function update() {
    let nbrSides = controls.nbrSides;
    let height = controls.height;
    let scale = controls.scale;
    let opacity = controls.opacity;
    if (zig)
        scene.remove(zig);
    if (nbrLevels == controls.nbrLevels) {// use current materials mats
        zig = ziggurat(nbrLevels, nbrSides, height, scale, opacity, mats);
    } else {
        nbrLevels = controls.nbrLevels;
        zig = ziggurat(nbrLevels, nbrSides, height, scale, opacity);
    }
    // camera.position.set(0, 20, 20);
    // camera.lookAt(new THREE.Vector3(0, nbrLevels * height / 2, 0));
    // camera.updateProjectionMatrix();
    scene.add(zig);
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
	camera.position.set(0, 20, 20);
	camera.lookAt(new THREE.Vector3(0, 10, 0));

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
initGui();
animate();

