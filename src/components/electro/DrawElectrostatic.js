import * as THREE from "three";
import {addBaseXYZ, addPlane, addPoint, addTrajectory, addVector} from "../../util/addsToScene";
import {animate} from "../../util/animate";
import {addPositionAndVelocity} from "../../util/addsToStore";

export default function DrawElectrostatic(particles_arr, tension_arr, gravity, fallenTime, scene, camera, renderer, dispatch) {
    console.log('===================');
    console.log('DrawElectrostatic');
    // Константы
    const powTenE = 1e3;
    const powTenQ = 1e-8;
    const powTenM = 1e-6;

    const E = new THREE.Vector3(Number(tension_arr.tension_x) * powTenE, Number(tension_arr.tension_y) * powTenE, Number(tension_arr.tension_z) * powTenE); // магнитное поле, Тл

    const useGravity = Boolean(gravity);

    const m = 9.1 * powTenM; // масса частицы, кг

    let start_a_arr = [];
    let q_arr = [];
    let r0_arr = [];
    let v0_arr = [];
    let start_pos_arr = [];
    // количество используемых частиц
    let n = 0;

    // распределение всех данных по нужным переменным и проверка, какие заряды задействуются
    for (let j = 0; j < particles_arr.length; j++) {
        if (particles_arr[j].need === true) {
            console.debug(start_a_arr);

            const discharge = Number(particles_arr[j].discharge);
            q_arr.push(discharge * powTenQ);
            r0_arr.push(new THREE.Vector3(Number(particles_arr[j].position_x), Number(particles_arr[j].position_y), Number(particles_arr[j].position_z)));
            v0_arr.push(new THREE.Vector3(Number(particles_arr[j].velocity_x), Number(particles_arr[j].velocity_y), Number(particles_arr[j].velocity_z)));

            let base_a = E.clone().multiplyScalar(discharge * powTenQ / m);
            if (discharge === 0) {
                base_a.x = 0;
                base_a.y = 0;
                base_a.z = 0;
            }

            if (useGravity) base_a.z -= 9.82;
            start_a_arr.push(new THREE.Vector3(base_a.x, base_a.y, base_a.z));

            start_pos_arr.push(new THREE.Vector3(Number(particles_arr[j].position_x), Number(particles_arr[j].position_y), Number(particles_arr[j].position_z)));
            n++;
        }

    }
    console.debug(start_a_arr[0]);

    // делим время на столько частей
    const parts = 200;
    let allTime = Number(fallenTime);

    let parent = document.querySelector(".render_place");
    if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
    parent.appendChild(renderer.domElement);

    const positions = [[], [], []];

    // добавление начальных точек и скоростей в хранилище
    for (let j = 0; j < n; j++) {
        positions[j].push(r0_arr[j].clone());
        addPositionAndVelocity(0, r0_arr[j].clone(), v0_arr[j].clone(), 0, 0, dispatch, j);
    }

    // ====================================
    function calc_force_kulona(q1, q2, r_between) {
        if (r_between === 0) r_between = 0.0001;
        return (9 * 10e9) * Math.abs(q1 * q2) / (r_between * r_between)
    }

    function calc_r_between(pos1, pos2) {
        return pos1.clone().sub(pos2).length()
    }

    // ===================================
    let i = 1;
    while (i < parts) {
        // копирование массива базовых векторов, чтобы он не менялся в цикле
        let curr_a_arr = [];
        for (let k = 0; k < n; k++) {
            curr_a_arr.push(new THREE.Vector3(start_a_arr[k].x, start_a_arr[k].y, start_a_arr[k].z));
        }
        // console.debug("curr_a_arr - " + i);
        // console.debug("start");
        // console.debug(curr_a_arr[0]);
        if (n === 2) {
            const r_between01 = calc_r_between(r0_arr[0], r0_arr[1]);
            const len_force01 = calc_force_kulona(q_arr[0], q_arr[1], r_between01);
            const force01 = r0_arr[0].clone().sub(r0_arr[1].clone()).normalize().multiplyScalar(len_force01);

            // вектор force01 изначально направлен так: 1 -> 0 ->
            // значит если заряды одноимённые, то для 0-ой частицы вектор верный, а для 1-й его надо развернуть
            // если же заряды разноимённые, то вектора надо просто развернуть
            // аналогично для остальных сил и частиц
            console.debug("len = " + len_force01);
            curr_a_arr[0].add(force01.clone().divideScalar(m * Math.sign(q_arr[0] * q_arr[1])));
            curr_a_arr[1].add(force01.clone().divideScalar(-m * Math.sign(q_arr[0] * q_arr[1])));

            if (n === 3) {
                const r_between12 = calc_r_between(r0_arr[1], r0_arr[2]);
                const len_force12 = calc_force_kulona(q_arr[1], q_arr[2], r_between12);
                const force12 = r0_arr[1].clone().sub(r0_arr[2].clone()).normalize().multiplyScalar(len_force12);

                curr_a_arr[1].add(force12.clone().divideScalar(m * Math.sign(q_arr[1] * q_arr[2])));
                curr_a_arr[2].add(force12.clone().divideScalar(-m * Math.sign(q_arr[1] * q_arr[2])));

                const r_between02 = calc_r_between(r0_arr[0], r0_arr[2]);
                const len_force02 = calc_force_kulona(q_arr[0], q_arr[2], r_between02);
                const force02 = r0_arr[0].clone().sub(r0_arr[2].clone()).normalize().multiplyScalar(len_force02);

                curr_a_arr[0].add(force02.clone().divideScalar(m * Math.sign(q_arr[0] * q_arr[2])));
                curr_a_arr[2].add(force02.clone().divideScalar(-m * Math.sign(q_arr[0] * q_arr[2])));
            }
        }
        // console.debug("finish");
        // console.debug(curr_a_arr[0]);
        // обновление данных позиции и скорости в массиве и хранилище
        for (let j = 0; j < n; j++) {
            r0_arr[j].add(v0_arr[j].clone().multiplyScalar(allTime * i / parts)).add(curr_a_arr[j].clone().multiplyScalar(Math.pow(allTime * i / parts, 2) / 2));
            v0_arr[j].add(curr_a_arr[j].clone().multiplyScalar(allTime * i / parts))

            if (r0_arr[j].z < 0) {
                r0_arr[j].z = 0
            }
            if (v0_arr[j].z < 0) {
                v0_arr[j].z = 0
            }

            positions[j].push(r0_arr[j].clone());
            addPositionAndVelocity(i, r0_arr[j].clone(), v0_arr[j].clone(), allTime * i / parts, 3, dispatch, j);
        }

        i++;
    }

    for (let j = 0; j < n; j++) {
        // Добавление траектории в сцену
        addTrajectory(positions[j], 0xff0000, scene);
        // Добавление начальной точки
        addPoint(0.01, 0x4169E1, start_pos_arr[j], scene);
    }

    // Добавление вектора напряжения из почти начальной точки
    addVector(new THREE.Vector3(0, 0, 0), E.clone().divideScalar(powTenE), 0xEE82EE, scene);

    // Добавление плоскости z = 0
    addPlane(0, 0, 1, 0, 7, 0x808080, scene);

    // Добавление координатных осей
    scene.add(new THREE.AxesHelper(3));
    addBaseXYZ(scene, 3.1);

    animate(renderer, scene, camera);
}