import * as THREE from "three";
import {addBaseXYZ, addPlane, addPoint, addTrajectory, addVector} from "../../util/addsToScene";
import {animate} from "../../util/animate";
import {addPositionAndVelocity} from "../../util/addsToStore";

export function DrawMagnetic(particles_arr, induction_arr, fallenTime, addConstructionsFlag, scene, camera, renderer, dispatch) {
    console.log('===================');
    console.log('DrawMagnetic');
    // Константы и данные
    const powTenQ = 1e-14;
    const powTenB = 1e-1;
    const powTenV0 = 1e1;
    const powTenTime = 1e-1;
    const powTenM = 1e-16;

    const q = Number(particles_arr[0].discharge) * powTenQ; // заряд частицы, Кл
    const m = 1.1 * powTenM; // масса частицы, кг
    const B = new THREE.Vector3(powTenB * Number(induction_arr.induction_x), powTenB * Number(induction_arr.induction_y), powTenB * Number(induction_arr.induction_z)); // магнитное поле, Тл
    const v0 = new THREE.Vector3(powTenV0 * Number(particles_arr[0].velocity_x), powTenV0 * Number(particles_arr[0].velocity_y), powTenV0 * Number(particles_arr[0].velocity_z)); // начальная скорость, м/с
    const r0 = new THREE.Vector3(Number(particles_arr[0].position_x), Number(particles_arr[0].position_y), Number(particles_arr[0].position_z)); // начальная позиция, м
    const allTime = Number(fallenTime) * powTenTime;

    //=============
    let parent = document.querySelector(".render_place");
    if (parent.firstElementChild) parent.removeChild(parent.firstElementChild);
    parent.appendChild(renderer.domElement);
    ///=======================
    const positions = [];
    positions.push(r0.clone());
    const positions_center = [];
    const positions2 = [];
    positions2.push(r0.clone());
    addPositionAndVelocity(0, r0.clone(), v0.clone(), 0, 0, dispatch);

    if (q === 0) {
        for (let i = 1; i < 100; i++){
            const newPosition = r0.clone().add(v0.clone().multiplyScalar(i*allTime/100));
            positions.push(newPosition.clone());

            addPositionAndVelocity(i, newPosition, v0, i*allTime/100, 7, dispatch);
        }

        if (addConstructionsFlag) {
            // Добавление вектора индукции
            addVector(r0.clone(), r0.clone().add(B.clone().divideScalar(powTenB)), 0xEE82EE, scene);
        }
    } else {
        // ============================
        // база
        const mainB = B.length();
        const mainV = v0.length();
        const is_monitor_length_preservation = true;

        // =================================
        // всякие штуки линаловские
        const normalization_B = B.clone().normalize();
        const D = -(normalization_B.x * r0.x + normalization_B.y * r0.y + normalization_B.z * r0.z);

        // =======================
        // возможно это придётся делать на каждой итерации, если добавлять новые внешние силы,
        // а после изменения скорости приводить её к только что подсчитанному projection.length()
        const scalarMultiply = v0.x * B.x + v0.y * B.y + v0.z * B.z;
        const h_projection_v = B.clone().multiplyScalar(scalarMultiply / B.lengthSq());
        const projection = v0.clone().sub(h_projection_v);

        // TODO: добавить проверку, что скорость > 10^-8 (машинная ошибка) иначе частица тупо стоит на месте
        // TODO: добавить проверку, что projection.length() > 10^-8, иначе значит V и B сонаправлены, следовательно частица движется только под действием скорости

        // ==========================
        // радиус получается = как для той ситуации когда вектор скорости перпендикулярен вектору индукции
        const directionForce = new THREE.Vector3();
        directionForce.crossVectors(v0, B);

        const mainR = m * projection.length() / (mainB*q);
        const period = 2 * Math.PI * mainR / projection.length();

        const directionChecker = [
            Math.sign(v0.x) * Math.sign(B.x) < 0,
            Math.sign(v0.y) * Math.sign(B.y) < 0,
            Math.sign(v0.z) * Math.sign(B.z) < 0
        ].filter(Boolean).length; // Считаем количество истинных значений
        let h = period * h_projection_v.length();
        if (directionChecker === 2 || directionChecker === 3) h = (-1) * h;
        const R_vector = directionForce.clone().normalize().multiplyScalar(mainR);
        const point_start_B = r0.clone().add(R_vector);

        // пересчитывается на каждой итерации
        let curV = v0.clone();
        let curAcceleration = 0;
        let curPosit = r0.clone();
        let curVProjection = projection.clone();
        let curDirectionForce = new THREE.Vector3();
        let curForceLength = 0;
        let sinVB = Math.sqrt(1-(scalarMultiply/(mainV*mainB))**2)

        const count_of_elem_one_circle = 360;
        console.log("mainB = " + mainB + " Tesla;\nmainV = " + mainV + " m/s;\nR = " + mainR + " m;\nperiod = " +
            period + " s;\niterations = " + count_of_elem_one_circle * allTime / period + ";\nstart sinVB = " + sinVB +
            ";\nh = " + h + " m;\ndirectionChecker = " + directionChecker + ";\npoint_start_B = [" + point_start_B.toArray() + "]" +
            ";\nnormalization_B = [" + normalization_B.toArray() + "];\nstart a = " + projection.lengthSq() / mainR +
            " m/s**2;\nprojection = [" + projection.toArray() + "];\nh_projection_v = [" + h_projection_v.toArray() +
            "];\nprojection x B = " + (projection.x * B.x + projection.y * B.y + projection.z * B.z) +
            ";\nskalProizv = " + scalarMultiply);

        if (allTime / period <= 5) {

            for (let i = 1; i < count_of_elem_one_circle * allTime / period; i++) {
                curDirectionForce.crossVectors(curV, B); // direction of Force and Acceleration

                sinVB = Math.sqrt(1 - ((curV.x * B.x + curV.y * B.y + curV.z * B.z) / (curV.length() * mainB)) ** 2) // sin(curVB) = sqrt(1-cos**2) = sqrt(1 - (|curV x B|/|curV|*|B|)**2)
                curForceLength = q * curV.length() * mainB * sinVB; // F = q*V*B*sin(curVB)

                curAcceleration = curDirectionForce.clone().normalize().multiplyScalar(curForceLength / m); // a = F/m
                //if (is_monitor_length_preservation) curAcceleration.normalize().multiplyScalar(start_a_length);

                //curAcceleration.z = curAcceleration.z - 9.81;

                curPosit.add(curV.clone().multiplyScalar(period / count_of_elem_one_circle)).add(curAcceleration.clone().multiplyScalar(period * period / (count_of_elem_one_circle * count_of_elem_one_circle)));
                // приведение той части, которая находится в плоскости к длине projection
                curVProjection.add(curAcceleration.clone().multiplyScalar(period / count_of_elem_one_circle));
                if (is_monitor_length_preservation) curVProjection.normalize().multiplyScalar(projection.length())
                curV = curVProjection.clone().add(h_projection_v.clone());

                // сюда можно дописать влияние других сил на эту точку и изменение скорости и положения под действием них

                positions_center.push(curPosit.clone().add(curDirectionForce.clone().normalize().multiplyScalar(mainR)));
                positions2.push(curPosit.clone());
                addPositionAndVelocity(i, curPosit.clone(), curV.clone(), allTime * i / ((360 / count_of_elem_one_circle) * allTime / period), 4, dispatch);


                // метод, использующий только v0, h, T (невозможно добавить внешние силы)
                const new_start_B = point_start_B.clone().add(normalization_B.clone().multiplyScalar(h * (360 / count_of_elem_one_circle) * i / 360));
                // Преобразование угла в радианы
                const theta = (360 / count_of_elem_one_circle) * i * (Math.PI / 180) * Math.sign(-q);
                // Компоненты оси
                const u_x = normalization_B.x;
                const u_y = normalization_B.y;
                const u_z = normalization_B.z;
                // Матрица поворота
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);
                const rotationMatrix = [
                    [
                        cosTheta + (1 - cosTheta) * u_x * u_x,
                        (1 - cosTheta) * u_x * u_y - u_z * sinTheta,
                        (1 - cosTheta) * u_x * u_z + u_y * sinTheta
                    ],
                    [
                        (1 - cosTheta) * u_y * u_x + u_z * sinTheta,
                        cosTheta + (1 - cosTheta) * u_y * u_y,
                        (1 - cosTheta) * u_y * u_z - u_x * sinTheta
                    ],
                    [
                        (1 - cosTheta) * u_z * u_x - u_y * sinTheta,
                        (1 - cosTheta) * u_z * u_y + u_x * sinTheta,
                        cosTheta + (1 - cosTheta) * u_z * u_z
                    ]
                ];
                // Перемножаем матрицу поворота с вектором
                const new_R_vector = new THREE.Vector3(
                    rotationMatrix[0][0] * R_vector.x + rotationMatrix[0][1] * R_vector.y + rotationMatrix[0][2] * R_vector.z,
                    rotationMatrix[1][0] * R_vector.x + rotationMatrix[1][1] * R_vector.y + rotationMatrix[1][2] * R_vector.z,
                    rotationMatrix[2][0] * R_vector.x + rotationMatrix[2][1] * R_vector.y + rotationMatrix[2][2] * R_vector.z
                );
                // const newVelocity = new THREE.Vector3(
                //     rotationMatrix[0][0] * v0.x + rotationMatrix[0][1] * v0.y + rotationMatrix[0][2] * v0.z,
                //     rotationMatrix[1][0] * v0.x + rotationMatrix[1][1] * v0.y + rotationMatrix[1][2] * v0.z,
                //     rotationMatrix[2][0] * v0.x + rotationMatrix[2][1] * v0.y + rotationMatrix[2][2] * v0.z
                // );
                const newPosition = new_start_B.clone().sub(new_R_vector);
                positions.push(newPosition.clone());
            }

            if (addConstructionsFlag) {
                // Добавление проекции начального вектора скорости на вектор магнитной индукции
                addVector(r0.clone().add(projection.clone().divideScalar(powTenV0)), r0.clone().add(projection.clone().divideScalar(powTenV0)).add(h_projection_v.clone().divideScalar(powTenV0)), 0xffc0cb, scene);
                // Добавление проекции начального вектора скорости на плоскость с нормалью - вектором магнитной индукции
                addVector(r0.clone(), r0.clone().add(projection.clone().divideScalar(powTenV0)), 0xffc0cb, scene);
                // Добавление вектора индукции
                if (h !== 0) addVector(point_start_B.clone(), point_start_B.clone().add(normalization_B.clone().multiplyScalar(Math.abs(h) * allTime / period)), 0xEE82EE, scene);
                else addVector(point_start_B.clone(), point_start_B.clone().add(normalization_B.clone()), 0xEE82EE, scene);
                // Добавление начального вектора скорости
                addVector(r0.clone(), r0.clone().add(v0.clone().divideScalar(powTenV0)), 0xffff00, scene);
                // Добавление R_vector (начальный)
                addVector(r0.clone(), r0.clone().add(R_vector.clone()), 0xffc0cb, scene);
                // траектория центральных точек
                addTrajectory(positions_center, "green", scene)
                // Добавление траектории по другому методу в сцену
                addTrajectory(positions, "yellow", scene);
            }

            // Добавление плоскости с нормалью - вектором магнитной индукции
            addPlane(B.x, B.y, B.z, D, 1, 0x808080, scene);
        } else {
            alert("Время превысило 5 периодов, к сожалению, строить данную модель слишком затратно, поэтому постарайтесь изменить данные, например, просто уменьшите время движения");
        }
    }
    // Добавление траектории по силовому методу в сцену
    addTrajectory(positions2, 0xff0000, scene);
    // Добавление начальной точки
    addPoint(0.01, 0x4169E1, r0, scene);
    // Добавление координатных осей
    scene.add(new THREE.AxesHelper(Math.max(r0.x, r0.y, r0.z) + 1));
    addBaseXYZ(scene, Math.max(r0.x, r0.y, r0.z) + 1.1);

    animate(renderer, scene, camera);
}