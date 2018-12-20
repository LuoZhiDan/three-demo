import textureImg from './UV_Grid_Sm.jpg';

import Model from './ModelClass';
import geojson from './500000.json';

var container, controls, center;
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
    scene.background = new THREE.Color(0x000);
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000);
    camera.position.set(0, 0, 500);
    scene.add(camera);
    var light = new THREE.PointLight(0xffffff, 0.8);
    camera.add(light);
    group = new THREE.Group();
    group.position.y = 50;
    scene.add(group);
    var loader = new THREE.TextureLoader();
    var texture = loader.load( textureImg ) ;
    // it's necessary to apply these settings in order to correctly display the texture on a shape geometry
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(0.001, 0.001);
    // texture.rotation = Math.PI
    // texture.offset.set(1, 1)

    var axesHelper = new THREE.AxesHelper( 500 );
    // scene.add( axesHelper );

    function addShape(mapObj, shape, extrudeSettings, color, x, y, z, rx, ry, rz, s) {
        var points = shape.getPoints();
        var geometry = new THREE.Geometry().setFromPoints(points);
        geometry.computeFaceNormals ()
        console.log(geometry)
        // if(THREE.ShapeUtils.isClockWise( geometry.vertices )){
        //     geometry.vertices.reverse();
        // }
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide, 
            depthTest: false,
            transparent: true,
            map: texture 
        }));
        mesh.translateZ(-2)
        mapObj.add (mesh );

        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
            side: THREE.DoubleSide, 
            depthTest: false,
            transparent: true,
            map: texture 
        }));
        mesh.translateZ(20)
        mapObj.add (mesh );
        
        // flat shape
        var geometry = new THREE.ShapeBufferGeometry(shape);
        var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ 
            color: color, 
            side: THREE.DoubleSide 
        }));
        // mesh.position.set(x, y, z - 125);
        // mesh.rotation.set(rx, ry, rz);
        // mesh.scale.set(s, s, s);
        // group.add(mesh);
        // extruded shape
        var geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        geometry.computeBoundingSphere();

        var material01 = new THREE.MeshPhongMaterial({ 
            color: 0x61E9F8,
            depthTest: true,
            opacity: 0,
            transparent: true
        });

        var material02 = new THREE.MeshPhongMaterial({ 
            color: 0x61E9F8,
            depthTest: true,
            transparent: true,
            opacity: 0.8
            // map: texture 
        });

        var mesh = new THREE.Mesh(geometry, [material01, material02] );
        
        // mesh.position.set(center.x, center.y, center.z);
        // mesh.rotation.set(rx, ry, rz);
        // mesh.scale.set(s, s, s);
        mapObj.add( mesh );

        addLineShape(mapObj, shape, color, x, y, z, rx, ry, rz, s);
    }

    function addLineShape(group, shape, color, x, y, z, rx, ry, rz, s) {
        // lines
        shape.autoClose = true;
        var points = shape.getPoints();
        var spacedPoints = shape.getSpacedPoints(50);
        var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
        var geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints(spacedPoints);
        // solid line
        var line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ 
            color: color,
            depthTest: true,
            transparent: true
        }));
        // line.position.set(x, y, z);
        // line.rotation.set(rx, ry, rz);
        // line.scale.set(s, s, s);
        line.translateZ(-2)

        group.add(line);

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
    
    var geo = new THREE.Geometry();
    store.map(function( item, i ){
        var geometry = new THREE.ShapeGeometry(item.shape);
        geo.merge( geometry );
    });
    // geo.mergeVertices();
    var obj = new THREE.Object3D();

    function merge( geo ) {
        console.time()
        geo.computeBoundingSphere ();
        var cp = geo.boundingSphere.center;
        var r = geo.boundingSphere.radius;
        var vertices = geo.vertices;
        var verticeMap = {};
        var precisionPoints = 4;
        var key;
        var precision = Math.pow( 10, precisionPoints );
        var unique = [];

        for(var i = 0, il = vertices.length; i < il; i++){
            var v = vertices[i];
            key = Math.round( v.x * precision ) + '_' + Math.round( v.y * precision ) + '_' + Math.round( v.z * precision );
            if(verticeMap[key] === undefined){
                verticeMap[key] = 1;
                unique.push( v );
            } else {
                verticeMap[key]++;
            }
        }

        var  newUnique = [];
        var last = null;
        for(var i = 0, il = unique.length; i < il; i++){
            var v = unique[i];
            key = Math.round( v.x * precision ) + '_' + Math.round( v.y * precision ) + '_' + Math.round( v.z * precision );
            var key2;
            var v2 = unique[i + 1];
            if(v2) {
                key2 = Math.round( v2.x * precision ) + '_' + Math.round( v2.y * precision ) + '_' + Math.round( v2.z * precision );
            }
            
            if(verticeMap[key] === 1){
                newUnique.push( v );
            }
            
            last = key;
        }
        geo.vertices = newUnique;
    }

    merge( geo )


    function drawLine( geo ) {
        var vertices = geo.vertices;
        var vers = [];
        for (let i = 0, il = vertices.length; i<il - 1; i++){
            var v1 = vertices[i], v2 = vertices[i + 1];
            
            var l = Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
            if(l > 30){
                var g = new THREE.Geometry();
                g.vertices = vers
                var Line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xff0000 }));
                obj.add( Line );
                vers = [];
            } else{
                vers.push(v1);
            }
           
        }

        var g = new THREE.Geometry();
        g.vertices = vers
        var Line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        obj.add( Line );
        
    }

    // function drawLine( geo ) {
    //     var vertices = geo.vertices;
    //     var g = new THREE.Geometry();
    //     g.vertices = vertices
    //     var Line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xff0000 }));
    //     obj.add( Line );
        
    // }

    drawLine( geo );

    obj.scale.set(0.6, 0.6, 1);
    obj.rotation.set(Math.PI, 0, 0);
    obj.position.set(- 507 * 0.6, 506 * 0.6, 0);

    // scene.add( obj );

    store.map(function( item ){
        addShape(mapObj, item.shape, extrudeSettings, 0x00f000, -500, 300, 0, Math.PI, 0, 0, 1);
    });

    mapObj.scale.set(0.6, 0.6, 1);
    // mapObj.rotation.set(Math.PI, 0, 0);
    mapObj.position.set(0, -1024 * 0.6, 0);
    

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