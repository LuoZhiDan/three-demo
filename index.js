// import textureImg from './UV_Grid_Sm.jpg';
// import textureImg from './bg.jpg';
// import textureImg from './1.png';
import textureImg from './blockTexture.png';

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
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(0, 700, 600);
    scene.add( camera );
    var light = new THREE.PointLight(0xffffff, 0.8);
    camera.add( light );
    group = new THREE.Group();
    // group.position.y = 50;
    scene.add(group);
    var loader = new THREE.TextureLoader();
    var texture = loader.load( textureImg ) ;
    // it's necessary to apply these settings in order to correctly display the texture on a shape geometry
    // texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1/1024, 1/1024);
    texture.rotation = Math.PI/2
    texture.center.set(0, 1)

    var axesHelper = new THREE.AxesHelper( 500 );
    // scene.add( axesHelper );

    function addShape(mapObj, shape, extrudeSettings, color) {
        var points = shape.getPoints();
        // var len = Math.floor(shape[0].getLength()/2.4)

        // points = shape[0].getSpacedPoints(len);
        // points.reverse();
        // var path = new THREE.Shape();
        // path.setFromPoints(points)
        // shape = path;
        // var geometry = new THREE.ShapeBufferGeometry( shape );

        // var position = geometry.getAttribute('position');
        // var array = position.array;
        // var count  = position.count;
        
        // var newArr = [];
        // for(let i = 0; i< count; i++){
        //     var ind = i * 3;
        //     newArr.push(array [ind] );
        //     newArr.push(array [ind + 2] );
        //     newArr.push(array [ind + 1] );
        // }

        // position.setArray(new Float32Array(newArr))


        var vertices = [], uv = [],
        faces = THREE.ShapeUtils.triangulateShape(points, [] ),
        indexs = [];

        points.map(item=>{
            uv.push(item.y, item.x);
            vertices.push(item.x, 0, item.y);
        });

        faces.map(item=>{
            indexs.push(item[0], item[1], item[2]);
        });

        var geometry = new THREE.BufferGeometry( );

        geometry.setIndex(indexs);
        geometry.addAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));


        // if(THREE.ShapeUtils.isClockWise( geometry.vertices )){
        //     geometry.vertices.reverse();
        // }
        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            side: THREE.BackSide, 
            depthTest: false,
            transparent: true,
            map: texture 
        }));

        mesh.translateY(0.1)
        mapObj.add (mesh );

        var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
            color: 0x61E9F8,
            side: THREE.BackSide, 
            depthTest: false,
            transparent: true,
            opacity: 0,
            // map: texture 
        }));
        mesh.translateY(-20)
        mapObj.add (mesh );


        /* var geometryPoints = new THREE.BufferGeometry();
        geometryPoints.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        var line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ 
            color: color,
            depthTest: false,
            transparent: true
        }));
        line.translateY(0.2)
        mapObj.add (line ); */

        var geometry = new THREE.LineGeometry();
        geometry.setPositions( vertices );
        // geometry.setColors( colors );
        var matLine = new THREE.LineMaterial( {
            color: 0xff00ff,
            linewidth: 0.5/1024, // in pixels
            transparent: true,
            depthTest: false,
            // vertexColors: THREE.VertexColors,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        var line = new THREE.Line2( geometry, matLine );
        // line.computeLineDistances();
        // line.scale.set( 1, 1, 1 );
        line.translateY(0.2)
        mapObj.add( line );


        
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

        var material01 = new THREE.MeshBasicMaterial({ 
            color: 0x61E9F8,
            depthTest: true,
            opacity: 0,
            transparent: true
        });

        var material02 = new THREE.MeshBasicMaterial({ 
            color: 0x61E9F8,
            depthTest: true,
            transparent: true,
            opacity: 0.4
            // map: texture 
        });

        var mesh = new THREE.Mesh(geometry, [material01, material02] );
        
        // mesh.position.set(center.x, center.y, center.z);
        mesh.rotation.set(Math.PI/2, 0, 0);
        // mesh.scale.set(s, s, s);
        mapObj.add( mesh );

        // addLineShape(mapObj, shape, color, x, y, z, rx, ry, rz, s);
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

        group.add( line );

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

    store.map(function( item ){
        addShape(mapObj, item.shape, extrudeSettings, 0x00f000, -500, 300, 0, Math.PI, 0, 0, 1);
    });

    // mapObj.rotation.set(Math.PI, 0, 0);
    mapObj.position.set(-1024 * 0.5, 0, -1024 * 0.5);
    // mapObj.scale.set(2, 1, 2);
    
    // mapObj.position.set(-512 * 1, 0, -512 * 1);
    // mapObj.scale.set(2, 1, 2);

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