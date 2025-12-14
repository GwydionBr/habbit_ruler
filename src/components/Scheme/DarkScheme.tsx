import { forwardRef } from "react";
import { IconMoonStars, IconProps } from "@tabler/icons-react";
import { ActionIcon, HoverCard, Text, MantineColor } from "@mantine/core";

import classes from "./Scheme.module.css";

interface DarkSchemeActionIconProps {
  onClick?: () => void;
  active?: boolean;
  navbarMode?: boolean;
  color?: MantineColor;
}

export function DarkSchemeButton({
  onClick,
  active,
  navbarMode,
  color,
}: DarkSchemeActionIconProps) {
  return (
    <HoverCard
      width={60}
      position={navbarMode ? "right" : "top"}
      withArrow
      shadow="md"
      openDelay={500}
    >
      <HoverCard.Target>
        <DarkSchemeActionIcon
          onClick={onClick}
          active={active}
          navbarMode={navbarMode}
          color={color ?? "var(--mantine-primary-color-4)"}
        />
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs">{navbarMode ? "Light Mode" : "Dark Mode"}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export const DarkSchemeActionIcon = forwardRef<
  HTMLButtonElement,
  DarkSchemeActionIconProps
>(({ onClick, active, navbarMode, color }, ref) => {
  return (
    <ActionIcon
      ref={ref}
      onClick={onClick}
      variant={navbarMode ? "subtle" : "default"}
      size="xl"
      aria-label="Select dark scheme"
      bg={navbarMode ? "" : "var(--mantine-color-dark-6)"}
      className={active ? classes.activeButton : ""}
    >
      <DarkSchemeIcon color={color} stroke={1.5} />
    </ActionIcon>
  );
});

export function DarkSchemeIcon(props: IconProps) {
  return <IconMoonStars {...props} />;
}
