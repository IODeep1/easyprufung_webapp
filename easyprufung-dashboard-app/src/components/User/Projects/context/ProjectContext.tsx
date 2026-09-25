import React, { createContext, useState } from "react";

export const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [generatingHtml, setGeneratingHtml] = useState(false);

    return (
        <ProjectContext.Provider value={{ generatingHtml, setGeneratingHtml }}>
        {children}
        </ProjectContext.Provider>
);
}