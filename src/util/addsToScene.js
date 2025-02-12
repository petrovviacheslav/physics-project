import * as THREE from "three";
import {clearPositions, clearVelocity} from "../store/dataSlice";
import {animate} from "./animate";
import {FontLoader, TextGeometry} from "three/addons";

// Добавление плоскости по формуле Ax + By + Cz + D = 0
export function addPlane(A, B, C, D, size, color, scene) {
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    // Нахождение нормали плоскости
    const normal = new THREE.Vector3(A, B, C).normalize();
    plane.lookAt(normal);

    // Смещение плоскости согласно D
    plane.position.copy(normal.multiplyScalar(-D / normal.length()));

    scene.add(plane);
}

export function addTrajectory(positions, color, scene) {
    const material = new THREE.LineBasicMaterial({color: color});//0xff0000
    const geometry = new THREE.BufferGeometry().setFromPoints(positions.map(p => new THREE.Vector3(p.x, p.y, p.z)));
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

export function addPoint(radius, color, coordinates, scene) {
    const startPointGeometry = new THREE.SphereGeometry(0.01, 16, 16);
    const startPointMaterial = new THREE.MeshBasicMaterial({color: color});
    const startPoint = new THREE.Mesh(startPointGeometry, startPointMaterial);
    startPoint.position.set(coordinates.x, coordinates.y, coordinates.z);
    scene.add(startPoint);

    return startPoint;
}

export function addVector(vector1, vector2, color, scene) {
    const arrowHelper = new THREE.ArrowHelper(vector2.clone().sub(vector1.clone()).normalize(), vector1, vector2.clone().sub(vector1.clone()).length(), color);
    scene.add(arrowHelper);
    return arrowHelper;
}

export function clearCanvas(e, dispatch, scene, renderer, camera) {
    e.preventDefault();
    dispatch(clearPositions());
    dispatch(clearVelocity());

    while (scene.children.length !== 0) {
        scene.children.forEach((child) => {
            scene.remove(child);
        });
    }

    let parent = document.querySelector(".render_place");
    if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
    parent.appendChild(renderer.domElement);

    // Добавление координатных осей
    scene.add(new THREE.AxesHelper(1));
    addBaseXYZ(scene, 1);

    animate(renderer, scene, camera);
}

export function addBaseXYZ(scene, len) {
    addLabel('X', new THREE.Vector3(len, 0, 0), scene);
    addLabel('Y', new THREE.Vector3(0, len, 0), scene);
    addLabel('Z', new THREE.Vector3(0, 0, len), scene);
}

export function addLabel(text, position, scene) {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.05,
            depth: 0.01,
            curveSegments: 12,
            bevelEnabled: false,
        });

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position);
        textMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)); // Поворачиваем текст
        scene.add(textMesh);
    });
}