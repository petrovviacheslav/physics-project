import {setFall, setGravity} from "../../store/dataSlice";
import * as THREE from "three";
import {addBaseXYZ, addPlane, addPoint, addTrajectory, addVector} from "../../util/addsToScene";
import {animate} from "../../util/animate";
import {addPositionAndVelocity} from "../../util/addsToStore";


// export default function DrawElectrostatic(position_arr, velocity_arr, tension_arr, gravity, fallenTime, scene, camera, renderer, dispatch) {
export default function DrawElectrostatic(particles_arr, tension_arr, gravity, fallenTime, scene, camera, renderer, dispatch) {
    console.log('===================');
    console.log('DrawElectrostatic');
    // Константы
    const powTenE = 1e3;
    const powTenQ = 1e-9;
    const powTenM = 1e-6;

    const useGravity = Boolean(gravity);
    dispatch(setGravity(useGravity));
    const q = Number(particles_arr[0].discharge) * powTenQ;// заряд частицы, Кл
    const m = 9.1*powTenM; // масса частицы, кг
    const E = new THREE.Vector3(Number(tension_arr.tension_x) * powTenE, Number(tension_arr.tension_y) * powTenE, Number(tension_arr.tension_z) * powTenE); // магнитное поле, Тл
    const v0 = new THREE.Vector3(Number(particles_arr[0].velocity_x), Number(particles_arr[0].velocity_y), Number(particles_arr[0].velocity_z)); // начальная скорость, м/с
    const r0 = new THREE.Vector3(Number(particles_arr[0].position_x), Number(particles_arr[0].position_y), Number(particles_arr[0].position_z)); // начальная позиция, м

    const parts = 200; // делим время на столько частей

    const a = E.clone().multiplyScalar(q / m);
    let allTime = Number(fallenTime);
    if (q===0) {
        a.x = 0;
        a.y = 0;
        a.z = 0;
    }
    if (useGravity) a.z = a.z - 9.82;
    console.log("a = [" + a.toArray() + "]");

    let parent = document.querySelector(".render_place");
    if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
    parent.appendChild(renderer.domElement);

    // проверка, врежется ли заряд в пол
    let fallTime = allTime
    const check_a = a.z / 2; // коэффициент a
    const check_b = v0.z; // коэффициент b
    const check_c = r0.z; // коэффициент c
    const discriminant = Math.pow(check_b, 2) - 4 * check_a * check_c;
    if (discriminant >= 0) {
        const first = (-check_b + Math.sqrt(discriminant)) / (2 * check_a);
        const second = (-check_b - Math.sqrt(discriminant)) / (2 * check_a);
        if (first > 0 && second > 0) {
            fallTime = Math.min(first, second);
        } else if (!(first < 0 && second < 0)) fallTime = Math.max(first, second);
    }
    if (fallTime > allTime) {
        fallTime = allTime
    }
    console.log("fallTime = " + fallTime);
    dispatch(setFall(fallTime !== allTime));

    const positions = [];
    positions.push(r0.clone());
    addPositionAndVelocity(0, r0.clone(), v0.clone(), 0, 0, dispatch);

    // ====================================
    let i = 1;
    function iterationCounting() {
        const pos = r0.clone().add(v0.clone().multiplyScalar(allTime * i / parts)).add(a.clone().multiplyScalar(Math.pow(allTime * i / parts, 2) / 2)); // newPosition = r0 + v0t + at^2 / 2
        const vel = v0.clone().add(a.clone().multiplyScalar(allTime * i / parts)); // newVelocity = v0 + at
        return [pos.clone(), vel.clone()];
    }
    // ===================================

    let newPosition = new THREE.Vector3();
    let newVelocity = new THREE.Vector3();
    while (i < parts) {
        [ newPosition, newVelocity ] = iterationCounting()

        if (i >= parts * (fallTime / allTime)) {
            newPosition.z = 0;
            newVelocity.z = 0;
        }
        positions.push(newPosition.clone());

        addPositionAndVelocity(i, newPosition, newVelocity, allTime * i / 100, 3, dispatch);
        i++;
    }

    // Добавление траектории в сцену
    addTrajectory(positions, 0xff0000, scene);
    // Добавление начальной точки
    addPoint(0.01, 0x4169E1, r0, scene);
    // Добавление вектора напряжения из почти начальной точки
    addVector(r0.clone().add(new THREE.Vector3(0,0,0.5)), r0.clone().add(E.clone().divideScalar(powTenE).add(new THREE.Vector3(0,0,0.5))),0xEE82EE, scene);
    // Добавление плоскости z = 0
    addPlane(0, 0, 1, 0, 7, 0x808080, scene);
    // Добавление координатных осей
    scene.add(new THREE.AxesHelper(Math.max(r0.x, r0.y, r0.z) + 1));
    addBaseXYZ(scene, Math.max(r0.x, r0.y, r0.z) + 1.1);

    animate(renderer, scene, camera);
}