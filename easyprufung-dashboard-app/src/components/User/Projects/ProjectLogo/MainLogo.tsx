import { useContext, useState } from "react";
import {FormLogoContext, FormLogoState} from "./context/logo-context.tsx";
import {Card} from "../../../../common/components/Card.tsx";
import {IProject} from "../../../../store/models/user/project/project.interface.ts";
import ChooseLogo from "./ChooseLogo.tsx";
import GenerateLogo from "./GenerateLogo.tsx";
import EditorLogo from "./EditorLogo.tsx";
import {IProjectState, IStateType} from "../../../../store/models/root.interface.ts";
import {useSelector} from "react-redux";


const FormStateComponent = () => {
    const formLogoContext = useContext(FormLogoContext);
    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject | null = projectState.selectedProject;
    if(project && project.logoUrl && project.logoUrl.length >1)
        return <EditorLogo />;

    switch (formLogoContext.name) {
        case "editor":
            return <EditorLogo />;
        case "choose":
            return <ChooseLogo />;
        case "generate":
            return <GenerateLogo />;
        default:
            return <></>;
    }
};

export default function MainLogo(){
    const [state, setState] = useState<FormLogoState>({
        name: "choose",
        setState: () => {},
    });

    return (
        <FormLogoContext.Provider
            value={{
                ...state,
                setState: (partial) => {
                    setState((prev) => ({ ...prev, ...partial }));
                },
            }}
        >
            <Card className="h-full">
                <FormStateComponent />
            </Card>
        </FormLogoContext.Provider>
    );
};