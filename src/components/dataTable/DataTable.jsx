import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import * as THREE from "three";
import { animate } from "../../util/animate";
import { addPoint, addVector } from "../../util/addsToScene";


// Разместил слайдер для time здесь
// TODO я заметил, что при первой загрузке график управляется ахуенно – плавно, чётенько. Но если немного подрочить время – всё к хуям ломается
// TODO теперь у нас 3 частицы, для каждой нужно хранить траектории. Надо будет придумать, как это сторить и передавать. Слайдер всё ещё будет один на все 3
// TODO когда меняется ширина значений в ячейках таблицы – меняется ширина самих ячеек. Короче, таблица ребит если быстро дрочить слайдер. Не красиво, потом поменяю
const DataTable = ({ scene, camera, renderer, divideVelocity }) => {
    const positionsFromStore = useSelector((state) => state.data.positions);
    const velocitiesFromStore = useSelector((state) => state.data.velocities);

    const [selectedTime, setSelectedTime] = useState(2);
    const [currentPoint, setCurrentPoint] = useState(null);
    const [currentVelocity, setCurrentVelocity] = useState(null);
    const [selectedData, setSelectedData] = useState(null);

    const updateForSelectedTime = (timeValue) => {
        // если данных нет, ничего не делаем
        if (!positionsFromStore || positionsFromStore.length === 0) return;

        // находим запись с ближайшим временем к выбранному значению
        // можно будет переделать тип чтобы прям то же самое значение искало, а не ближайшее. Сейчас по сути это и делает
        const closest = positionsFromStore.reduce((prev, curr) => {
            return Math.abs(curr.time - timeValue) < Math.abs(prev.time - timeValue)
                ? curr
                : prev;
        });

        // определяем индекс найденной записи (предполагается, что позиции и скорости синхронизированы)
        const index = positionsFromStore.findIndex((pos) => pos.id === closest.id);
        if (index < 0) return;

        // Обновляем данные для таблицы
        setSelectedData({
            id: closest.id,
            x: closest.x,
            y: closest.y,
            z: closest.z,
            vel_x: velocitiesFromStore[index]?.x,
            vel_y: velocitiesFromStore[index]?.y,
            vel_z: velocitiesFromStore[index]?.z,
            time: closest.time,
        });

        // обновляем сцену:
        // 1. Удаляем предыдущие объекты
        if (currentPoint) scene.remove(currentPoint);
        if (currentVelocity) scene.remove(currentVelocity);

        // 2. Создаём новые
        const curPos = new THREE.Vector3(closest.x, closest.y, closest.z);
        const curVel = new THREE.Vector3(
            velocitiesFromStore[index]?.x,
            velocitiesFromStore[index]?.y,
            velocitiesFromStore[index]?.z
        );
        const newPoint = addPoint(0.01, 0x00ff00, curPos, scene);
        const newVelocity = addVector(
            curPos.clone(),
            curPos.clone().add(curVel.clone().multiplyScalar(divideVelocity)),
            0xffff00,
            scene
        );
        setCurrentPoint(newPoint);
        setCurrentVelocity(newVelocity);

        animate(renderer, scene, camera);
    };

    // Обработчик изменения слайдера
    const updateTime = (e) => {
        const newTime = parseFloat(e.target.value);
        setSelectedTime(newTime);
        updateForSelectedTime(newTime);
    };

    // при изменении данных из стора (например, после пересчёта траектории) обновляем отображение
    useEffect(() => {
        updateForSelectedTime(selectedTime);
    }, [positionsFromStore, velocitiesFromStore]);

    return (
        <div className="data-table-container">
            <div className="time-slider">
                <h2>Время движения (с):</h2>
                <input
                    type="range"
                    id="time_slider"
                    min="0"
                    max="5"
                    step="0.025"
                    value={selectedTime}
                    onChange={updateTime}
                />
                <span>{selectedTime}</span>
            </div>
            <div className="table-container">
                <table className="data_table">
                    <thead>
                    <tr>
                        {/*<th>№</th>*/}
                        <th>X</th>
                        <th>Y</th>
                        <th>Z</th>
                        <th>vel_x</th>
                        <th>vel_y</th>
                        <th>vel_z</th>
                        <th>time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {selectedData ? (
                        <tr key={selectedData.id}>
                            {/*<td>{selectedData.id}</td>*/}
                            <td>{selectedData.x}</td>
                            <td>{selectedData.y}</td>
                            <td>{selectedData.z}</td>
                            <td>{selectedData.vel_x}</td>
                            <td>{selectedData.vel_y}</td>
                            <td>{selectedData.vel_z}</td>
                            <td>{selectedData.time}</td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan="8">Нет данных</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
