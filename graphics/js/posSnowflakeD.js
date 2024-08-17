/***********
 * posSnowflakeD.js
 * 
 * Xiuhcoatl XIII
 * August 2024
 ***********/



let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let base, snowflake;
let len = 1;
let mat;
let boxGeom, sphereGeom, octahedronGeom;

function createScene() {
    let nbrLevels = controls.nbrLevels;
    let color = new THREE.Color(controls.color);
    let opacity = controls.opacity;
    let matArgs = {color: color, transparent: true, opacity: opacity, side: THREE.DoubleSide};

    mat = new THREE.MeshLambertMaterial(matArgs);
    boxGeom = new THREE.BoxGeometry(len, len, len);
    sphereGeom = new THREE.SphereGeometry(len/2, 12, 12);
    octahedronGeom = new THREE.OctahedronGeometry(len/2);
    base = new THREE.Mesh(boxGeom, mat);
    snowflake = makePosSnowflake(nbrLevels, 1.0, base, len);
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


function makePosSnowflake(level, offset, mesh, len=1) {
    let base = mesh.clone();
    if (level > 0) {
        let root1 = new THREE.Object3D();
        root1.scale.set(0.5, 0.5, 0.5);
        base.add(root1);
        let sf = makePosSnowflake(level-1, offset, mesh, len);
        sf.position.y = offset * 1.5 * len;
        root1.add(sf);
        for (let i = 0; i < 4; i++) {
            let root2 = new THREE.Object3D();
            root2.rotation.x = Math.PI / 2;
            root2.rotation.z = i * Math.PI / 2;
            root1.add(root2);
            let sf = makePosSnowflake(level-1, offset, mesh, len);
            sf.position.y = offset * 1.5 * len;
            root2.add(sf);
        }
    }
    return base;
}

function makeSixfoldSnowflake(level, offset, mesh, len, center) {
    let base = null
    if (center)
        base = mesh.clone();
    else
        base = new THREE.Object3D();
    let root = new THREE.Object3D();
    root.scale.set(0.5, 0.5, 0.5);
    base.add(root);
    let sf = makePosSnowflake(level, offset, mesh, len);
    sf.position.y = offset * 1.5 * len;
    root.add(sf);
    let root2 = new THREE.Object3D();
    root2.rotation.x = Math.PI;
    root.add(root2);
    sf = makePosSnowflake(level, offset, mesh, len);
    sf.position.y = offset * 1.5 * len;
    root2.add(sf);
    for (let i = 0; i < 4; i++) {
        let root3 = new THREE.Object3D();
        root3.rotation.x = Math.PI / 2;
        root3.rotation.z = i * Math.PI / 2;
        root.add(root3);
        let sf = makePosSnowflake(level, offset, mesh, len);
        sf.position.y = offset * 1.5 * len;
        root3.add(sf);        
    }
    return base;
}




var controls = new function() {
    this.nbrLevels = 2;
    this.offset = 1.0;
    this.shape = 'Box';
    this.awesome = false;
    this.center = true;
    this.opacity = 1.0;
    this.color = '#3366ff';
}

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, 5).name('level').step(1).onChange(update);
    gui.add(controls, 'offset', 0.5, 1.5).step(0.1).onChange(update);
    let objectTypes =  ['Box', 'Sphere', 'Octahedron'];
    let typeItem = gui.add(controls, 'shape', objectTypes);
    typeItem.onChange(update);
    gui.add(controls, 'awesome').onChange(update);
    gui.add(controls, 'center').onChange(update);
    let f1 = gui.addFolder('Apperance');
    f1.open();
    f1.addColor(controls, 'color');
    f1.add(controls, 'opacity', 0.1, 1.0).step(0.1);
}


function update() {
    if (snowflake)
        scene.remove(snowflake);
    let geom = null;
    switch (controls.shape) {
        case 'Sphere':  geom = sphereGeom;
                        base.material.side = THREE.FrontSide;
                        break;
        case 'Box':   geom = boxGeom;
                        base.material.side = THREE.DoubleSide;
                        break;
        case 'Octahedron': geom = octahedronGeom;
                        base.material.side = THREE.DoubleSide;
                        break;
    }
    base.geometry = geom;
    if (controls.awesome)
        snowflake = makeSixfoldSnowflake(controls.nbrLevels, controls.offset, base, len, controls.center);
    else 
        snowflake = makePosSnowflake(controls.nbrLevels, controls.offset, base, len);  
    scene.add(snowflake);
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


