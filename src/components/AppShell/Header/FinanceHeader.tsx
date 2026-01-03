import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useMemo } from "react";
import { useFinanceStore } from "@/stores/financeStore";

import {
  alpha,
  getThemeColor,
  Group,
  Tabs,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCashBanknote,
  IconCurrencyDollar,
  IconRepeat,
  IconReceipt2,
  IconPresentationAnalytics,
  IconDeviceDesktopDollar,
} from "@tabler/icons-react";
import { FinanceTab } from "@/types/finance.types";

export default function FinanceHeader() {
  const { getLocalizedText } = useIntl();
  const { financeColor, primaryColor } = useSettingsStore();
  const theme = useMantineTheme();
  const { activeTab, setActiveTab } = useFinanceStore();

  const backgroundColor = useMemo(() => {
    const fromColor = getThemeColor(primaryColor, theme);
    const toColor = getThemeColor(financeColor, theme);
    return `linear-gradient(135deg, ${alpha(fromColor, 0.4)} 0%, ${alpha(toColor, 0.4)} 100%)`;
  }, [primaryColor, financeColor, theme]);

  return (
    <Group h="100%" w="100%" bg={backgroundColor} wrap="nowrap">
      <Group align="center" gap={0} w={250} justify="center">
        <ThemeIcon
          color="var(--mantine-color-text)"
          size="xl"
          variant="transparent"
        >
          <IconCurrencyDollar />
        </ThemeIcon>
        <Title order={2} c="var(--mantine-color-text)">
          {getLocalizedText("Finanzen", "Finance")}
        </Title>
      </Group>
      <Tabs
        variant="pills"
        color={financeColor}
        defaultValue={activeTab}
        radius="lg"
        w="100%"
        value={activeTab}
        onChange={(value) => setActiveTab(value as FinanceTab)}
      >
        <Tabs.List grow h="100%">
          <Tabs.Tab
            leftSection={<IconCashBanknote color="light-dark(blue, cyan)" />}
            value="Single"
            fz={18}
            fw={500}
          >
            {getLocalizedText("Einzel", "Single")}
          </Tabs.Tab>
          <Tabs.Tab
            leftSection={<IconRepeat color="light-dark(blue, cyan) " />}
            value="Recurring"
            fz={18}
            fw={500}
          >
            {getLocalizedText("Wiederkehrend", "Recurring")}
          </Tabs.Tab>
          <Tabs.Tab
            value="Projects"
            fz={18}
            fw={500}
            leftSection={
              <IconDeviceDesktopDollar color="light-dark(blue, cyan)" />
            }
          >
            {getLocalizedText("Projekte", "Projects")}
          </Tabs.Tab>
          <Tabs.Tab
            leftSection={<IconReceipt2 color="light-dark(blue, cyan)" />}
            value="Payout"
            fz={18}
            fw={500}
          >
            {getLocalizedText("Auszahlung", "Payout")}
          </Tabs.Tab>
          <Tabs.Tab
            leftSection={
              <IconPresentationAnalytics color="light-dark(blue, cyan)" />
            }
            value="Analysis"
            fz={18}
            fw={500}
          >
            {getLocalizedText("Analyse", "Analysis")}
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </Group>
  );
}
