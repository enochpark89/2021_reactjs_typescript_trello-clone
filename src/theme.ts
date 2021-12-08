import { DefaultTheme } from "styled-components";

declare module "styled-components" {
    export interface DefaultTheme {
    bgColor: string;
    boardColor: string;
    cardColor: string;
    
    }
}

export const darkTheme: DefaultTheme = {
    bgColor: "#3F8CF2",
    boardColor: "#DADFE9",
    cardColor: "white",
  };