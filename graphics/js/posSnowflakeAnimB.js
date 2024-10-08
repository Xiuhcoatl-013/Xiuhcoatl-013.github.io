/***********
 * posSnowflakeAnimB.js
 * 
 * Xiuhcoatl XIII
 * August 2024
 ***********/



let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let base, snowflake;
let len = 1;
let boxGeom, sphereGeom, octahedronGeom;

let maxLevels = 5;
let materials;

let subject = new Subject();

function createScene() {
    let nbrLevels = controls.nbrLevels;
    let color = new THREE.Color(controls.color);
    let opacity = controls.opacity;
    let matArgs = {color: color, transparent: true, opacity: opacity, side: THREE.DoubleSide};
    // per level material; materials[maxLevels+1] is for awesome center base
    materials = [];
    for (let i = 0; i <= maxLevels+1; i++)
        materials.push(new THREE.MeshLambertMaterial(matArgs));

    mat = new THREE.MeshLambertMaterial(matArgs);
    boxGeom = new THREE.BoxGeometry(len, len, len);
    sphereGeom = new THREE.SphereGeometry(len/2, 12, 12);
    octahedronGeom = new THREE.OctahedronGeometry(len/2);
    snowflake = makePosSnowflake(nbrLevels, 1.0, boxGeom, len);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(10, 20, 20);
    let light2 = new THREE.PointLight(0xFFFFFF, 0.2, 1000 );
    light2.position.set(10, 20, -20);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(snowflake);
}


function makePosSnowflake(level, offset, geom, len=1) {
    let base = new THREE.Mesh(geom, materials[level]);
    base.update = spin;      // for animation
    subject.register(base);
    if (level > 0) {
        let root1 = new THREE.Object3D();
        root1.scale.set(0.5, 0.5, 0.5);
        base.add(root1);
        let sf = makePosSnowflake(level-1, offset, geom, len);
        sf.position.y = offset * 1.5 * len;
        root1.add(sf);
        for (let i = 0; i < 4; i++) {
            let root2 = new THREE.Object3D();
            root2.rotation.x = Math.PI / 2;
            root2.rotation.z = i * Math.PI / 2;
            root1.add(root2);
            let sf = makePosSnowflake(level-1, offset, geom, len);
            sf.position.y = offset * 1.5 * len;
            root2.add(sf);
        }
    }
    return base;
}

function spin(delta) {
    this.rotation.y += rpsToRadians(controls.rps, delta);
    this.rotation.y %= 2 * Math.PI;
}


function makeSixfoldSnowflake(level, offset, geom, len, center) {
    let base = null
    if (center)
        base = new THREE.Mesh(geom, materials[level+1]);
    else
        base = new THREE.Object3D();
    let root = new THREE.Object3D();
    root.scale.set(0.5, 0.5, 0.5);
    base.add(root);
    let sf = makePosSnowflake(level, offset, geom, len);
    sf.position.y = offset * 1.5 * len;
    root.add(sf);
    let root2 = new THREE.Object3D();
    root2.rotation.x = Math.PI;
    root.add(root2);
    sf = makePosSnowflake(level, offset, geom, len);
    sf.position.y = offset * 1.5 * len;
    root2.add(sf);
    for (let i = 0; i < 4; i++) {
        let root3 = new THREE.Object3D();
        root3.rotation.x = Math.PI / 2;
        root3.rotation.z = i * Math.PI / 2;
        root.add(root3);
        let sf = makePosSnowflake(level, offset, geom, len);
        sf.position.y = offset * 1.5 * len;
        root3.add(sf);        
    }
    return base;
}




var controls = new function() {
    this.nbrLevels = 2;
    this.opacity = 1.0;
    this.color = '#3366ff';
    this.offset = 1.0;
    this.shape = 'Box';
    this.awesome = false;
    this.center = true;
    this.rps = 0.1;
    this.randomColors = false;
    this.Randomize = genRandomColors;
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, maxLevels).name('level').step(1).onChange(update);
    gui.add(controls, 'offset', 0.5, 1.5).step(0.1).onChange(update);
    let objectTypes =  ['Box', 'Sphere', 'Octahedron'];
    let typeItem = gui.add(controls, 'shape', objectTypes);
    typeItem.onChange(update);
    gui.add(controls, 'awesome').onChange(update);
    gui.add(controls, 'center').onChange(update);
    gui.add(controls, 'rps', -0.5, 0.5).step(0.01);
    let f1 = gui.addFolder('Apperance');
    f1.open();
    f1.addColor(controls, 'color');
    f1.add(controls, 'opacity', 0.1, 1.0).step(0.1).onChange(function () {
        for (let mat of materials)
            mat.opacity = controls.opacity;
    });
    f1.add(controls, 'randomColors').onChange(genColors);
    f1.add(controls, 'Randomize');
}

function genColors(flag) {
    if (flag) {
        genRandomColors();
    } else {
        let color = new THREE.Color(controls.color);
        let opacity = controls.opacity;
        for (let mat of materials) {
            mat.color = color;
            mat.opacity = opacity
        }
    }
}

function genRandomColors() {
    if (controls.randomColors)
        for (let mat of materials) 
            mat.color = getRandomColor(0.5, 0.4, 0.6);
}


function update() {
    if (snowflake)
        scene.remove(snowflake);
    let geom = null;
    let side = null;
    switch (controls.shape) {
        case 'Sphere':  geom = sphereGeom;
                        side = THREE.FrontSide;
                        break;
        case 'Box':   geom = boxGeom;
                        side = THREE.DoubleSide;
                        break;
        case 'Octahedron': geom = octahedronGeom;
                        side = THREE.DoubleSide;
                        break;
    }
    for (let mat in materials)
        mat.side = side;
    if (controls.awesome)
        snowflake = makeSixfoldSnowflake(controls.nbrLevels, controls.offset, geom, len, controls.center);
    else 
        snowflake = makePosSnowflake(controls.nbrLevels, controls.offset, geom, len);  
    scene.add(snowflake);
}

// last color assigned by color controller
let lastColor = null;

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    if ((lastColor !== controls.color) && !controls.randomColors) {
        let color = new THREE.Color(controls.color);
        for (let mat of materials)
            mat.color = color;
        lastColor = controls.color;
    }
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
        let delta = clock.getDelta();
        subject.notify(delta);
        render();
    });

    camera = new THREE.PerspectiveCamera(45, canvasRatio, 0.01, 1000);
    camera.position.set(0, 1, 6);
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


