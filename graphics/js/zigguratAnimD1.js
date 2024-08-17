/***********
 * zigguratAnimD1.js
 * 
 * Xiuhcoatl XIII
 * August 2024
 ***********/



let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new Subject();

let zig, mats, nbrLevels, height, nbrSides, scale;




function createScene() {
    nbrLevels = 60;
    height = 0.1;
    nbrSides = 5;
    scale = 0.95;

    // NEW
    zig = ziggurat(nbrLevels, nbrSides, height, scale);
    moveChildren(zig, makeRandomYRotator(0.25, true));

    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(0, 0, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(zig);

    let circleGeom = new THREE.CircleGeometry(1.2, 24);
    let circleMat = new THREE.MeshBasicMaterial({color: 0x333333, side: THREE.DoubleSide});
    let circle = new THREE.Mesh(circleGeom, circleMat);
    circle.rotateX(Math.PI / 2.0);
    circle.position.y = -0.01;
    scene.add(circle);
}

let spinY = makeSpin(1);

// function moveChildren(root, f) {
//     let children = root.children
//     for (let i = 0; i < children.length; i++) {
//         let child = children[i];
//         child.update = f(child, i);
//         subject.register(child);
//     }
// }

function moveChildren(root, f) {
    let children = root.children;
    children.forEach(function (child, i, children) {
        child.update = f(child, i, children);
        subject.register(child);
    });
}


// rotate no faster than rps in CCW or both rotation 
function makeRandomYRotator(rps, ccw=false) {
    let lo = ccw ? 0 : -1;
    let spinY = makeSpin(1);
    function f(child) {
        child.rps = rps * getRandomFloat(lo, 1);
        return spinY;
    }
    return f;
}




function ziggurat(nbrLevels, nbrSides, height, sfactor, materials) {
    if (!materials) mats = [];
    let radius = 1.0;
    let ypos = height / 2.0;
    let sf = sfactor;
    root = new THREE.Object3D();
    for (let i = 0; i < nbrLevels; i++) {
        let geom = new THREE.CylinderGeometry(radius, radius, height, nbrSides);
        if (!materials) {
            let matArgs = {transparent: true, opacity: 0.8, color: getRandomColor()};
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


function update() {
    let delta = clock.getDelta();
    subject.notify(delta);
}

var controls = new function() {
    this.nbrSides = 5;
    this.scale = 0.95;
    this.rps = 0.25;
    this.ccw = true;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrSides', 3, 15).step(1).onChange(updateZig);
    gui.add(controls, 'scale', 0.7, 1).onChange(updateZig);
    gui.add(controls, 'rps', 0, 1).step(0.01).onChange(updateZig);
    gui.add(controls, 'ccw').onChange(updateZig);
}

function updateZig() {
   if ((nbrSides != controls.nbrSides) || (scale != controls.scale)) {
        nbrSides = controls.nbrSides;
        scale = controls.scale;
        scene.remove(zig);
        zig = ziggurat(nbrLevels, nbrSides, height, scale, mats);
        scene.add(zig);
    }
    let rps = controls.rps;
    let ccw = controls.ccw;
    // don't need this where we cannot register an object more than once
//    subject = new Subject();  // deregister children of previous zig
    moveChildren(zig, makeRandomYRotator(rps, ccw));
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
    renderer.setAnimationLoop( () => {
        update();
        renderer.render(scene, camera);
    });

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 12, 5);
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
initGui();
addToDOM();

