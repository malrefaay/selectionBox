import * as THREE from 'three';
import { CustomSelectionBox } from './CustomSelectionBox';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper';
let container;
let camera, scene, renderer;
init();
animate();
function init() {
    container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.z = 50;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    scene.add(new THREE.AmbientLight(0xaaaaaa));
    const light = new THREE.SpotLight(0xffffff, 10000);
    light.position.set(0, 25, 50);
    light.angle = Math.PI / 5;
    light.castShadow = true;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 100;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add(light);
    GenerateRandomCubes(10);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function GenerateRandomCubes(count) {
    const geometry = new THREE.BoxGeometry();

    for (let i = 0; i < count; i++) {
        const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
        object.position.x = Math.random() * 80 - 40;
        object.position.y = Math.random() * 45 - 25;
        object.position.z = Math.random() * 45 - 25;
        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;
        object.castShadow = true;
        object.receiveShadow = true;
        scene.add(object);
    }
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    renderer.render(scene, camera);
}
const selectionBox = new CustomSelectionBox(camera, scene);
const helper = new SelectionHelper(renderer, 'selectBoxRightToLeft');
document.addEventListener('pointerdown', function (event) {
    for (const item of selectionBox.collection) {
        //@ts-ignore
        item.material.emissive.set(0x000000);
    }
    selectionBox.startPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        - (event.clientY / window.innerHeight) * 2 + 1,
        0.5);
});
document.addEventListener('pointermove', function (event) {
    if (helper.isDown) {
        for (let i = 0; i < selectionBox.collection.length; i++) {
            //@ts-ignore
            selectionBox.collection[i].material.emissive.set(0x000000);
        }
        selectionBox.endPoint.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5);
        const isRightToLeftSelection = (selectionBox.endPoint.x > selectionBox.startPoint.x);
        const allSelected = GetAllSelected(isRightToLeftSelection);
        for (let i = 0; i < allSelected.length; i++) {
            //@ts-ignore
            allSelected[i].material.emissive.set(0xffffff);
        }
    }
});
document.addEventListener('pointerup', function (event) {
    selectionBox.endPoint.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        - (event.clientY / window.innerHeight) * 2 + 1,
        0.5);
    const isRightToLeftSelection = (selectionBox.endPoint.x > selectionBox.startPoint.x);
    const allSelected = GetAllSelected(isRightToLeftSelection);
    for (let i = 0; i < allSelected.length; i++) {
        //@ts-ignore
        allSelected[i].material.emissive.set(0xffffff);
    }
});
function GetAllSelected(rightToLeftSelection) {
    if (rightToLeftSelection) {
        helper.element.classList.add("selectBoxRightToLeft");
        helper.element.classList.remove("selectBoxLeftToRight");
    } else {
        helper.element.classList.remove("selectBoxRightToLeft");
        helper.element.classList.add("selectBoxLeftToRight");
    }
    return selectionBox.select(undefined, undefined, rightToLeftSelection)
}