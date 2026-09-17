export const GAME = Object.freeze({
  TICK_HZ: 20,
  SNAPSHOT_HZ: 15,
  ROUND_SECONDS: 300,
  START_BALANCE: 1000,
  START_QUOTA: 1200,
  PLAYER_MAX_SPEED: 8.5,
  PLAYER_RADIUS: 0.34,
  PLAYER_HEIGHT: 1.7,
  INTERACT_RANGE: 2.35,
  DEFAULT_FOV: 80,
});

export const MACHINE_POSITIONS = Object.freeze({ roulette: [-11, -7], blackjack: [0, -8], plinko: [11, -7] });

export const MACHINES = Object.freeze({
  roulette: { minBet: 10, maxBet: 1000, cooldownMs: 3600 },
  blackjack: { minBet: 10, maxBet: 1000, cooldownMs: 250 },
  plinko: { minBet: 10, maxBet: 1000, cooldownMs: 3800 },
});

export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function money(v) { return Math.max(0, Math.floor(Number(v) || 0)); }
export function validateBet(balance, machine, raw) {
  const cfg = MACHINES[machine];
  if (!cfg) return { ok: false, reason: 'UNKNOWN_MACHINE' };
  const bet = money(raw);
  if (bet < cfg.minBet) return { ok: false, reason: 'BET_TOO_LOW' };
  if (bet > cfg.maxBet) return { ok: false, reason: 'BET_TOO_HIGH' };
  if (bet > balance) return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
  return { ok: true, bet };
}

export function cardValue(cards) {
  let total = 0, aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') { total += 11; aces++; }
    else if (['K','Q','J'].includes(c.rank)) total += 10;
    else total += Number(c.rank);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}
