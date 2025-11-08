import { ReactNode } from "react";
import { ThemeSwitchButton } from "../theme-switch-button/theme-switch-button";

interface Props {
  sidebarTrigger?: ReactNode;
}

export const Header = ({ sidebarTrigger }: Props) => {
  return (
    <div className="p-2 border-b flex items-center h-12 justify-between">
      {sidebarTrigger}
      <ThemeSwitchButton />
    </div>
  );
};
