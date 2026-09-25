import { createContext } from "react";

export type FormLogoValues = {
    name: string;
    primaryColor: string;
    backgroundColor: string;
    style: string;
    description: string;
};

export type FormLogoStateName =
    | "editor"
    | "choose"
    | "generate";

export type FormLogoState = {
    name: FormLogoStateName;
    setState: (partial: Partial<FormLogoState>) => void;
};

export const FormLogoContext = createContext<FormLogoState>({
    name: "choose",
    setState: () => {},
});