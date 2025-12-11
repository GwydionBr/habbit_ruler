# Internationalization System

Modern, scalable internationalization system for Tanstack Start + Supabase.

## Quick Start

```tsx
import { useIntl } from "@/hooks/useIntl";

function MyComponent() {
  const intl = useIntl();

  return (
    <div>
      <p>Today: {intl.formatDate(new Date())}</p>
      <p>Time: {intl.formatDateTime(new Date())}</p>
      <p>Price: {intl.formatMoney(99.99)}</p>
    </div>
  );
}
```

## Architecture

### Data Flow

```
┌─────────────┐
│  Supabase   │ User settings stored in database
│  Database   │ (locale, currency, format_24h, etc.)
└──────┬──────┘
       │
       │ Server Function (getSettings)
       ↓
┌─────────────┐
│ React Query │ Caches settings, handles refetch
│ useSettings │ queryKey: ['settings']
└──────┬──────┘
       │
       │ SettingsSync component (mounted in _dashboard.tsx)
       ↓
┌─────────────┐
│   Zustand   │ Client-side reactive store
│    Store    │ useUserPreferences
└──────┬──────┘
       │
       │ useIntl hook
       ↓
┌─────────────┐
│ Components  │ Format dates, numbers, money
└─────────────┘
```

### Key Components

1. **Database Layer** (`supabase/migrations/*.sql`)
   - Stores user preferences
   - Columns: `locale`, `format_24h`, `default_currency`, etc.

2. **Server Layer** (`src/actions/get-settings.ts`, `update-settings.ts`)
   - Fetches settings from database
   - Updates settings with validation

3. **Query Layer** (`src/queries/use-settings.ts`)
   - React Query for caching
   - Automatic refetch on window focus

4. **Store Layer** (`src/stores/userPreferencesStore.ts`)
   - Zustand store for reactive state
   - Synced via `SettingsSync` component
   - No persistence (always from DB)

5. **Utilities Layer** (`src/utils/intl.ts`)
   - Pure functions using native Intl API
   - Framework-agnostic
   - SSR-safe

6. **Hook Layer** (`src/hooks/useIntl.ts`)
   - Combines store + utilities
   - User-friendly API

## Usage Examples

### Basic Formatting

```tsx
import { useIntl } from "@/hooks/useIntl";

function Invoice() {
  const intl = useIntl();

  return (
    <div>
      <h1>Invoice</h1>
      <p>Date: {intl.formatDate(new Date())}</p>
      <p>Total: {intl.formatMoney(1234.56)}</p>
      <p>In EUR: {intl.formatMoney(1100, "EUR")}</p>
    </div>
  );
}
```

### Updating Settings

```tsx
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import { useIntl } from "@/hooks/useIntl";

function LanguageSwitcher() {
  const { locale } = useIntl();
  const updateSettings = useUpdateSettings();

  const handleChange = (newLocale: Locale) => {
    updateSettings.mutate({ locale: newLocale });
  };

  return (
    <Select
      value={locale}
      onChange={handleChange}
      data={[
        { value: "en-US", label: "English" },
        { value: "de-DE", label: "Deutsch" },
      ]}
    />
  );
}
```

### Server-Side Formatting

```tsx
import { intlUtils } from "@/hooks/useIntl";
import { createServerFn } from "@tanstack/react-start";

export const generatePDF = createServerFn({ method: "POST" }).handler(
  async ({ locale, amount }) => {
    const formatted = intlUtils.formatMoney(amount, "USD", locale);
    return { formatted };
  }
);
```

### Access User Preferences

```tsx
import { useUserPreferences } from "@/stores/userPreferencesStore";

function MyComponent() {
  // Get specific preferences
  const locale = useUserPreferences((state) => state.locale);
  const format24h = useUserPreferences((state) => state.format24h);

  // Or use useIntl for common ones
  const { locale, format24h, defaultCurrency } = useIntl();

  return <div>Your locale: {locale}</div>;
}
```

## Available Functions

### Date & Time

- `formatDate(date, options?)` - Locale-aware date formatting
- `formatMonth(month)` - Month name (1-12)
- `formatDateTime(date)` - Time with 12h/24h format
- `formatTimeSpan(start, end)` - Time range
- `formatDateRange(start, end)` - Date range
- `formatRelativeTime(date)` - "2 days ago", "in 3 hours"
- `getWeekdayName(dayIndex, format?)` - Weekday names

### Numbers & Money

- `formatMoney(amount, currency?)` - Currency formatting
- `formatFinanceMoney(amount, currency?)` - Uses `default_finance_currency`
- `formatNumber(value, options?)` - Number formatting
- `formatPercent(value, decimals?)` - Percentage formatting
- `getCurrencySymbol(currency?)` - Currency symbol

### Duration

- `formatDuration(seconds)` - "1h 30min", "45min"

## Type Safety

All types are derived from the database schema:

```tsx
import { Locale, Currency } from "@/types/settings.types";

// Locale = "en-US" | "de-DE"
// Currency = "USD" | "EUR" | "GBP" | ...
```

## Testing

```tsx
import { intlUtils } from "@/hooks/useIntl";

describe("Intl formatting", () => {
  it("formats dates correctly", () => {
    const date = new Date("2024-12-11");
    const formatted = intlUtils.formatDate(date, "en-US");
    expect(formatted).toBe("Wed, Dec 11");
  });
});
```

## Performance

- ✅ Pure functions (memoization-friendly)
- ✅ No re-renders from context
- ✅ Zustand selector optimization
- ✅ React Query caching

## SSR Compatibility

Everything is SSR-safe. No client-only code or hydration issues.

```tsx
// Server components can use intlUtils directly
import { intlUtils } from "@/hooks/useIntl";

async function ServerComponent() {
  const data = await fetchData();
  const formatted = intlUtils.formatDate(data.date, "en-US");
  return <div>{formatted}</div>;
}
```

## Future: Full i18n

When you need translations (not just formatting):

**Option 1: next-intl**

```bash
bun add next-intl
```

- Modern, maintained, works outside Next.js
- Type-safe translations
- Integrates with `useUserPreferences` store

**Option 2: @formatjs/intl**

```bash
bun add @formatjs/intl intl-messageformat
```

- Format.js without React dependencies
- ICU message format
- Rich pluralization support

Both can use the existing `locale` from `useUserPreferences`.

## Troubleshooting

**Settings not updating?**

- Check if `<SettingsSync />` is mounted in your layout
- Verify React Query cache is working

**Wrong locale on first render?**

- Settings are loaded in the route loader
- Should be available immediately after navigation

**TypeScript errors?**

- Make sure your `db.types.ts` is up to date
- Run Supabase type generation

## Examples

See `src/components/examples/IntlExample.tsx` for a complete working example.
