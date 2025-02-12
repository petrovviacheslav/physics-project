import {useState} from "react";
import DrawElectrostatic from "./DrawElectrostatic";
import {clearPositions, clearVelocity} from "../../store/dataSlice";
import {useDispatch} from "react-redux";
import {clearCanvas} from "../../util/addsToScene";


const ManipulationElectrostaticForm = ({scene, camera, renderer}) => {
    const dispatch = useDispatch();

    const [position, setPosition] = useState({position_x: 0, position_y: 0, position_z: 1, discharge: 1});
    const [velocity, setVelocity] = useState({velocity_x: 1, velocity_y: 1, velocity_z: 1});
    const [tension, setTension] = useState({tension_x: 1, tension_y: 1, tension_z: 1}); // напряжённость

    const [gravity, setGravity] = useState(false);
    const [fallenTime, setFallenTime] = useState(2);

    const updatePosition = (e) => {
        const {name, value} = e.target;
        setPosition(prevData => ({
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

    const updateTension = (e) => {
        const {name, value} = e.target;
        setTension(prevData => ({
            ...prevData,
            [name]: value,
        }));

    }

    const handleOptionChange = (event) => {
        if (event.target.value === "yes") setGravity(true);
        else setGravity(false);
    };

    const updateTime = (e) => {
        setFallenTime(e.target.value);
    }

    const updateCanvas = (e) => {
        e.preventDefault();
        dispatch(clearPositions());
        dispatch(clearVelocity());

        while (scene.children.length !== 0) {
            scene.children.forEach((child) => {
                scene.remove(child);
            });
        }

        // Параметры scene, camera, renderer, dispatch надо передавать последними,
        // сейчас position - это позиция+заряд одной частицы, а надо передавать двумерный массив,
        // содержащий как раз position. Но не только его, но и velocity. Длина двумерного массива - это количество частиц.
        // То есть каждый подмассив - это позиция, заряд и скорость частицы. Tension, gravity и fallenTime оставить как есть.
        // Как я вижу вызов функции: DrawElectrostatic(particles, tension, gravity, fallenTime, scene, camera, renderer, dispatch);
        // particles = [{pos_x: ..., pos_y: ..., pos_z: ..., vel_x: ..., vel_y: ..., vel_z: ..., discharge: ...}, {...}, {...}], пока сделай максимум для передачи 3 частицы
        // пределы для слайдеров оставь те же
        DrawElectrostatic(position, velocity, tension, gravity, fallenTime, scene, camera, renderer, dispatch);
    }

    return (
        <div className="lol">
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
                            <label htmlFor="discharge_slider">значение заряда (*1e-9):</label>
                            <input type="range" id="discharge_slider" min="-20" max="20" name={"discharge"} step={0.1}
                                   value={position.discharge} onChange={updatePosition}/>
                            <span>{position.discharge}</span>
                        </div>
                    </div>


                </div>

                <div className="velocity">
                    <h2>Начальная скорость частицы:</h2>
                    <div className="sub-form-container">
                        <div>
                            <label htmlFor="velocity_x_slider">по X:</label>
                            <input type="range" id="velocity_x_slider" min="-5" max="5" name={"velocity_x"} step={0.1}
                                   value={velocity.velocity_x} onChange={updateVelocity}/>
                            <span>{velocity.velocity_x}</span>
                        </div>
                        <div>
                            <label htmlFor="velocity_y_slider">по Y:</label>
                            <input type="range" id="velocity_y_slider" min="-5" max="5" name={"velocity_y"} step={0.1}
                                   value={velocity.velocity_y} onChange={updateVelocity}/>
                            <span>{velocity.velocity_y}</span>
                        </div>
                        <div>
                            <label htmlFor="velocity_z_slider">по Z:</label>
                            <input type="range" id="velocity_z_slider" min="-5" max="5" name={"velocity_z"} step={0.1}
                                   value={velocity.velocity_z} onChange={updateVelocity}/>
                            <span>{velocity.velocity_z}</span>
                        </div>
                    </div>

                </div>

                <div className="tension">
                    <h2>Вектор напряжённости поля:</h2>
                    <div className="sub-form-container">
                        <div>
                            <label htmlFor="tension_x_slider">по X (*1e3):</label>
                            <input type="range" id="tension_x_slider" min="-5" max="5" name={"tension_x"} step={0.1}
                                   value={tension.tension_x} onChange={updateTension}/>
                            <span>{tension.tension_x}</span>
                        </div>
                        <div>
                            <label htmlFor="tension_y_slider">по Y (*1e3):</label>
                            <input type="range" id="tension_y_slider" min="-5" max="5" name={"tension_y"} step={0.1}
                                   value={tension.tension_y} onChange={updateTension}/>
                            <span>{tension.tension_y}</span>
                        </div>
                        <div>
                            <label htmlFor="tension_z_slider">по Z (*1e3):</label>
                            <input type="range" id="tension_z_slider" min="-5" max="5" name={"tension_z"} step={0.1}
                                   value={tension.tension_z} onChange={updateTension}/>
                            <span>{tension.tension_z}</span>
                        </div>
                    </div>

                    <div className="time">
                        <h2>Время движения (с):</h2>
                        <input type="range" id="time_slider" min="0.5" max="5" name={"fallenTime"} step={0.1}
                               value={fallenTime} onChange={updateTime}/>
                        <span>{fallenTime}</span>

                    </div>

                    <div className="gravity">
                        <h2>Использовать силу тяжести?</h2>
                        <label>
                            <input
                                type="radio"
                                value="yes"
                                checked={gravity}
                                onChange={handleOptionChange}
                            />
                            <span>Да</span>
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="no"
                                checked={!gravity}
                                onChange={handleOptionChange}
                            />
                            <span>Нет</span>
                        </label>
                    </div>

                    <div className={"buttons"}>
                        <button type="submit" onClick={updateCanvas}>Create</button>
                        <button onClick={e => clearCanvas(e, dispatch, scene, renderer, camera)}>Clear</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ManipulationElectrostaticForm;