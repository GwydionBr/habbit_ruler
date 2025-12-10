import { useEffect, useState } from "react";
import { useMantineColorScheme, Menu } from "@mantine/core";
import LightSchemeButton from "./LightSchemeButton";
import DarkSchemeButton from "./DarkSchemeButton";
import SystemSchemeButton from "./SystemSchemeButton";

export default function SchemeToggle() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  const renderCurrentSchemeButton = () => {
    switch (colorScheme) {
      case "dark":
        return (
          <DarkSchemeButton
            onClick={() => {}}
            active={false}
            navbarMode={true}
          />
        );
      case "light":
        return (
          <LightSchemeButton
            onClick={() => {}}
            active={false}
            navbarMode={true}
          />
        );
      case "auto":
        return (
          <SystemSchemeButton
            onClick={() => {}}
            active={false}
            navbarMode={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Menu position="bottom" offset={8}>
      <Menu.Target>{renderCurrentSchemeButton()}</Menu.Target>

      <Menu.Dropdown>
        {colorScheme !== "dark" && (
          <Menu.Item
            onClick={() => setColorScheme("dark")}
            p={0}
            style={{ background: "transparent" }}
          >
            <DarkSchemeButton
              onClick={() => {}}
              active={false}
              navbarMode={true}
            />
          </Menu.Item>
        )}
        {colorScheme !== "light" && (
          <Menu.Item
            onClick={() => setColorScheme("light")}
            p={0}
            style={{ background: "transparent" }}
          >
            <LightSchemeButton
              onClick={() => {}}
              active={false}
              navbarMode={true}
            />
          </Menu.Item>
        )}
        {colorScheme !== "auto" && (
          <Menu.Item
            onClick={() => setColorScheme("auto")}
            p={0}
            style={{ background: "transparent" }}
          >
            <SystemSchemeButton
              onClick={() => {}}
              active={false}
              navbarMode={true}
            />
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
