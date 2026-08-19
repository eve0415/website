const MODULUS = 2_147_483_647;

/**
 * The original scattered stars with `Math.random()`, which renders a different
 * field on the server than on the client and so cannot survive hydration. This
 * is a Lehmer generator (MINSTD): pure, seedable, and — unlike mulberry32 —
 * free of the bitwise operators this repo's lint config rejects. `state *
 * 16807` peaks around 3.6e13, well inside the exactly-representable integer
 * range, so server and client agree bit for bit.
 */
export const seededRandom = (seed: number) => {
  let state = Math.trunc(seed) % MODULUS;
  if (state <= 0) state += MODULUS - 1;
  return () => {
    state = (state * 16_807) % MODULUS;
    return (state - 1) / (MODULUS - 1);
  };
};
