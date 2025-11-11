"use client";

import { Button } from "@/components/ui/button";
import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

export const ThemeSwitchButton = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const handleOnClick = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={handleOnClick}
    >
      <SunMoon />
    </Button>
  );
};
