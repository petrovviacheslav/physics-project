import * as THREE from "three";
import {addBaseXYZ} from "./addsToScene";
import {OrbitControls} from "three/addons";

// отрисовка сцены
export function animate(renderer2, scene2, camera2, flag) {
    const renderer = renderer2;
    const scene = scene2;
    const camera = camera2;
    const controls = new OrbitControls(camera, renderer.domElement);

    const gridHelper = new THREE.GridHelper(20, 4);
    scene.add(gridHelper);
    const gridHelperXY = new THREE.GridHelper(20, 4);
    gridHelperXY.rotation.x = Math.PI / 2; // Поворачиваем на 90 градусов вокруг оси X
    scene.add(gridHelperXY);
    const gridHelperYZ = new THREE.GridHelper(20, 4);
    gridHelperYZ.rotation.z = Math.PI / 2; // Поворачиваем на 90 градусов вокруг оси Z
    scene.add(gridHelperYZ);

    function animate2() {
        requestAnimationFrame(animate2);
        if (flag) controls.update();
        renderer.render(scene, camera);
    }

    animate2();
}

// создание сцены с базовыми настройками
export function default_scene(scene, renderer, camera) {
    scene.rotation.x = -Math.PI / 2;
    scene.rotation.z = -Math.PI / 2;
    renderer.setSize(700, 600);
    let parent = document.querySelector(".render_place");
    if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
    parent.appendChild(renderer.domElement);

    scene.add(new THREE.AxesHelper(1));
    addBaseXYZ(scene, 1.1);

    camera.position.z = 4;
    camera.position.x = 3;
    camera.position.y = 3;

    animate(renderer, scene, camera, true);
}

export function add_renderer_to_dom(child_elem) {
    let parent = document.querySelector(".render_place");
    if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
    parent.appendChild(child_elem);
}