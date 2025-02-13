import {useState} from "react";
import {DrawMagnetic} from "./DrawMagnetic";
import {useDispatch} from "react-redux";
import {clearPositions, clearVelocity} from "../../store/dataSlice";

import {clearCanvas} from "../../util/addsToScene";


const ManipulationMagneticForm = ({scene, camera, renderer}) => {
    const dispatch = useDispatch();

    const [position, setPosition] = useState({position_x: 0, position_y: 0.5, position_z: 0.1, discharge: 1});
    const [velocity, setVelocity] = useState({velocity_x: 1, velocity_y: 0, velocity_z: 1.2});
    const [induction, setInduction] = useState({induction_x: 0, induction_y: 0, induction_z: 2});
    const [fallenTime, setFallenTime] = useState(3);
    const [addConstructions, setAddConstructions] = useState(true);

    const updatePosition = (e) => {
        const {name, value} = e.target;
        setPosition(prevData => ({
            ...prevData,
            [name]: value,
        }));

    }

    const updateInduction = (e) => {
        const {name, value} = e.target;
        setInduction(prevData => ({
            ...prevData,
            [name]: value,
        }));

    }

    const updateVelocity = (e) => {
        const {name, value} = e.target;
        setVelocity(prevData => ({
            ...prevData,
            [name]: value,
        }));

    }

    const updateTime = (e) => {
        setFallenTime(e.target.value);
    }

    const handleOptionChange = (event) => {
        if (event.target.value === "yes") setAddConstructions(true);
        else setAddConstructions(false);
    };

    const updateCanvas = (e) => {
        e.preventDefault();

        dispatch(clearPositions());
        dispatch(clearVelocity());

        while (scene.children.length !== 0) {
            scene.children.forEach((child) => {
                scene.remove(child);
            });
        }

        // здесь надо сделать то же самое, только не трогай induction, fallenTime, addConstructions, scene, camera, renderer, dispatch
        DrawMagnetic(position, velocity, induction, fallenTime, addConstructions, scene, camera, renderer, dispatch);
    }


    return (
        <>
            <form onSubmit={e => e.preventDefault()}>
                <div className="position">

                    <h2>Начальные координаты и заряд частицы:</h2>
                    <div className="sub-form-container">
                        <div>
                            <label htmlFor="position_x_slider">координата X:</label>
                            <input type="range" id="position_x_slider" min="-1" max="1" name={"position_x"} step={0.1}
                                   value={position.position_x} onChange={updatePosition}/>
                            <span>{position.position_x}</span>
                        </div>
                        <div>
                            <label htmlFor="position_y_slider">координата Y:</label>
                            <input type="range" id="position_y_slider" min="-1" max="1" name={"position_y"} step={0.1}
                                   value={position.position_y} onChange={updatePosition}/>
                            <span>{position.position_y}</span>
                        </div>
                        <div>
                            <label htmlFor="position_z_slider">координата Z:</label>
                            <input type="range" id="position_z_slider" min="0.1" max="1" name={"position_z"} step={0.1}
                                   value={position.position_z} onChange={updatePosition}/>
                            <span>{position.position_z}</span>
                        </div>
                        <div>
                            <label htmlFor="discharge_slider">значение заряда (*1e-14):</label>
                            <input type="range" id="discharge_slider" min="-4" max="4" name={"discharge"} step={0.1}
                                   value={position.discharge} onChange={updatePosition}/>
                            <span>{position.discharge}</span>
                        </div>
                    </div>

                </div>

                <div className="velocity">

                    <h2>Начальная скорость частицы:</h2>
                    <div className="sub-form-container">
                        <div>
                            <label htmlFor="velocity_x_slider">по X (*1e1):</label>
                            <input type="range" id="velocity_x_slider" min="-5" max="5" name={"velocity_x"} step={0.1}
                                   value={velocity.velocity_x} onChange={updateVelocity}/>
                            <span>{velocity.velocity_x}</span>
                        </div>
                        <div>
                            <label htmlFor="velocity_y_slider">по Y (*1e1):</label>
                            <input type="range" id="velocity_y_slider" min="-5" max="5" name={"velocity_y"} step={0.1}
                                   value={velocity.velocity_y} onChange={updateVelocity}/>
                            <span>{velocity.velocity_y}</span>
                        </div>
                        <div>
                            <label htmlFor="velocity_z_slider">по Z (*1e1):</label>
                            <input type="range" id="velocity_z_slider" min="-5" max="5" name={"velocity_z"} step={0.1}
                                   value={velocity.velocity_z} onChange={updateVelocity}/>
                            <span>{velocity.velocity_z}</span>
                        </div>
                    </div>
                </div>

                <div className="induction">
                    <h2>Вектор магнитной индукции:</h2>
                    <div className="sub-form-container">
                        <div>
                            <label htmlFor="induction_x_slider">по X (*1e-1):</label>
                            <input type="range" id="induction_x_slider" min="-5" max="5" name={"induction_x"} step={0.1}
                                   value={induction.induction_x} onChange={updateInduction}/>
                            <span>{induction.induction_x}</span>
                        </div>
                        <div>
                            <label htmlFor="induction_y_slider">по Y (*1e-1):</label>
                            <input type="range" id="induction_y_slider" min="-5" max="5" name={"induction_y"} step={0.1}
                                   value={induction.induction_y} onChange={updateInduction}/>
                            <span>{induction.induction_y}</span>
                        </div>
                        <div>
                            <label htmlFor="induction_z_slider">по Z (*1e-1):</label>
                            <input type="range" id="induction_z_slider" min="-5" max="5" name={"induction_z"} step={0.1}
                                   value={induction.induction_z} onChange={updateInduction}/>
                            <span>{induction.induction_z}</span>
                        </div>
                    </div>

                </div>

                <div className="time">
                    <h2>Время движения (*1e-1, с):</h2>
                    <input type="range" id="time_slider" min="0.5" max="7" name={"fallenTime"} step={0.1}
                           value={fallenTime} onChange={updateTime}/>
                    <span>{fallenTime}</span>
                </div>

                <div className="addConstructions">
                    <h2>Добавить промежуточные построения?</h2>
                    <label>
                        <input
                            type="radio"
                            value="yes"
                            checked={addConstructions}
                            onChange={handleOptionChange}
                        />
                        <span>Да</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="no"
                            checked={!addConstructions}
                            onChange={handleOptionChange}
                        />
                        <span>Нет</span>
                    </label>
                </div>

                <div className={"buttons"}>
                    <button type="submit" onClick={updateCanvas}>Create</button>
                    <button onClick={e => clearCanvas(e, dispatch, scene, renderer, camera)}>Clear</button>
                </div>
            </form>
        </>
)
}

export default ManipulationMagneticForm;