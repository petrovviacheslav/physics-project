import {useState} from "react";
import {DrawMagnetic} from "./DrawMagnetic";
import {useDispatch} from "react-redux";
import {clearCanvas} from "../../util/addsToScene";

const ManipulationMagneticForm = ({scene, camera, renderer}) => {
    const dispatch = useDispatch();

    const initialParticles = [
        {
            position_x: 0,
            position_y: 0.5,
            position_z: 0.1,
            velocity_x: 1,
            velocity_y: 0,
            velocity_z: 1.2,
            discharge: 1,
            need: true,
        },
        {
            position_x: 0,
            position_y: 0.5,
            position_z: 0.1,
            velocity_x: 1,
            velocity_y: 0,
            velocity_z: 1.2,
            discharge: 1,
            need: false,
        },
        {
            position_x: 0,
            position_y: 0.5,
            position_z: 0.1,
            velocity_x: 1,
            velocity_y: 0,
            velocity_z: 1.2,
            discharge: 1,
            need: false,
        },
    ];
    const [particles, setParticles] = useState(initialParticles);
    const [induction, setInduction] = useState({
        induction_x: 0,
        induction_y: 0,
        induction_z: 2
    });

    const [addConstructions, setAddConstructions] = useState(true);

    // обновление данных о частицах
    const updateParticleField = (index, field, value) => {
        const updatedParticles = particles.map((particle, i) => {
            if (i === index) {
                if (field === "need") {
                    return {...particle, [field]: value};
                }

                if (field === "discharge" && Math.abs(parseFloat(value)) < 0.1) {
                    return {...particle, [field]: 0.1};
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

    // обновление данных о векторе магнитной индукции
    const updateInduction = (e) => {
        const {name, value} = e.target;
        setInduction(prevData => ({
            ...prevData,
            [name]: parseFloat(value)
        }));
    };

    // обновление информации о том, нужны ли дополнительные построения (убрать??)
    const handleConstructionsChange = (event) => {
        setAddConstructions(event.target.value === "yes");
    };

    // обновляем сцену, отрисовывая новые траектории по параметрам
    const updateCanvas = (e) => {
        clearCanvas(e, dispatch, scene, renderer, camera, true);

        DrawMagnetic(particles, induction, 1, addConstructions, scene, camera, renderer, dispatch);
    };

    return (
        <div className="manipulation-magnetic-form">
            <form onSubmit={(e) => e.preventDefault()}>
                {/* Таблица с параметрами частиц */}
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
                                    onChange={(e) =>
                                        particle.need && updateParticleField(index, "position_x", e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        particle.need && updateParticleField(index, "position_y", e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        particle.need && updateParticleField(index, "position_z", e.target.value)
                                    }
                                />
                                <span>{particle.position_z}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Заряд (*1e-14)</td>
                        {particles.map((particle, index) => (
                            <td key={`discharge-${index}`}>
                                <input
                                    type="range"
                                    min="-4"
                                    max="4"
                                    step="0.1"
                                    name="discharge"
                                    disabled={!particle.need}
                                    value={particle.discharge}
                                    onChange={(e) =>
                                        particle.need && updateParticleField(index, "discharge", e.target.value)
                                    }
                                />
                                <span>{particle.discharge}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Скорость по X (*1e1)</td>
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
                                    onChange={(e) =>
                                        particle.need && updateParticleField(index, "velocity_x", e.target.value)
                                    }
                                />
                                <span>{particle.velocity_x}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Скорость по Y (*1e1)</td>
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
                                    onChange={(e) =>
                                        particle.need && updateParticleField(index, "velocity_y", e.target.value)
                                    }
                                />
                                <span>{particle.velocity_y}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td>Скорость по Z (*1e1)</td>
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
                                    onChange={(e) =>
                                        particle.need && updateParticleField(index, "velocity_z", e.target.value)
                                    }
                                />
                                <span>{particle.velocity_z}</span>
                            </td>
                        ))}
                    </tr>
                    </tbody>
                </table>

                {/* Отдельная таблица для магнитной индукции */}
                <h2>Вектор магнитной индукции:</h2>
                <table className="vector-table">
                    <thead>
                    <tr>
                        <th className="first-cell">Координата</th>
                        <th className="first-cell">По X (*1e-1)</th>
                        <th className="first-cell">По Y (*1e-1)</th>
                        <th className="first-cell">По Z (*1e-1)</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Индукция</td>
                        <td>
                            <input
                                type="range"
                                id="induction_x_slider"
                                min="-5"
                                max="5"
                                step="0.1"
                                name="induction_x"
                                value={induction.induction_x}
                                onChange={updateInduction}
                            />
                            <span>{induction.induction_x}</span>
                        </td>
                        <td>
                            <input
                                type="range"
                                id="induction_y_slider"
                                min="-5"
                                max="5"
                                step="0.1"
                                name="induction_y"
                                value={induction.induction_y}
                                onChange={updateInduction}
                            />
                            <span>{induction.induction_y}</span>
                        </td>
                        <td>
                            <input
                                type="range"
                                id="induction_z_slider"
                                min="-5"
                                max="5"
                                step="0.1"
                                name="induction_z"
                                value={induction.induction_z}
                                onChange={updateInduction}
                            />
                            <span>{induction.induction_z}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>

                <div className="addConstructions">
                    <h2>Добавить промежуточные построения?</h2>
                    <label>
                        <input
                            type="radio"
                            value="yes"
                            checked={addConstructions}
                            onChange={handleConstructionsChange}
                        />
                        <span>Да</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="no"
                            checked={!addConstructions}
                            onChange={handleConstructionsChange}
                        />
                        <span>Нет</span>
                    </label>
                </div>

                <div className="buttons">
                    <button type="submit" onClick={updateCanvas}>
                        Create
                    </button>
                    <button onClick={(e) => clearCanvas(e, dispatch, scene, renderer, camera, false)}>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManipulationMagneticForm;
