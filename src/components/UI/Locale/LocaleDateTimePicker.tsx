import { useIntl } from "@/hooks/useIntl";

import { DateTimePicker, DateTimePickerProps } from "@mantine/dates";

export default function LocaleDateTimePicker({
  label,
  value,
  onChange,
  error,
  ...props
}: DateTimePickerProps) {
  const { locale, format_24h } = useIntl();

  return (
    <DateTimePicker
      valueFormat={
        locale === "de-DE"
          ? `DD. MMMM YYYY ${format_24h ? "HH:mm" : "hh:mm A"}`
          : `MMM DD, YYYY ${format_24h ? "HH:mm" : "hh:mm A"}`
      }
      timePickerProps={{
        format: format_24h ? "24h" : "12h",
      }}
      highlightToday
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      {...props}
    />
  );
}
