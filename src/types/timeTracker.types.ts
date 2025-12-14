import { Currency, RoundingDirection } from "./settings.types";

export enum TimerState {
  Stopped = "stopped",
  Running = "running",
  Paused = "paused",
}

export type TimerRoundingSettings = {
  roundingInterval: number;
  roundingDirection: RoundingDirection;
  roundInTimeFragments: boolean;
  timeFragmentInterval: number;
};

export interface TimerData {
  id: string;
  projectId: string;
  projectTitle: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  userId: string;
  timerRoundingSettings: TimerRoundingSettings;
  state: TimerState;
  activeSeconds: number;
  pausedSeconds: number;
  startTime: number | null;
  tempStartTime: number | null;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  moneyEarned: string;
  activeTime: string;
  roundedActiveTime: string;
  pausedTime: string;
  forceEndTimer: boolean;
  createdAt: number;
  memo: string | null;
}