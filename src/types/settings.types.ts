import { Database } from "./db.types";

export type RoundingDirection =
  Database["public"]["Enums"]["roundingDirection"];
export type RoundingInTimeSections =
  Database["public"]["Enums"]["timeSectionInterval"];

export type Locale = Database["public"]["Enums"]["locales"];

export type Language = {
  value: Locale;
  label: string;
  flag: string;
};

export type Currency = Database["public"]["Enums"]["currency"];

export type CashFlowType = Database["public"]["Enums"]["cash_flow_type"];
export type FinanceInterval = Database["public"]["Enums"]["finance_interval"];
