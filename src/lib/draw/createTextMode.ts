import { TerraDrawPointMode } from "terra-draw";

export const createTextMode = () => {
  return new TerraDrawPointMode({
    modeName: "text",
  });
};
