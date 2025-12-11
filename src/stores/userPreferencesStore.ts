import { create } from "zustand";
import { Currency, Locale } from "@/types/settings.types";
import { Database } from "@/types/db.types";

// Extract settings type from database
type DBSettings = Database["public"]["Tables"]["settings"]["Row"];

interface UserPreferences {
  // Locale & Formatting
  locale: Locale;
  format24h: boolean;

  // Currency & Finance
  defaultCurrency: Currency;
  defaultFinanceCurrency: Currency;

  // Work Time Settings
  roundingDirection: DBSettings["rounding_direction"];
  roundingAmount: DBSettings["rounding_amount"];
  roundingCustomAmount: number;
  roundingInterval: number;
  roundInTimeSections: boolean;
  timeSectionInterval: number;
  automaticallyStopOtherTimer: boolean;

  // Project Defaults
  defaultSalaryAmount: number;
  defaultGroupColor: string | null;
  defaultProjectHourlyPayment: boolean;

  // Calendar
  showCalendarTime: boolean;

  // UI State
  showChangeCurrencyWindow: boolean | null;

  // Timestamps
  updatedAt: string;
}

interface UserPreferencesActions {
  // Sync from DB
  setPreferences: (settings: DBSettings) => void;

  // Individual setters (for optimistic updates)
  setLocale: (locale: Locale) => void;
  setFormat24h: (format24h: boolean) => void;
  setDefaultCurrency: (currency: Currency) => void;
  setDefaultFinanceCurrency: (currency: Currency) => void;
  setRoundingDirection: (direction: DBSettings["rounding_direction"]) => void;
  setShowCalendarTime: (show: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState: UserPreferences = {
  locale: "en-US",
  format24h: true,
  defaultCurrency: "USD",
  defaultFinanceCurrency: "USD",
  roundingDirection: "up",
  roundingAmount: "min",
  roundingCustomAmount: 5,
  roundingInterval: 1,
  roundInTimeSections: false,
  timeSectionInterval: 10,
  automaticallyStopOtherTimer: true,
  defaultSalaryAmount: 0,
  defaultGroupColor: "#12b886",
  defaultProjectHourlyPayment: true,
  showCalendarTime: false,
  showChangeCurrencyWindow: null,
  updatedAt: new Date().toISOString(),
};

export const useUserPreferences = create<
  UserPreferences & UserPreferencesActions
>((set) => ({
  ...initialState,

  setPreferences: (settings: DBSettings) =>
    set({
      locale: settings.locale,
      format24h: settings.format_24h,
      defaultCurrency: settings.default_currency,
      defaultFinanceCurrency: settings.default_finance_currency,
      roundingDirection: settings.rounding_direction,
      roundingAmount: settings.rounding_amount,
      roundingCustomAmount: settings.rounding_custom_amount,
      roundingInterval: settings.rounding_interval,
      roundInTimeSections: settings.round_in_time_sections,
      timeSectionInterval: settings.time_section_interval,
      automaticallyStopOtherTimer: settings.automaticly_stop_other_timer,
      defaultSalaryAmount: settings.default_salary_amount,
      defaultGroupColor: settings.default_group_color,
      defaultProjectHourlyPayment: settings.default_project_hourly_payment,
      showCalendarTime: settings.show_calendar_time,
      showChangeCurrencyWindow: settings.show_change_curreny_window,
      updatedAt: settings.updated_at,
    }),

  setLocale: (locale) => set({ locale }),
  setFormat24h: (format24h) => set({ format24h }),
  setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
  setDefaultFinanceCurrency: (currency) =>
    set({ defaultFinanceCurrency: currency }),
  setRoundingDirection: (direction) => set({ roundingDirection: direction }),
  setShowCalendarTime: (show) => set({ showCalendarTime: show }),

  reset: () => set(initialState),
}));
