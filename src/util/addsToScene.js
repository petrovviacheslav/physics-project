// src/util/addsToScene.js
import * as THREE from "three";
import { clearPositions, clearVelocity } from "../store/dataSlice";
import { animate } from "./settingsScene";
// убрали отрисовку X, Y, Z из этого файла

// добавление плоскости по формуле Ax + By + Cz + D = 0
export function addPlane(A, B, C, D, size, scene) {
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x808080,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    const normal = new THREE.Vector3(A, B, C).normalize();
    plane.lookAt(normal);
    plane.position.copy(normal.multiplyScalar(-D / normal.length()));
    scene.add(plane);
}

// добавление траектории на сцену по массиву последовательных точек
export function addTrajectory(positions, color, scene) {
    const material = new THREE.LineBasicMaterial({
        color,
        linewidth: 2,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(
        positions.map(p => new THREE.Vector3(p.x, p.y, p.z))
    );
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 10;
    scene.add(line);
}

// добавление точки на сцену по координатам и радиусу
export function addPoint(radius, color, coordinates, scene) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
    });
    const point = new THREE.Mesh(geometry, material);
    point.position.set(coordinates.x, coordinates.y, coordinates.z);
    point.scale.set(1.2, 1.2, 1.2);
    point.renderOrder = 10;
    scene.add(point);
    return point;
}

// добавление вектора на сцену по начальной и конечной точкам
export function addVector(point1, point2, color, scene) {
    const direction = point2.clone().sub(point1).normalize();
    const length = point2.clone().sub(point1).length();
    const arrow = new THREE.ArrowHelper(direction, point1, length, color);
    if (arrow.line) {
        arrow.line.material.linewidth = 2;
        arrow.line.material.polygonOffset = true;
        arrow.line.material.polygonOffsetFactor = -1;
        arrow.line.material.polygonOffsetUnits = -1;
        arrow.line.renderOrder = 10;
    }
    arrow.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            child.scale.set(1.2, 1.2, 1.2);
            if (child.material) {
                child.material.polygonOffset = true;
                child.material.polygonOffsetFactor = -1;
                child.material.polygonOffsetUnits = -1;
            }
            child.renderOrder = 10;
        }
    });
    scene.add(arrow);
    return arrow;
}

// полная очистка сцены и отрисовка только координатных осей
export function clearCanvas(e, dispatch, scene, renderer, camera, only_clear) {
    e.preventDefault();
    dispatch(clearPositions());
    dispatch(clearVelocity());

    scene.children.slice().forEach(child => {
        if (child.geometry && child.geometry.type === 'TextGeometry') {
            return; // не удаляем текстовые метки
        }
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
        }
        scene.remove(child);
    });

    if (!only_clear) {
        let parent = document.querySelector(".render_place");
        if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
        parent.appendChild(renderer.domElement);

        const axes = new THREE.AxesHelper(1);
        axes.material.polygonOffset = true;
        axes.material.polygonOffsetFactor = -1;
        axes.material.polygonOffsetUnits = -1;
        axes.renderOrder = 5;
        scene.add(axes);

        animate(renderer, scene, camera, true);
    }
}