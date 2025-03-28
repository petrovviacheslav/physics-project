import {useState} from "react";
import DrawElectrostatic from "./DrawElectrostatic";
import {clearPositions, clearVelocity} from "../../store/dataSlice";
import {useDispatch} from "react-redux";
import {clearCanvas} from "../../util/addsToScene";


const ManipulationElectrostaticForm = ({scene, camera, renderer}) => {
    const dispatch = useDispatch();

    const initialParticles = [
        { position_x: 0, position_y: 0, position_z: 1, velocity_x: 1, velocity_y: 1, velocity_z: 1, discharge: 1 },
        { position_x: 0, position_y: 0, position_z: 1, velocity_x: 1, velocity_y: 1, velocity_z: 1, discharge: 1 },
        { position_x: 0, position_y: 0, position_z: 1, velocity_x: 1, velocity_y: 1, velocity_z: 1, discharge: 1 },
    ];
    const [particles, setParticles] = useState(initialParticles);
    const [tension, setTension] = useState({ tension_x: 1, tension_y: 1, tension_z: 1 });
    const [gravity, setGravity] = useState(false);
    // const [fallenTime, setFallenTime] = useState(2);

    const updateParticleField = (index, field, value) => {
        const updatedParticles = particles.map((particle, i) => {
            if (i === index) {
                return { ...particle, [field]: parseFloat(value) };
            }
            return particle;
        });
        setParticles(updatedParticles);
    };

    const updateTension = (e) => {
        const {name, value} = e.target;
        setTension(prevData => ({
            ...prevData,
            [name]: value,
        }));

    };

    const handleOptionChange = (event) => {
        setGravity(event.target.value === "yes");
    };

    // const updateTime = (e) => {
    //     setFallenTime(e.target.value);
    // };

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
        // DrawElectrostatic(position, velocity, tension, gravity, fallenTime, scene, camera, renderer, dispatch);
        // DrawElectrostatic(particles, tension, gravity, fallenTime, scene, camera, renderer, dispatch);
        DrawElectrostatic(particles, tension, gravity, 5, scene, camera, renderer, dispatch);
    };

    return (
        <div className="manipulation-electrostatic-form">
            <form onSubmit={(e) => e.preventDefault()}>
                <table>
                    <thead>
                    <tr>
                        <th className="first-cell">Параметр</th>
                        <th className="first-cell">Частица 1</th>
                        <th className="first-cell">Частица 2</th>
                        <th className="first-cell">Частица 3</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Координата X</td>
                        {particles.map((particle, index) => (
                            <td key={`px-${index}`}>
                                <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.1"
                                    name="position_x"
                                    value={particle.position_x}
                                    onChange={(e) => updateParticleField(index, "position_x", e.target.value)}
                                />
                                <span>{particle.position_x}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Координата Y</td>
                        {particles.map((particle, index) => (
                            <td key={`py-${index}`}>
                                <input
                                    type="range"
                                    min="-1"
                                    max="1"
                                    step="0.1"
                                    name="position_y"
                                    value={particle.position_y}
                                    onChange={(e) => updateParticleField(index, "position_y", e.target.value)}
                                />
                                <span>{particle.position_y}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Координата Z</td>
                        {particles.map((particle, index) => (
                            <td key={`pz-${index}`}>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.1"
                                    name="position_z"
                                    value={particle.position_z}
                                    onChange={(e) => updateParticleField(index, "position_z", e.target.value)}
                                />
                                <span>{particle.position_z}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Заряд (*1e-9)</td>
                        {particles.map((particle, index) => (
                            <td key={`discharge-${index}`}>
                                <input
                                    type="range"
                                    min="-20"
                                    max="20"
                                    step="0.1"
                                    name="discharge"
                                    value={particle.discharge}
                                    onChange={(e) => updateParticleField(index, "discharge", e.target.value)}
                                />
                                <span>{particle.discharge}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Скорость по X</td>
                        {particles.map((particle, index) => (
                            <td key={`vx-${index}`}>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    name="velocity_x"
                                    value={particle.velocity_x}
                                    onChange={(e) => updateParticleField(index, "velocity_x", e.target.value)}
                                />
                                <span>{particle.velocity_x}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Скорость по Y</td>
                        {particles.map((particle, index) => (
                            <td key={`vy-${index}`}>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    name="velocity_y"
                                    value={particle.velocity_y}
                                    onChange={(e) => updateParticleField(index, "velocity_y", e.target.value)}
                                />
                                <span>{particle.velocity_y}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Скорость по Z</td>
                        {particles.map((particle, index) => (
                            <td key={`vz-${index}`}>
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    name="velocity_z"
                                    value={particle.velocity_z}
                                    onChange={(e) => updateParticleField(index, "velocity_z", e.target.value)}
                                />
                                <span>{particle.velocity_z}</span>
                            </td>
                        ))}
                    </tr>
                    </tbody>
                </table>

                <h2>Вектор напряжённости поля:</h2>
                <table className="vector-table">
                    <thead>
                    <tr>
                        <th className="first-cell">Координата</th>
                        <th className="first-cell">По X (*1e3)</th>
                        <th className="first-cell">По Y (*1e3)</th>
                        <th className="first-cell">По Z (*1e3)</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="first-cell">Напряжённость</td>
                        <td className="first-cell">
                            <input type="range" id="tension_x_slider" min="-5" max="5" name={"tension_x"} step={0.1}
                                   value={tension.tension_x} onChange={updateTension}/>
                            <span>{tension.tension_x}</span>
                        </td>
                        <td className="first-cell">
                            <label htmlFor="tension_y_slider">по Y (*1e3):</label>
                            <input type="range" id="tension_y_slider" min="-5" max="5" name={"tension_y"} step={0.1}
                                   value={tension.tension_y} onChange={updateTension}/>
                            <span>{tension.tension_y}</span>
                        </td>
                        <td className="first-cell">
                            <label htmlFor="tension_z_slider">по Z (*1e3):</label>
                            <input type="range" id="tension_z_slider" min="-5" max="5" name={"tension_z"} step={0.1}
                                   value={tension.tension_z} onChange={updateTension}/>
                            <span>{tension.tension_z}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div className="tension">

                    {/*<div className="sub-form-container">*/}
                    {/*    <div>*/}
                    {/*        <label htmlFor="tension_x_slider">по X (*1e3):</label>*/}
                    {/*        <input type="range" id="tension_x_slider" min="-5" max="5" name={"tension_x"} step={0.1}*/}
                    {/*               value={tension.tension_x} onChange={updateTension}/>*/}
                    {/*        <span>{tension.tension_x}</span>*/}
                    {/*    </div>*/}
                    {/*    <div>*/}
                    {/*        <label htmlFor="tension_y_slider">по Y (*1e3):</label>*/}
                    {/*        <input type="range" id="tension_y_slider" min="-5" max="5" name={"tension_y"} step={0.1}*/}
                    {/*               value={tension.tension_y} onChange={updateTension}/>*/}
                    {/*        <span>{tension.tension_y}</span>*/}
                    {/*    </div>*/}
                    {/*    <div>*/}
                    {/*        <label htmlFor="tension_z_slider">по Z (*1e3):</label>*/}
                    {/*        <input type="range" id="tension_z_slider" min="-5" max="5" name={"tension_z"} step={0.1}*/}
                    {/*               value={tension.tension_z} onChange={updateTension}/>*/}
                    {/*        <span>{tension.tension_z}</span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/*/!*<div className="time">*!/*/}
                    {/*/!*    <h2>Время движения (с):</h2>*!/*/}
                    {/*/!*    <input type="range" id="time_slider" min="0.5" max="5" name={"fallenTime"} step={0.1}*!/*/}
                    {/*/!*           value={fallenTime} onChange={updateTime}/>*!/*/}
                    {/*/!*    <span>{fallenTime}</span>*!/*/}
                    {/*/!*</div>*!/*/}

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
    );
};

export default ManipulationElectrostaticForm;