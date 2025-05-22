import {addPosition, addVelocity} from "../store/dataSlice";


// добавление новой позиции и скорости для определённой точки в хранилище
export function addPositionAndVelocity(index, position, velocity, time, time_fixed, dispatch, num_particle) {
    dispatch(addPosition({
        id: index,
        num: num_particle,
        x: parseFloat(position.x.toFixed(3)),
        y: parseFloat(position.y.toFixed(3)),
        z: parseFloat(position.z.toFixed(3)),
        time: parseFloat(time.toFixed(Number(time_fixed))),
    }));

    let mainV = (Number(velocity.x) ** 2 + Number(velocity.y) ** 2 + Number(velocity.z) ** 2) ** 0.5;
    dispatch(addVelocity({
        id: index,
        num: num_particle,
        x: parseFloat(velocity.x.toFixed(3)),
        y: parseFloat(velocity.y.toFixed(3)),
        z: parseFloat(velocity.z.toFixed(3)),
        main: parseFloat(mainV.toFixed(3)),
        time: parseFloat(time.toFixed(Number(time_fixed))),
    }));
}