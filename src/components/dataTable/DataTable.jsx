import {useSelector} from "react-redux";
import {useState} from "react";
import * as THREE from "three";
import {animate} from "../../util/animate";
import {addPoint, addVector} from "../../util/addsToScene";


const DataTable = ({scene, camera, renderer, divideVelocity}) => {

    const positionsFromStore = useSelector(state => state.data.positions);
    const velocitiesFromStore = useSelector(state => state.data.velocities);

    const [currentPoint, setCurrentPoint] = useState(new THREE.Mesh());
    const [currentVelocity, setCurrentVelocity] = useState(new THREE.ArrowHelper());

    // TODO: надо будет создавать массив для всех точек, у каждой из которых хранится currentPoint, currentVelocity
    // или как это делать?

    function addOnGraph(e, id) {
        e.preventDefault();
        scene.remove(currentPoint);
        scene.remove(currentVelocity);

        const curPos = new THREE.Vector3(positionsFromStore[id].x, positionsFromStore[id].y, positionsFromStore[id].z)
        const curVel = new THREE.Vector3(velocitiesFromStore[id].x, velocitiesFromStore[id].y, velocitiesFromStore[id].z)
        setCurrentPoint(addPoint(0.01, 0x00ff00, curPos, scene));
        setCurrentVelocity(addVector(curPos.clone(), curPos.clone().add(curVel.clone().multiplyScalar(divideVelocity)), 0xffff00, scene));

        animate(renderer, scene, camera);

    }


    return (
        <div className={"table-container"}>
            <table className={"data_table"}>
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
                <tbody>
                { (positionsFromStore.length === 0) && <tr><td colSpan={8}>Нет данных</td></tr>}
                {
                    positionsFromStore.map((pos, index) => {
                        return (
                            <tr key={"" + pos.id + "tr"} title={"Нажми и узнай, что это за точка с id = " + pos.id} onClick={e => addOnGraph(e, pos.id)}>
                                <td key={"" + pos.id + "id"}>{pos.id}</td>
                                <td key={"" + pos.id + "x"}>{pos.x}</td>
                                <td key={"" + pos.id + "y"}>{pos.y}</td>
                                <td key={"" + pos.id + "z"}>{pos.z}</td>
                                <td key={"" + pos.id + "vel_x"}>{velocitiesFromStore[index].x}</td>
                                <td key={"" + pos.id + "vel_y"}>{velocitiesFromStore[index].y}</td>
                                <td key={"" + pos.id + "vel_z"}>{velocitiesFromStore[index].z}</td>
                                <td key={"" + pos.id + "time"}>{pos.time}</td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        </div>

    )
}

export default DataTable;