import {useState} from "react";
import DrawElectrostatic from "./DrawElectrostatic";
import {useDispatch} from "react-redux";
import {clearCanvas} from "../../util/addsToScene";


const ManipulationElectrostaticForm = ({scene, camera, renderer}) => {
    const dispatch = useDispatch();

    const initialParticles = [
        {
            position_x: 0,
            position_y: 0,
            position_z: 1,
            velocity_x: 1,
            velocity_y: 1,
            velocity_z: 1,
            discharge: 1,
            need: false
        },
        {
            position_x: 0,
            position_y: 0,
            position_z: 1,
            velocity_x: 1,
            velocity_y: 1,
            velocity_z: 1,
            discharge: 1,
            need: true
        },
        {
            position_x: 0,
            position_y: 0,
            position_z: 1,
            velocity_x: 1,
            velocity_y: 1,
            velocity_z: 1,
            discharge: 1,
            need: false
        },
    ];
    const [particles, setParticles] = useState(initialParticles);
    const [tension, setTension] = useState({tension_x: 1, tension_y: 1, tension_z: 1});
    const [gravity, setGravity] = useState(false);

    // обновление данных о частицах
    const updateParticleField = (index, field, value) => {
        const updatedParticles = particles.map((particle, i) => {
            if (i === index) {
                if (field === "need") {
                    return {...particle, [field]: value};
                }
                return {...particle, [field]: parseFloat(value)};
            }
            return particle;
        });
        setParticles(updatedParticles);
    };

    // проверка, что сейчас выбрано минимум 2 частицы, чтобы не дать возможность пользователю отказаться от всех частиц
    const checkUseParticles = () => {
        let useParticles = 0;
        particles.map((particle) => {
            if (particle.need) useParticles += 1;
        });
        return useParticles > 1;
    };

    // обновление данных о напряжённости
    const updateTension = (e) => {
        const {name, value} = e.target;
        setTension(prevData => ({
            ...prevData,
            [name]: value,
        }));

    };

    // добавить/убрать использование гравитации
    const handleOptionChange = (event) => {
        setGravity(event.target.value === "yes");
    };

    // обновляем сцену, отрисовывая новые траектории по параметрам
    const updateCanvas = (e) => {
        clearCanvas(e, dispatch, scene, renderer, camera, true);

        DrawElectrostatic(particles, tension, gravity, 1, scene, camera, renderer, dispatch);
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
                        <td>Добавить эту частицу?</td>
                        {particles.map((particle, index) => (
                            <td key={`need-${index}`}>
                                <label>
                                    <input
                                        type="radio"
                                        value="yes"
                                        checked={particle.need}
                                        onChange={(e) => updateParticleField(index, "need", !particle.need)}
                                    />
                                    <span>Да</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="no"
                                        checked={!particle.need}
                                        onChange={(e) => checkUseParticles() && updateParticleField(index, "need", !particle.need)}
                                    />
                                    <span>Нет</span>
                                </label>
                            </td>
                        ))}
                    </tr>
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
                                    disabled={!particle.need}
                                    value={particle.position_x}
                                    onChange={(e) => particle.need && updateParticleField(index, "position_x", e.target.value)}
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
                                    disabled={!particle.need}
                                    value={particle.position_y}
                                    onChange={(e) => particle.need && updateParticleField(index, "position_y", e.target.value)}
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
                                    disabled={!particle.need}
                                    value={particle.position_z}
                                    onChange={(e) => particle.need && updateParticleField(index, "position_z", e.target.value)}
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
                                    disabled={!particle.need}
                                    value={particle.discharge}
                                    onChange={(e) => particle.need && updateParticleField(index, "discharge", e.target.value)}
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
                                    disabled={!particle.need}
                                    value={particle.velocity_x}
                                    onChange={(e) => particle.need && updateParticleField(index, "velocity_x", e.target.value)}
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
                                    disabled={!particle.need}
                                    value={particle.velocity_y}
                                    onChange={(e) => particle.need && updateParticleField(index, "velocity_y", e.target.value)}
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
                                    disabled={!particle.need}
                                    value={particle.velocity_z}
                                    onChange={(e) => particle.need && updateParticleField(index, "velocity_z", e.target.value)}
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
                        <td>Напряжённость</td>
                        <td>
                            <input type="range" id="tension_x_slider" min="-5" max="5" name={"tension_x"} step={0.1}
                                   value={tension.tension_x} onChange={updateTension}/>
                            <span>{tension.tension_x}</span>
                        </td>
                        <td>
                            <input type="range" id="tension_y_slider" min="-5" max="5" name={"tension_y"} step={0.1}
                                   value={tension.tension_y} onChange={updateTension}/>
                            <span>{tension.tension_y}</span>
                        </td>
                        <td>
                            <input type="range" id="tension_z_slider" min="-5" max="5" name={"tension_z"} step={0.1}
                                   value={tension.tension_z} onChange={updateTension}/>
                            <span>{tension.tension_z}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div className="tension">

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
                        <button onClick={e => clearCanvas(e, dispatch, scene, renderer, camera, false)}>Clear</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ManipulationElectrostaticForm;