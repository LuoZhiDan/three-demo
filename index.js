import textureImg from './UV_Grid_Sm.jpg';

import Model from './ModelClass';
import geojson from './510000.json';

var container, controls;
var camera, scene, renderer;
var group;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.set(0, 0, 500);
    scene.add(camera);
    var light = new THREE.PointLight(0xffffff, 0.8);
    camera.add(light);
    group = new THREE.Group();
    group.position.y = 50;
    scene.add(group);
    var loader = new THREE.TextureLoader();
    var texture = loader.load(textureImg);
    // it's necessary to apply these settings in order to correctly display the texture on a shape geometry
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.008, 0.008);

    var axesHelper = new THREE.AxesHelper( 500 );
	scene.add( axesHelper );

    function addShape(mapObj, shape, extrudeSettings, color, x, y, z, rx, ry, rz, s) {
        var geometry = new THREE.ShapeBufferGeometry( shape );
        var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, map: texture }));
        mesh.position.set(x, y, z);
        mesh.rotation.set(rx, ry, rz);
        mesh.scale.set(s, s, s);
        mapObj.add (mesh );
        
        // flat shape
        var geometry = new THREE.ShapeBufferGeometry(shape);
        var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide }));
        mesh.position.set(x, y, z - 125);
        // mesh.rotation.set(rx, ry, rz);
        mesh.scale.set(s, s, s);
        // group.add(mesh);
        // extruded shape
        var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: color }));
        mesh.position.set(x, y, z - 2);
        mesh.rotation.set(rx, ry, rz);
        mesh.scale.set(s, s, s);
        mapObj.add(mesh);
        addLineShape(shape, color, x, y, z, rx, ry, rz, s);
    }

    function addLineShape(shape, color, x, y, z, rx, ry, rz, s) {
        // lines
        shape.autoClose = true;
        var points = shape.getPoints();
        var spacedPoints = shape.getSpacedPoints(50);
        var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
        var geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints(spacedPoints);
        // solid line
        var line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: color }));
        line.position.set(x, y, z);
        line.rotation.set(rx, ry, rz);
        line.scale.set(s, s, s);
        mapObj.add(line);
        // line from equidistance sampled points
        var line = new THREE.Line(geometrySpacedPoints, new THREE.LineBasicMaterial({ color: color }));
        line.position.set(x, y, z + 25);
        line.rotation.set(rx, ry, rz);
        line.scale.set(s, s, s);
        // mapObj.add(line);
        // vertices from real points
        var particles = new THREE.Points(geometryPoints, new THREE.PointsMaterial({ color: color, size: 4 }));
        particles.position.set(x, y, z + 75);
        particles.rotation.set(rx, ry, rz);
        particles.scale.set(s, s, s);
        // mapObj.add(particles);
        // equidistance sampled points
        var particles = new THREE.Points(geometrySpacedPoints, new THREE.PointsMaterial({ color: color, size: 4 }));
        particles.position.set(x, y, z + 125);
        particles.rotation.set(rx, ry, rz);
        particles.scale.set(s, s, s);
        // mapObj.add(particles);
    }

    var model = new Model({
        geojson: geojson
    });

    var store = model.getStore();
    var mapObj = new THREE.Object3D();
    var extrudeSettings = { depth: 18, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    store.map(function( item,i ){
        addShape(mapObj, item.shape, extrudeSettings, 0x00f000, -500, 300, 0, Math.PI, 0, 0, 1);
    });

    scene.add( mapObj )
    


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    // document.addEventListener('mousedown', onDocumentMouseDown, false);
    // document.addEventListener('touchstart', onDocumentTouchStart, false);
    // document.addEventListener('touchmove', onDocumentTouchMove, false);
    // //
    window.addEventListener('resize', onWindowResize, false);
    controls = new THREE.OrbitControls(camera, renderer.domElement);// 创建控制器
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
//
function onDocumentMouseDown(event) {
    event.preventDefault();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);
    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;
}
function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
}
function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}
function onDocumentMouseOut() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}
function onDocumentTouchStart(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;
    }
}
function onDocumentTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;
    }
}
//
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    // group.rotation.y += (targetRotation - group.rotation.y) * 0.05;
    renderer.render(scene, camera);
}