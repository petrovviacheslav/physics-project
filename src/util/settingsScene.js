import * as THREE from "three";
import {animate} from "./animate";
import {addBaseXYZ} from "./addsToScene";

export function default_scene(scene, renderer, camera){
    scene.rotation.x = -Math.PI / 2;
    scene.rotation.z = -Math.PI / 2;
    renderer.setSize(700, 600);
    let parent = document.querySelector(".render_place");
    if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
    parent.appendChild(renderer.domElement);

    // Добавление координатных осей
    scene.add(new THREE.AxesHelper(1));

    addBaseXYZ(scene, 10);

    camera.position.z = 4;
    camera.position.x = 3;
    camera.position.y = 3;

    animate(renderer, scene, camera);
}