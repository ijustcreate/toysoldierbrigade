import type { LanternState, ScreenId } from "./types";

export function nextDisplayNumber(screens: LanternState["screens"]): number {
  return Object.keys(screens).reduce((highest, id) => Math.max(highest, Number(/^display-(\d+)$/.exec(id)?.[1]) || 0), 0) + 1;
}

/** Called only after the operator confirms removal; retain reusable content. */
export function removeConfiguredDisplay(state: LanternState, id: ScreenId): LanternState {
  if (!state.screens[id] || Object.keys(state.screens).length <= 1) return state;
  const screens = { ...state.screens };
  delete screens[id];
  const boardOpenOwners = { ...state.boardOpenOwners };
  delete boardOpenOwners[id];
  return {
    ...state,
    screens,
    boardOpenOwners,
    schedules: state.schedules.filter((entry) => entry.target !== id)
  };
}
