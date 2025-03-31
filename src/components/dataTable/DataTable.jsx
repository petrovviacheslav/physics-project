import {useSelector} from "react-redux";
import {useState, useEffect} from "react";
import * as THREE from "three";
import {animate} from "../../util/animate";
import {addPoint, addVector} from "../../util/addsToScene";


// Разместил слайдер для time здесь
// TODO я заметил, что при первой загрузке график управляется ахуенно – плавно, чётенько. Но если немного подрочить время – всё к хуям ломается
// TODO когда меняется ширина значений в ячейках таблицы – меняется ширина самих ячеек. Короче, таблица ребит если быстро дрочить слайдер. Не красиво, потом поменяю
const DataTable = ({scene, camera, renderer, divideVelocity}) => {
    const positionsFromStore = useSelector((state) => state.data.positions);
    const velocitiesFromStore = useSelector((state) => state.data.velocities);

    const [selectedTime, setSelectedTime] = useState(0);
    const [currentPoint, setCurrentPoint] = useState([null, null, null]);
    const [currentVelocity, setCurrentVelocity] = useState([null, null, null]);
    const [selectedData, setSelectedData] = useState({n: 0});

    // Определяем динамический maxTime по последнему значению time в positionsFromStore
    const maxTime =
        positionsFromStore && positionsFromStore.length > 0
            ? positionsFromStore[positionsFromStore.length - 1].time
            : 3;

    // Если выбранное время превышает maxTime (например, при обновлении данных) – корректируем его
    useEffect(() => {
        if (selectedTime > maxTime) {
            setSelectedTime(maxTime);
            updateForSelectedTime(maxTime);
        }
    }, [maxTime, selectedTime]);


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

        // находим все частицы (предполагается, что позиции и скорости синхронизированы)
        const arr_positions = positionsFromStore.filter((pos) => pos.id === closest.id);
        const arr_vels = velocitiesFromStore.filter((vel) => vel.id === closest.id);
        const n = arr_positions.length;

        // Обновляем данные для таблицы
        // Придумать как обновлять красиво таблицу, при этом учитывая количество используемых частиц
        setSelectedData({
            id: closest.id,
            arr_positions: arr_positions,
            arr_vels: arr_vels,
            time: closest.time,
            n: n
        });

        console.debug(selectedData);

        // обновляем сцену:
        // 1. Удаляем предыдущие объекты
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < n; i++) {
                if (currentPoint[i]) scene.remove(currentPoint[i]);
                if (currentVelocity[i]) scene.remove(currentVelocity[i]);
            }
        }

        // 2. Создаём новые
        let newPoints = [];
        let newVelocities = [];
        for (let i = 0; i < n; i++) {
            const curPos = new THREE.Vector3(arr_positions[i].x, arr_positions[i].y, arr_positions[i].z);
            const curVel = new THREE.Vector3(arr_vels[i].x, arr_vels[i].y, arr_vels[i].z);

            const newPoint = addPoint(0.01, 0x00ff00, curPos, scene);
            const newVelocity = addVector(
                curPos.clone(),
                curPos.clone().add(curVel.clone().multiplyScalar(divideVelocity)),
                0xffff00,
                scene
            );
            newPoints.push(newPoint);
            newVelocities.push(newVelocity);
        }

        setCurrentPoint(newPoints);
        setCurrentVelocity(newVelocities);

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
    }, [positionsFromStore, selectedTime, velocitiesFromStore]);


    function MyList({items}) {
        const renderedItems = [];

        // Обычный цикл for
        for (let i = 0; i < items.n; i++) {
            renderedItems.push(
                <tr key={items.id + "_" + i}>
                    <td>{i}</td>
                    <td>{items.arr_positions[i].x}</td>
                    <td>{items.arr_positions[i].y}</td>
                    <td>{items.arr_positions[i].z}</td>
                    <td>{items.arr_vels[i].x}</td>
                    <td>{items.arr_vels[i].y}</td>
                    <td>{items.arr_vels[i].z}</td>
                    <td>{items.time}</td>
                </tr>
            );
        }

        return <tbody>{renderedItems}</tbody>;
    }

    return (
        <div className="data-table-container">
            <div className="time-slider">
                <h2>Время движения (с):</h2>
                <input
                    type="range"
                    id="time_slider"
                    min="0"
                    max={maxTime}
                    step={maxTime / 200} /* динамический шаг */
                    value={selectedTime}
                    onChange={updateTime}
                />
                <span>{selectedTime.toFixed(2)}</span>
            </div>
            <div className="table-container">
                <table className="data_table">
                    <thead>
                    <tr>
                        <th>№</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>Z</th>
                        <th>vel_x</th>
                        <th>vel_y</th>
                        <th>vel_z</th>
                        <th>time</th>
                    </tr>
                    </thead>
                    <MyList items={selectedData}/>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
