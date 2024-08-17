/***********
 * moveZigguratC4.js
 * 
 * Xiuhcoatl XIII
 * August 2024
 ***********/



let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new Subject();

let nbrSides = 6, scale = 0.96;
let zig, mats, nbrLevels, height;

function sequence(...fncs) {
    return function(delta) { fncs.forEach(g => g.call(this, delta)) };
}


function moveChildren(root, ...fncs) {
    let children = root.children;
    children.forEach(function (child, i, children) {
        let animFncs = fncs.map(g => g(child, i, children));
        child.update = sequence(...animFncs);
        subject.register(child);
    });
}


function makeArithYRotator(rpsA, rpsB) {
    let spinY = makeSpin(1);
    function f(child, i) {
        child.rps = rpsA + rpsB * i;
        return spinY;
    }
    return f;
}

function makeUpliftAnimator(ppsA, ppsB, hi) {
    function f(child, i) {
        child.pps = ppsA + ppsB * i;
        child.dir = 1;
        return function(delta) {
            let chdir = controls.sticky ? 1 : -1;
            this.position.y += this.dir * this.pps * delta;
            if (this.position.y > hi) {
                this.position.y = hi - (this.position.y % hi)
                this.dir *= chdir;
            }
            if (this.position.y < 0) {
                this.position.y *= -1;
                this.dir *= chdir;
            }
        }
    }
    return f;
}

function makeColorAnimator(rate, saturation=1.0, lightness=0.5) {
    function f(child, i, children) {
        child.crate = rate;
        child.cval = i / children.length;
        return function (delta) {
            this.cval += delta * this.crate;
            this.cval = mod(this.cval, 1);
            this.material.color.setHSL(this.cval, saturation, lightness);
        }
    }
    return f;
}




function createScene() {
    nbrLevels = 60;
    height = 0.1;

    zig = ziggurat(nbrLevels, nbrSides, height, scale);
    moveChildren(zig, makeArithYRotator(0.01, 0.02), makeColorAnimator(-0.1), makeUpliftAnimator(0.001, 0.001, 6));

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
    let circleMat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.6, color: 0x333333, side: THREE.DoubleSide});
    let circle = new THREE.Mesh(circleGeom, circleMat);
    circle.rotateX(Math.PI / 2.0);
    circle.position.y = -0.01;
    scene.add(circle);
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
    this.rpsA = 0.01;
    this.rpsB = 0.01;
    this.rotation = true;
    this.colorRate = -0.1;
    this.saturation = 1.0;
    this.opacity = 0.8;
    this.color = true;
    this.hi = 6;
    this.ppsA = 0.002;
    this.ppsB = 0.002;
    this.sticky = false;
    this.uplift = true;
}

function initGui() {
    let gui = new dat.GUI();
    let f1 = gui.addFolder('Rotation');
    f1.add(controls, 'rpsA', -1, 1).step(0.01).onChange(updateZig);
    f1.add(controls, 'rpsB', -0.1, 0.1).step(0.01).onChange(updateZig);
    f1.add(controls, 'rotation').name('do rotation').onChange(updateZig);
    let f2 = gui.addFolder('Color');
    f2.add(controls, 'colorRate', -1.0, 1.0).step(0.1).name('color rate').onChange(updateZig);
    f2.add(controls, 'saturation', 0.0, 1.0).step(0.1).name('saturation').onChange(updateZig);
    f2.add(controls, 'opacity', 0.1, 1.0).step(0.1).name('opacity').onChange(updateOpacity);
    f2.add(controls, 'color').name('do color').onChange(updateZig);
    let f3 = gui.addFolder('Uplift');
    f3.add(controls, 'hi', 6, 9).step(1).onChange(updateZig);
    f3.add(controls, 'ppsA', -0.02, 0.02).step(0.002).onChange(updateZig);
    f3.add(controls, 'ppsB', -0.02, 0.02).step(0.002).onChange(updateZig);
    f3.add(controls, 'sticky').onChange(updateZig);
    f3.add(controls, 'uplift').name('do uplift').onChange(updateZig);
}


function updateOpacity() {
    let opacity = controls.opacity;
    zig.children.forEach (function (c) {
        let mat = c.material;
        mat.opacity = opacity;
    })
}

function updateZig() {
    let rpsA = controls.rpsA;
    let rpsB = controls.rpsB;
    let colorRate = controls.colorRate;
    let saturation = controls.saturation;
    let ppsA = controls.ppsA;
    let ppsB = controls.ppsB;
    let hi = controls.hi;
    let sticky = controls.sticky ? 1 : -1;
    // booleans
    let doRotation = controls.rotation;
    let doColor = controls.color;
    let doUplift = controls.uplift;
    let animFncs = [];
    if (doRotation) animFncs.push(makeArithYRotator(rpsA, rpsB));
    if (doColor) animFncs.push(makeColorAnimator(colorRate, saturation));
    if (doUplift) animFncs.push(makeUpliftAnimator(ppsA, ppsB, hi));
    moveChildren(zig, ...animFncs);
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
    camera.position.set(0, 3, 12);
    camera.lookAt(new THREE.Vector3(0, 3, 0));
    camera.updateProjectionMatrix();

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 3, 0);
    cameraControls.update();
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

