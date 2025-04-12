import * as THREE from "three";
import {addBaseXYZ, addPlane, addPoint, addTrajectory, addVector} from "../../util/addsToScene";
import {add_renderer_to_dom, animate} from "../../util/settingsScene";
import {addPositionAndVelocity} from "../../util/addsToStore";
import {calculateCoulombForceForAllParticles} from "../../util/calculator";

export default function DrawElectrostatic(particles_arr, tension_arr, gravity, fallenTime, scene, camera, renderer, dispatch) {
    console.debug('===================');
    console.debug('DrawElectrostatic');
    // Константы
    const powTenE = 1e3;
    const powTenQ = 1e-8;
    const powTenM = 1e-6;

    const E = new THREE.Vector3(Number(tension_arr.tension_x) * powTenE, Number(tension_arr.tension_y) * powTenE, Number(tension_arr.tension_z) * powTenE); // магнитное поле, Тл

    const useGravity = Boolean(gravity);

    const m = 9.1 * powTenM; // масса частицы, кг

    let start_a_arr = [];
    let q_arr = [];
    let cur_pos_arr = [];
    let cur_vel_arr = [];
    let start_pos_arr = [];
    // количество используемых частиц
    let n = 0;

    // распределение всех данных по нужным переменным и проверка, какие заряды задействуются
    for (let j = 0; j < particles_arr.length; j++) {
        if (particles_arr[j].need === true) {
            console.debug(start_a_arr);

            const discharge = Number(particles_arr[j].discharge);
            q_arr.push(discharge * powTenQ);
            cur_pos_arr.push(new THREE.Vector3(Number(particles_arr[j].position_x), Number(particles_arr[j].position_y), Number(particles_arr[j].position_z)));
            cur_vel_arr.push(new THREE.Vector3(Number(particles_arr[j].velocity_x), Number(particles_arr[j].velocity_y), Number(particles_arr[j].velocity_z)));

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
    // console.debug(start_a_arr[0]);

    // делим время на столько частей
    const parts = 200;
    let allTime = Number(fallenTime);

    //=============
    add_renderer_to_dom(renderer.domElement);
    //=======================

    const positions = [[], [], []];

    // добавление начальных точек и скоростей в хранилище
    for (let j = 0; j < n; j++) {
        positions[j].push(cur_pos_arr[j].clone());
        addPositionAndVelocity(0, cur_pos_arr[j].clone(), cur_vel_arr[j].clone(), 0, 3, dispatch, j);
    }

    // ===================================
    for (let i = 1; i < parts; i++) {
        // копирование массива базовых векторов, чтобы он не менялся в цикле
        let a_electro_arr = [];
        let a_coulomb_arr = [];
        for (let k = 0; k < n; k++) {
            a_electro_arr.push(new THREE.Vector3(start_a_arr[k].x, start_a_arr[k].y, start_a_arr[k].z));
            a_coulomb_arr.push(new THREE.Vector3(0, 0, 0));
        }

        // считаем силу Кулона
        if (n > 1) a_coulomb_arr = calculateCoulombForceForAllParticles(n, cur_pos_arr, q_arr, a_coulomb_arr, m)

        // обновление данных позиции и скорости в массиве и хранилище
        for (let j = 0; j < n; j++) {
            let united_a = a_electro_arr[j].clone().add(a_coulomb_arr[j].clone());
            cur_pos_arr[j].add(cur_vel_arr[j].clone().multiplyScalar(allTime / parts)).add(united_a.clone().multiplyScalar(Math.pow(allTime / parts, 2) / 2));
            cur_vel_arr[j].add(united_a.clone().multiplyScalar(allTime / parts))

            if (cur_pos_arr[j].z < 0) {
                cur_pos_arr[j].z = 0
            }
            if (cur_vel_arr[j].z < 0) {
                cur_vel_arr[j].z = 0
            }

            positions[j].push(cur_pos_arr[j].clone());
            addPositionAndVelocity(i, cur_pos_arr[j].clone(), cur_vel_arr[j].clone(), allTime * i / parts, 3, dispatch, j);
        }

    }
// считаем силу Кулона
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