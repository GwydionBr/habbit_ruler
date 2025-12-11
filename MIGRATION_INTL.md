# Internationalization Migration Guide

## Overview

The new internationalization system replaces the old `LocaleContext` with a more modern, scalable architecture that integrates seamlessly with Tanstack Start and Supabase.

## Architecture

### Old System (❌ Deprecated)

- `src/context/LocaleContext.tsx` - React Context with SSR workarounds
- `src/utils/formatFunctions.ts` - Helper functions
- `src/hooks/useFormatter.ts` - Re-export of context hook

**Problems:**

- Next.js-specific SSR workarounds (`"use client"`, `isClient` state)
- No connection to database settings
- Wrapper functions instead of direct Intl API usage
- Poor i18n support

### New System (✅ Current)

```
Database (Supabase)
    ↓
Server Function (getSettings)
    ↓
React Query (useSettings)
    ↓
SettingsSync Component
    ↓
Zustand Store (useUserPreferences)
    ↓
useIntl Hook + Intl Utils
```

**Benefits:**

- ✅ No SSR workarounds needed
- ✅ Automatically synced with database
- ✅ Optimistic updates support
- ✅ Type-safe with database schema
- ✅ Pure functions (easy to test)
- ✅ Native Intl API (better i18n support)
- ✅ Scales to full i18n library later

## Migration Steps

### 1. Replace Hook Usage

**Before:**

```tsx
import { useFormatter } from "@/hooks/useFormatter";

function MyComponent() {
  const { formatDate, formatMoney, locale } = useFormatter();

  return <div>{formatDate(new Date())}</div>;
}
```

**After:**

```tsx
import { useIntl } from "@/hooks/useIntl";

function MyComponent() {
  const { formatDate, formatMoney, locale } = useIntl();

  return <div>{formatDate(new Date())}</div>;
}
```

### 2. Update Settings Changes

**Before:**

```tsx
// Had to update settingsStore manually
const { setLocale } = useSettingsStore();
setLocale("de-DE");
```

**After:**

```tsx
import { useUpdateSettings } from "@/hooks/useUpdateSettings";

function MyComponent() {
  const updateSettings = useUpdateSettings();

  const handleChangeLocale = () => {
    updateSettings.mutate({ locale: "de-DE" });
  };

  return <button onClick={handleChangeLocale}>Change Locale</button>;
}
```

### 3. Remove Old Context Provider

**Before:**

```tsx
<LocaleProvider>
  <App />
</LocaleProvider>
```

**After:**
No provider needed! Just ensure `<SettingsSync />` is mounted in your dashboard layout (already done in `_dashboard.tsx`).

### 4. API Changes

| Old API                         | New API                          | Notes                           |
| ------------------------------- | -------------------------------- | ------------------------------- |
| `formatDate(date)`              | `formatDate(date)`               | Same signature ✅               |
| `formatMonth(month)`            | `formatMonth(month)`             | Same signature ✅               |
| `formatTime(seconds)`           | `formatDuration(seconds)`        | Renamed for clarity             |
| `formatDateTime(date)`          | `formatDateTime(date)`           | Same signature ✅               |
| `formatTimeSpan(start, end)`    | `formatTimeSpan(start, end)`     | Same signature ✅               |
| `formatMoney(amount, currency)` | `formatMoney(amount, currency?)` | Currency is optional now        |
| `getCurrencySymbol(currency)`   | `getCurrencySymbol(currency?)`   | Currency is optional now        |
| `getLocalizedText(de, en)`      | N/A                              | Use proper i18n library instead |

### 5. New Features Available

```tsx
const intl = useIntl();

// Relative time formatting
intl.formatRelativeTime(new Date()); // "2 days ago"

// Date ranges
intl.formatDateRange(start, end); // "Dec 11 - Dec 15, 2024"

// Percentage formatting
intl.formatPercent(0.1234); // "12.34%"

// Number formatting
intl.formatNumber(1234567.89); // "1,234,567.89" or "1.234.567,89"

// Weekday names
intl.getWeekdayName(1); // "Monday" or "Montag"

// Access user preferences
intl.locale; // 'en-US' | 'de-DE'
intl.format24h; // boolean
intl.defaultCurrency; // 'USD' | 'EUR' | ...
```

### 6. Server-Side Formatting

If you need to format on the server (e.g., in a Server Function):

```tsx
import { intlUtils } from "@/hooks/useIntl";

// In a server function
export const generateReport = createServerFn({ method: "GET" }).handler(
  async () => {
    const date = new Date();
    const formatted = intlUtils.formatDate(date, "en-US");
    return formatted;
  }
);
```

## Files to Keep

✅ Keep (new system):

- `src/stores/userPreferencesStore.ts` - Main preferences store
- `src/utils/intl.ts` - Pure formatting utilities
- `src/hooks/useIntl.ts` - Main hook
- `src/hooks/useUpdateSettings.ts` - Settings mutation hook
- `src/components/SettingsSync.tsx` - Sync component
- `src/actions/update-settings.ts` - Server action

## Files to Remove (After Migration Complete)

❌ Remove (old system):

- `src/context/LocaleContext.tsx`
- `src/hooks/useFormatter.ts`
- `src/utils/formatFunctions.ts` (if no other dependencies)

## Testing

See `src/components/examples/IntlExample.tsx` for a complete example of all features.

## Future Enhancements

When you need full i18n (translations, pluralization, etc.), consider:

1. **next-intl** - Modern, works outside Next.js

   ```bash
   bun add next-intl
   ```

2. **@formatjs/intl** - Format.js without React
   ```bash
   bun add @formatjs/intl intl-messageformat
   ```

Both integrate easily with the current `useUserPreferences` store.

## Questions?

Check the example component or ask for help!
