/***********
 * cantor3B.js
 * 
 * See paper on 3D Koch in stuff folder
 * Xiuhcoatl XIII
 * August 2024
 ***********/



let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let koch;
let len = 1;
let mat;

function createScene() {
    let nbrLevels = controls.nbrLevels;
    let color = new THREE.Color(controls.color);
    let opacity = controls.opacity;
    let matArgs = {color: color, transparent: true, opacity: opacity, side: THREE.FrontSide};
    mat = new THREE.MeshLambertMaterial(matArgs);
    koch = makeKoch3(nbrLevels, 1.0, mat, len);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 40, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 0.2, 1000 );
    light2.position.set(0, -40, -40);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(koch);

    // let axes = new THREE.AxesHelper(10);
    // scene.add(axes);
}


function makeKoch3(levels, offset, mat, height=2) {
    // a tricone whose base side is b = (3/2)*height
    // hence outer radius = b/sqrt(3) = sqrt(3) * height / 2
    let radius = Math.sqrt(3) * height / 2;
    if (levels == 0) {
        let geom = createTriCone(height, radius);
        let mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }
    else {
        let koch = makeKoch3(levels-1, offset, mat, len);
        let root = new THREE.Object3D();
        // TRS: rotate around x-axis, and then scale by 2/3
        root.rotation.x = -Math.PI / 2;
        root.scale.set(2/3, 2/3, 2/3);
        for (c of [0, 2 * Math.PI / 3, 4 * Math.PI / 3]) {
            let child = new THREE.Object3D();
            child.rotation.z = c;
            let clone = koch.clone();
            clone.position.x = offset * radius / 2; // offset=1 for standard fractal
            child.add(clone);
            root.add(child);
        }
        return root;
    }
}

function createTriCone(height, radius) {
    let h2 = height / 2;
    let geom = new THREE.Geometry();
    // top and bottom vertices
    geom.vertices.push(new THREE.Vector3(0, h2, 0));
    geom.vertices.push(new THREE.Vector3(0, -h2, 0));
    //  the vertices of the center triangle
    let inc = 2 * Math.PI / 3;
    for (let i = 0, a = 0; i < 3; i++, a += inc) {
        let cos = Math.cos(a);
        let sin = Math.sin(a);
        geom.vertices.push(new THREE.Vector3(radius * cos, 0, radius * sin));
    }
    let faces = [[0,3,2], [0,4,3], [0,2,4], [1,2,3], [1,3,4], [1,4,2]];
    geom.faces.push(...faces.map(a => {return new THREE.Face3(...a)}));
    geom.computeFaceNormals();
    return geom;
}



var controls = new function() {
    this.nbrLevels = 2;
    this.opacity = 1.0;
    this.color = '#3366ff';
    this.offset = 1.0;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, 10).step(1).onChange(update);
    gui.add(controls, 'opacity', 0.1, 1.0).step(0.1);
    gui.add(controls, 'offset', 0.5, 1.5).step(0.1).onChange(update);
    gui.addColor(controls, 'color');
}

function update() {
    if (koch)
        scene.remove(koch);
    koch = makeKoch3(controls.nbrLevels, controls.offset, mat, len);    
    scene.add(koch);
}



function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    mat.color = new THREE.Color(controls.color);
    mat.opacity = controls.opacity;
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
    renderer.setAnimationLoop(function () {
        render();
    });

    camera = new THREE.PerspectiveCamera(45, canvasRatio, 0.01, 1000);
    camera.position.set(-3, 0, 0);
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


