import { Logo } from "./logo";

export const Header = () => {
  return (
    <div className="flex border-b py-1 px-2 justify-between">
      <Logo />
    </div>
  );
};
