

export function calculateCoulombForceForAllParticles(n, r0_arr, q_arr, curr_a_arr, m){
    const r_between01 = calc_r_between(r0_arr[0], r0_arr[1]);
    const len_force01 = calc_force_kulona(q_arr[0], q_arr[1], r_between01);
    const force01 = r0_arr[0].clone().sub(r0_arr[1].clone()).normalize().multiplyScalar(len_force01);

    // вектор force01 изначально направлен так: 1 -> 0 ->
    // значит если заряды одноимённые, то для 0-ой частицы вектор верный, а для 1-й его надо развернуть
    // если же заряды разноимённые, то вектора надо просто развернуть
    // аналогично для остальных сил и частиц
    // console.debug("len = " + len_force01);
    curr_a_arr[0].add(force01.clone().divideScalar(m * Math.sign(q_arr[0] * q_arr[1])));
    curr_a_arr[1].add(force01.clone().divideScalar(-m * Math.sign(q_arr[0] * q_arr[1])));

    if (n === 3) {
        const r_between12 = calc_r_between(r0_arr[1], r0_arr[2]);
        const len_force12 = calc_force_kulona(q_arr[1], q_arr[2], r_between12);
        const force12 = r0_arr[1].clone().sub(r0_arr[2].clone()).normalize().multiplyScalar(len_force12);

        curr_a_arr[1].add(force12.clone().divideScalar(m * Math.sign(q_arr[1] * q_arr[2])));
        curr_a_arr[2].add(force12.clone().divideScalar(-m * Math.sign(q_arr[1] * q_arr[2])));

        const r_between02 = calc_r_between(r0_arr[0], r0_arr[2]);
        const len_force02 = calc_force_kulona(q_arr[0], q_arr[2], r_between02);
        const force02 = r0_arr[0].clone().sub(r0_arr[2].clone()).normalize().multiplyScalar(len_force02);

        curr_a_arr[0].add(force02.clone().divideScalar(m * Math.sign(q_arr[0] * q_arr[2])));
        curr_a_arr[2].add(force02.clone().divideScalar(-m * Math.sign(q_arr[0] * q_arr[2])));
    }

    return curr_a_arr;

}

function calc_force_kulona(q1, q2, r_between) {
    if (r_between === 0) r_between = 0.0001;
    return (9 * 10e9) * Math.abs(q1 * q2) / (r_between * r_between)
}

function calc_r_between(pos1, pos2) {
    return pos1.clone().sub(pos2).length()
}
