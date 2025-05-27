import * as THREE from "three";
import { OrbitControls } from "three/addons";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// флаг добавления подписей делений, чтобы не дублировать
let labelsAdded = false;

// функция добавления подписей цен деления по осям
function addScaleLabels(scene, size = 20, divisions = 20) {
    const loader = new FontLoader();

    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const step = size / divisions;
        const half = size / 2;
        for (let i = -half; i <= half; i += step) {
            const labelText = i.toString();
            const textGeom = new TextGeometry(labelText, {
                font: font,
                size: 0.2,        // размер цифр
                depth: 0.02,
                curveSegments: 8,
                bevelEnabled: false,
            });
            const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // цифры на осях
            // X-ось
            let meshX = new THREE.Mesh(textGeom, textMat);
            meshX.position.set(i, 0, 0);
            meshX.lookAt(new THREE.Vector3(0, 0, 1));
            scene.add(meshX);

            // Y-ось
            let meshY = new THREE.Mesh(textGeom.clone(), textMat);
            meshY.position.set(0, i, 0);
            meshY.lookAt(new THREE.Vector3(0, 0, 1));
            scene.add(meshY);

            // Z-ось
            let meshZ = new THREE.Mesh(textGeom.clone(), textMat);
            meshZ.position.set(0, 0, i);
            meshZ.lookAt(new THREE.Vector3(0, 1, 0));
            scene.add(meshZ);
        }

        // Добавляем большие буквы X, Y, Z на концы сетки
        const axes = [
            { text: 'X', pos: new THREE.Vector3(half + step, 0, 0), look: new THREE.Vector3(0, 0, 1) },
            { text: 'Y', pos: new THREE.Vector3(0, half + step, 0), look: new THREE.Vector3(0, 0, 1) },
            { text: 'Z', pos: new THREE.Vector3(0, 0, half + step), look: new THREE.Vector3(0, 1, 0) }
        ];

        axes.forEach(({ text, pos, look }) => {
            const bigGeom = new TextGeometry(text, {
                font: font,
                size: 0.4,       // в два раза больше
                depth: 0.02,
                curveSegments: 8,
                bevelEnabled: false,
            });
            const bigMesh = new THREE.Mesh(bigGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
            bigMesh.position.copy(pos);
            bigMesh.lookAt(look);
            scene.add(bigMesh);
        });
    });
}

// отрисовка сцены
export function animate(renderer2, scene2, camera2, flag) {
    const renderer = renderer2;
    const scene = scene2;
    const camera = camera2;
    const controls = new OrbitControls(camera, renderer.domElement);

    const divisions = 20;
    const size = 20;
    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);

    const gridHelperXY = new THREE.GridHelper(size, divisions);
    gridHelperXY.rotation.x = Math.PI / 2;
    scene.add(gridHelperXY);

    const gridHelperYZ = new THREE.GridHelper(size, divisions);
    gridHelperYZ.rotation.z = Math.PI / 2;
    scene.add(gridHelperYZ);

    // добавляем подписи один раз
    if (!labelsAdded) {
        addScaleLabels(scene, size, divisions);
        labelsAdded = true;
    }

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

    camera.position.set(3, 3, 4);

    animate(renderer, scene, camera, true);
}

export function add_renderer_to_dom(child_elem) {
    let parent = document.querySelector(".render_place");
    if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
    parent.appendChild(child_elem);
}



