import * as THREE from "three";
import {addBaseXYZ, addPlane, addPoint, addTrajectory, addVector} from "../../util/addsToScene";
import {add_renderer_to_dom, animate} from "../../util/settingsScene";
import {addPositionAndVelocity} from "../../util/addsToStore";
import {calculateCoulombForceForAllParticles} from "../../util/calculator";

export function DrawMagnetic(particles_arr, induction_arr, fallenTime, addConstructionsFlag, scene, camera, renderer, dispatch) {
    console.debug('===================');
    console.debug('DrawMagnetic');
    // Константы и данные
    const powTenQ = 1e-14;
    const powTenB = 1e-1;
    const powTenV0 = 1e1;
    // const powTenTime = 1e-1;
    const powTenTime = 1;
    const powTenM = 1e-16;

    const m = 1.1 * powTenM; // масса частицы, кг
    const B = new THREE.Vector3(powTenB * Number(induction_arr.induction_x), powTenB * Number(induction_arr.induction_y), powTenB * Number(induction_arr.induction_z)); // магнитное поле, Тл

    let q_arr = [];
    let cur_pos_arr = [];
    let cur_vel_arr = [];
    let start_pos_arr = [];
    // количество используемых частиц
    let n = 0;

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

    //=============
    add_renderer_to_dom(renderer.domElement);
    //=======================
    // const positions_center = [];
    const positions = [[], [], []];
    // добавление начальных точек и скоростей в хранилище
    for (let j = 0; j < n; j++) {
        positions[j].push(cur_pos_arr[j].clone());
        addPositionAndVelocity(0, cur_pos_arr[j].clone(), cur_vel_arr[j].clone(), 0, 4, dispatch, j);
    }

    // TODO: если заряд равен 0 то что-то интересное происходит... (реализовать)
    // ============================
    // база
    const mainB = B.length();
    const is_monitor_length_preservation = true;
    // =======================

    // const directionChecker = [
    //     Math.sign(v0.x) * Math.sign(B.x) < 0,
    //     Math.sign(v0.y) * Math.sign(B.y) < 0,
    //     Math.sign(v0.z) * Math.sign(B.z) < 0
    // ].filter(Boolean).length; // Считаем количество истинных значений
    // let h = period * h_projection_v.length();
    // if (directionChecker === 2 || directionChecker === 3) h = (-1) * h;
    // const R_vector = directionForce.clone().normalize().multiplyScalar(mainR);
    // const point_start_B = r0.clone().add(R_vector);

    for (let i = 1; i < parts; i++) {
        let h_projection_v_arr = [];
        let plane_projection_v_arr = [];
        // изначальные длины проекции скоростей на плоскость, перпендикулярную вектору магнитной индукции
        let plane_projection_length_v_arr = [];
        let a_lorenz_arr = [];
        let a_coulomb_arr = [];

        // useless
        // let mainR_arr = [];
        // let period_arr = [];
        // let curDirectionForce_arr = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
        // let curForceLength_arr = [];

        for (let j = 0; j < n; j++) {
            // TODO: добавить проверку, что скорость > 10^-8 (машинная ошибка) иначе частица тупо стоит на месте
            // TODO: добавить проверку, что projection.length() > 10^-8, иначе значит V и B сонаправлены, следовательно частица движется только под действием скорости

            const scalarMultiply = cur_vel_arr[j].x * B.x + cur_vel_arr[j].y * B.y + cur_vel_arr[j].z * B.z;
            const h_projection_v = B.clone().multiplyScalar(scalarMultiply / B.lengthSq());
            h_projection_v_arr.push(h_projection_v);

            const plane_projection_v = cur_vel_arr[j].clone().sub(h_projection_v);
            plane_projection_v_arr.push(plane_projection_v.clone());
            plane_projection_length_v_arr.push(plane_projection_v.clone().length());

            const mainR = m * plane_projection_v.length() / (mainB * q_arr[j]);
            // mainR_arr.push(mainR);
            const period = 2 * Math.PI * mainR / plane_projection_v.length();
            // period_arr.push(period);

            // направление действия силы лоренца
            let cur_direction_lorenz = new THREE.Vector3();
            cur_direction_lorenz.crossVectors(cur_vel_arr[j], B);

            // sin(curVB) = sqrt(1-cos**2) = sqrt(1 - (|curV x B|/|curV|*|B|)**2)
            const sinVB = Math.sqrt(1 - (scalarMultiply / (cur_vel_arr[j].length() * mainB)) ** 2);

            // length F = q*V*B*sin(curVB)
            const cur_lorenz_length = q_arr[j] * cur_vel_arr[j].length() * mainB * sinVB;

            // vector a = F/m
            a_lorenz_arr.push(cur_direction_lorenz.clone().normalize().multiplyScalar(cur_lorenz_length / m));

            a_coulomb_arr.push(new THREE.Vector3(0, 0, 0));

            // console.debug("точка j = " + j + "; итерация = " + i)
            // console.debug("period = " + period + "; \nh_projection_v = " + h_projection_v.toArray() +
            //     "; \nplane_projection_v = " + plane_projection_v.toArray() + "; \ncur_direction_lorenz = " +
            //     cur_direction_lorenz.toArray() + "; \nR = " + mainR);
        }

        // positions_center.push(curPosit.clone().add(curDirectionForce.clone().normalize().multiplyScalar(mainR)));

        // считаем силу Кулона
        if (n > 1) a_coulomb_arr = calculateCoulombForceForAllParticles(n, cur_pos_arr, q_arr, a_coulomb_arr, m)

        // обновление данных позиции и скорости в массиве и хранилище
        for (let j = 0; j < n; j++) {
            let united_a = a_coulomb_arr[j].clone().add(a_lorenz_arr[j].clone());
            cur_pos_arr[j].add(cur_vel_arr[j].clone().multiplyScalar(allTime / parts)).add(united_a.multiplyScalar(Math.pow(allTime / parts, 2) / 2));

            // приведение той части, которая находится в плоскости перпендикулярной вектору магнитной индукции
            plane_projection_v_arr[j].add(a_lorenz_arr[j].clone().multiplyScalar(allTime / parts));
            if (is_monitor_length_preservation) plane_projection_v_arr[j].normalize().multiplyScalar(plane_projection_length_v_arr[j]);
            cur_vel_arr[j] = plane_projection_v_arr[j].clone().add(h_projection_v_arr[j].clone());

            cur_vel_arr[j].add(a_coulomb_arr[j].clone().multiplyScalar(allTime / parts))

            positions[j].push(cur_pos_arr[j].clone());
            addPositionAndVelocity(i, cur_pos_arr[j].clone(), cur_vel_arr[j].clone(), allTime * i / parts, 4, dispatch, j);
        }
    }

    if (addConstructionsFlag) {
    // Добавление проекции начального вектора скорости на вектор магнитной индукции
    // addVector(r0.clone().add(projection.clone().divideScalar(powTenV0)), r0.clone().add(projection.clone().divideScalar(powTenV0)).add(h_projection_v.clone().divideScalar(powTenV0)), 0xffc0cb, scene);

    // for (let j = 0; j < n; j++) {
    // Добавление проекции начального вектора скорости на плоскость с нормалью - вектором магнитной индукции
    // addVector(start_pos_arr[j].clone(), start_pos_arr[j].clone().add(projection_arr[j].clone().divideScalar(powTenV0)), 0xffc0cb, scene);
    // }
        // Добавление вектора индукции
        addVector(new THREE.Vector3(0, 0, 0), (new THREE.Vector3(0, 0, 0)).add(B.clone().normalize()), 0xEE82EE, scene);
    // Добавление начального вектора скорости
    // addVector(r0.clone(), r0.clone().add(v0.clone().divideScalar(powTenV0)), 0xffff00, scene);
    // Добавление R_vector (начальный)
    // addVector(r0.clone(), r0.clone().add(R_vector.clone()), 0xffc0cb, scene);
    // траектория центральных точек
    // addTrajectory(positions_center, "green", scene)
    }

    // Добавление плоскости с нормалью - вектором магнитной индукции
    // addPlane(B.x, B.y, B.z, D, 1, 0x808080, scene);

    for (let j = 0; j < n; j++) {
        // Добавление траектории в сцену
        addTrajectory(positions[j], 0xff0000, scene);
        // Добавление начальной точки
        addPoint(0.01, 0x4169E1, start_pos_arr[j], scene);
    }

    // Добавление координатных осей
    scene.add(new THREE.AxesHelper(3));
    addBaseXYZ(scene, 3.1);

    animate(renderer, scene, camera);
}