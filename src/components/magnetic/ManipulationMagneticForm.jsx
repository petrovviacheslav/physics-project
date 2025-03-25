import { useState } from "react";
import { DrawMagnetic } from "./DrawMagnetic";
import { useDispatch } from "react-redux";
import { clearPositions, clearVelocity } from "../../store/dataSlice";
import { clearCanvas } from "../../util/addsToScene";

const ManipulationMagneticForm = ({ scene, camera, renderer }) => {
    const dispatch = useDispatch();

    const initialParticles = [
        { position_x: 0, position_y: 0.5, position_z: 0.1, velocity_x: 1, velocity_y: 0, velocity_z: 1.2, discharge: 1 },
        { position_x: 0, position_y: 0.5, position_z: 0.1, velocity_x: 1, velocity_y: 0, velocity_z: 1.2, discharge: 1 },
        { position_x: 0, position_y: 0.5, position_z: 0.1, velocity_x: 1, velocity_y: 0, velocity_z: 1.2, discharge: 1 },
    ];
    const [particles, setParticles] = useState(initialParticles);
    const [induction, setInduction] = useState({ induction_x: 0, induction_y: 0, induction_z: 2 });
    const [fallenTime, setFallenTime] = useState(5);
    const [addConstructions, setAddConstructions] = useState(true);

    const updateParticleField = (index, field, value) => {
        const updatedParticles = particles.map((particle, i) => {
            if (i === index) {
                return { ...particle, [field]: parseFloat(value) };
            }
            return particle;
        });
        setParticles(updatedParticles);
    };

    const updateInduction = (e) => {
        const { name, value } = e.target;
        setInduction(prevData => ({
            ...prevData,
            [name]: parseFloat(value)
        }));
    };

    const handleConstructionsChange = (event) => {
        setAddConstructions(event.target.value === "yes");
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

        // Передаём массив частиц, а также induction, fallenTime и addConstructions как и прежде.
        DrawMagnetic(particles, induction, fallenTime, addConstructions, scene, camera, renderer, dispatch);
    };

    return (
        <div className="manipulation-magnetic-form">
            <form onSubmit={(e) => e.preventDefault()}>
                <table>
                    <thead>
                    <tr>
                        <th>Параметр</th>
                        <th>Частица 1</th>
                        <th>Частица 2</th>
                        <th>Частица 3</th>
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
                        <td>Заряд (*1e-14)</td>
                        {particles.map((particle, index) => (
                            <td key={`discharge-${index}`}>
                                <input
                                    type="range"
                                    min="-4"
                                    max="4"
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
                        <td>Скорость по X (*1e1)</td>
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
                        <td>Скорость по Y (*1e1)</td>
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
                        <td>Скорость по Z (*1e1)</td>
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

                <div className="induction">
                    <h2>Вектор магнитной индукции:</h2>
                    <div className="sub-form-container">
                        <div>
                            <label htmlFor="induction_x_slider">по X (*1e-1):</label>
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
                        </div>
                        <div>
                            <label htmlFor="induction_y_slider">по Y (*1e-1):</label>
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
                        </div>
                        <div>
                            <label htmlFor="induction_z_slider">по Z (*1e-1):</label>
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
                        </div>
                    </div>
                </div>

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
                    <button type="submit" onClick={updateCanvas}>Create</button>
                    <button onClick={e => clearCanvas(e, dispatch, scene, renderer, camera)}>Clear</button>
                </div>
            </form>
        </div>
    );
};

export default ManipulationMagneticForm;
