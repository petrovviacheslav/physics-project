import * as THREE from "three";
import {addBaseXYZ, addPoint, addTrajectory, addVector} from "../../util/addsToScene";
import {add_renderer_to_dom, animate} from "../../util/settingsScene";
import {addPositionAndVelocity} from "../../util/addsToStore";
import {calculateCoulombForceForAllParticles} from "../../util/calculator";

export function DrawMagnetic(particles_arr, induction_arr, fallenTime, addConstructionsFlag, scene, camera, renderer, dispatch) {
    console.debug('===================');
    console.debug('DrawMagnetic');
    add_renderer_to_dom(renderer.domElement);

    // константы
    const powTenQ = 1e-14;
    const powTenB = 1e-1;
    const powTenV0 = 1e1;
    // const powTenTime = 1e-1;
    const powTenTime = 1;
    const powTenM = 1e-16;
    const is_monitor_length_preservation = true;

    const m = 1.1 * powTenM; // масса всех частиц
    const B = new THREE.Vector3(powTenB * Number(induction_arr.induction_x), powTenB * Number(induction_arr.induction_y), powTenB * Number(induction_arr.induction_z)); // магнитное поле, Тл
    const mainB = B.length();
    const B_equal_0 = mainB < 1e-8;

    let q_arr = [];
    let cur_pos_arr = [];
    let cur_vel_arr = [];
    let start_pos_arr = [];
    let n = 0; // количество используемых частиц

    // распределение всех данных по нужным переменным и проверка, какие заряды задействуются
    for (let j = 0; j < particles_arr.length; j++) {
        if (particles_arr[j].need === true) {
            const discharge = Number(particles_arr[j].discharge);
            q_arr.push(discharge * powTenQ);
            cur_pos_arr.push(new THREE.Vector3(Number(particles_arr[j].position_x), Number(particles_arr[j].position_y), Number(particles_arr[j].position_z)));
            cur_vel_arr.push(new THREE.Vector3(Number(particles_arr[j].velocity_x) * powTenV0, Number(particles_arr[j].velocity_y) * powTenV0, Number(particles_arr[j].velocity_z) * powTenV0));

            start_pos_arr.push(new THREE.Vector3(Number(particles_arr[j].position_x), Number(particles_arr[j].position_y), Number(particles_arr[j].position_z)));
            n++;
        }

    }
    // делим время на столько частей
    const parts = 300;
    let allTime = Number(fallenTime) * powTenTime;

    const positions_center = [[], [], []];
    const positions = [[], [], []];
    // добавление начальных точек и скоростей в хранилище
    for (let j = 0; j < n; j++) {
        positions[j].push(cur_pos_arr[j].clone());
        addPositionAndVelocity(0, cur_pos_arr[j].clone(), cur_vel_arr[j].clone(), 0, 4, dispatch, j);
    }

    if (n === 1 && (Math.abs(cur_vel_arr[0].x) < 1e-8 && Math.abs(cur_vel_arr[0].y) < 1e-8 && Math.abs(cur_vel_arr[0].z) < 1e-8)) {
        alert("Только одна точка, она не сдвинулась с места");
    }

    // ============================

    for (let i = 1; i < parts; i++) {
        // разложение вектора скорости на 2 составляющие, чтобы потом привести скорость к правильной длине
        let h_projection_v_arr = [];
        let plane_projection_v_arr = [];
        // длина векторов из предыдущего массива
        let plane_projection_length_v_arr = [];
        let a_lorenz_arr = [];
        let a_coulomb_arr = [];

        for (let j = 0; j < n; j++) {
            const scalarMultiply = cur_vel_arr[j].x * B.x + cur_vel_arr[j].y * B.y + cur_vel_arr[j].z * B.z;
            const h_projection_v = B.clone().multiplyScalar(scalarMultiply / B.lengthSq());
            h_projection_v_arr.push(h_projection_v);

            const plane_projection_v = cur_vel_arr[j].clone().sub(h_projection_v);
            plane_projection_v_arr.push(plane_projection_v.clone());
            plane_projection_length_v_arr.push(plane_projection_v.clone().length());

            // направление действия силы лоренца
            let cur_direction_lorenz = new THREE.Vector3();
            if (B_equal_0) cur_direction_lorenz = new THREE.Vector3(0, 0, 0);
            else cur_direction_lorenz.crossVectors(cur_vel_arr[j], B);

            // sin(curVB) = sqrt(1-cos**2) = sqrt(1 - (|curV x B|/|curV|*|B|)**2)
            const sinVB = Math.sqrt(1 - (scalarMultiply / (cur_vel_arr[j].length() * mainB)) ** 2);

            // length F = q*V*B*sin(curVB)
            const cur_lorenz_length = q_arr[j] * cur_vel_arr[j].length() * mainB * sinVB;

            // vector a = F/m
            if (B_equal_0) a_lorenz_arr.push(new THREE.Vector3(0, 0, 0));
            else a_lorenz_arr.push(cur_direction_lorenz.clone().normalize().multiplyScalar(cur_lorenz_length / m));

            a_coulomb_arr.push(new THREE.Vector3(0, 0, 0));

            if (!B_equal_0) {
                const cur_radius_length = m * plane_projection_v.length() / (mainB * q_arr[j]);
                positions_center[j].push(cur_pos_arr[j].clone().add(cur_direction_lorenz.clone().normalize().multiplyScalar(cur_radius_length)));
            }

            if (i === 1 && addConstructionsFlag) {
                if (!B_equal_0) {
                    // добавление проекции начального вектора скорости на вектор магнитной индукции
                    addVector(cur_pos_arr[j].clone(), cur_pos_arr[j].clone().add(h_projection_v.clone().divideScalar(powTenV0)), 0xffc0cb, scene);
                    // добавление проекции начального вектора скорости на плоскость, перпендикулярную вектору магн индукции
                    addVector(cur_pos_arr[j].clone(), cur_pos_arr[j].clone().add(plane_projection_v.clone().divideScalar(powTenV0)), 0xffc0cb, scene);
                }
                // добавление начального вектора скорости
                addVector(cur_pos_arr[j].clone(), cur_pos_arr[j].clone().add(cur_vel_arr[j].clone().divideScalar(powTenV0)), 0xffff00, scene);
            }
            // const period = 2 * Math.PI * cur_radius_length / plane_projection_v.length();
            // console.debug("точка j = " + j + "; итерация = " + i)
            // console.debug("period = " + period + "; \nh_projection_v = " + h_projection_v.toArray() +
            //     "; \nplane_projection_v = " + plane_projection_v.toArray() + "; \ncur_direction_lorenz = " +
            //     cur_direction_lorenz.toArray() + "; \nR = " + cur_radius_length);
        }

        // считаем силу Кулона
        if (n > 1) a_coulomb_arr = calculateCoulombForceForAllParticles(n, cur_pos_arr, q_arr, a_coulomb_arr, m)

        // обновление данных позиции и скорости в массиве и хранилище
        for (let j = 0; j < n; j++) {
            let united_a = a_coulomb_arr[j].clone().add(a_lorenz_arr[j].clone());
            cur_pos_arr[j].add(cur_vel_arr[j].clone().multiplyScalar(allTime / parts)).add(united_a.multiplyScalar(Math.pow(allTime / parts, 2) / 2));

            if (!B_equal_0) {
                // приведение той части, которая находится в плоскости перпендикулярной вектору магнитной индукции
                plane_projection_v_arr[j].add(a_lorenz_arr[j].clone().multiplyScalar(allTime / parts));
                if (is_monitor_length_preservation) plane_projection_v_arr[j].normalize().multiplyScalar(plane_projection_length_v_arr[j]);
                cur_vel_arr[j] = plane_projection_v_arr[j].clone().add(h_projection_v_arr[j].clone());
            }

            cur_vel_arr[j].add(a_coulomb_arr[j].clone().multiplyScalar(allTime / parts));

            positions[j].push(cur_pos_arr[j].clone());
            addPositionAndVelocity(i, cur_pos_arr[j].clone(), cur_vel_arr[j].clone(), allTime * i / parts, 4, dispatch, j);
        }
    }

    if (addConstructionsFlag) {
        if (!B_equal_0) {
            // добавление вектора индукции
            addVector(new THREE.Vector3(0, 0, 0), (new THREE.Vector3(0, 0, 0)).add(B.clone().normalize()), 0xEE82EE, scene);

            for (let j = 0; j < n; j++) {
                // добавление траектории центральных точек
                addTrajectory(positions_center[j], "green", scene)
            }
        }
    }

    for (let j = 0; j < n; j++) {
        // добавление траектории в сцену
        addTrajectory(positions[j], 0xff0000, scene);
        // добавление начальной точки
        addPoint(0.05, 0x4169E1, start_pos_arr[j], scene);
    }

    scene.add(new THREE.AxesHelper(3));
    addBaseXYZ(scene, 3.1);

    animate(renderer, scene, camera);
}