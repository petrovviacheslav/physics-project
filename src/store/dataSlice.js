import {createSlice} from '@reduxjs/toolkit';


const dataSlice = createSlice({
    name: 'data',
    initialState: {
        positions: [],
        velocities: [],
        willFall: false,
        useGravity: false,
    },
    reducers: {
        addPosition(state, action) {
            state.positions.push(action.payload);
        },
        clearPositions(state, action) {
            state.positions = []
        },
        addVelocity(state, action) {
            state.velocities.push(action.payload);
        },
        clearVelocity(state, action) {
            state.velocities = []
        },
        setFall(state, action) {
            state.willFall = action.payload;
        },
        setGravity(state, action) {
            state.useGravity = action.payload;
        }
    },
});

export const {addPosition, clearPositions, addVelocity, clearVelocity, setGravity, setFall} = dataSlice.actions;

export default dataSlice.reducer;