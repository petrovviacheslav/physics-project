import {addPosition, addVelocity} from "../store/dataSlice";

export function addPositionAndVelocity(index, position, velocity, time, time_fixed, dispatch) {
    dispatch(addPosition({
        id: index,
        x: Number(position.x.toFixed(3)),
        y: Number(position.y.toFixed(3)),
        z: Number(position.z.toFixed(3)),
        time: Number(time.toFixed(Number(time_fixed))),
    }));

    dispatch(addVelocity({
        id: index,
        x: Number(velocity.x.toFixed(3)),
        y: Number(velocity.y.toFixed(3)),
        z: Number(velocity.z.toFixed(3)),
        time: Number(time.toFixed(Number(time_fixed))),
    }));
}