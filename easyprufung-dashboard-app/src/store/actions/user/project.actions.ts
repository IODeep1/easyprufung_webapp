import {IProject} from "../../models/user/project/project.interface";
export const LIST_PROJECTS: string = "LIST_PROJECTS";
export const CHANGE_PROJECT_SELECTION: string = "CHANGE_PROJECT_SELECTION";
export const CHANGE_PROJECT_CURRENT_STEP: string = "CHANGE_PROJECT_CURRENT_STEP";

export function loadProjectsList (projects: IProject[]): IGetProjectListActionType {
    return { type: LIST_PROJECTS, projects: projects };
}

export function changeSelectedProject(project: IProject): IChangeSelectedProjectActionType {
    return { type: CHANGE_PROJECT_SELECTION, project: project };
}

export function changeProjectCurrentStep(project: IProject, currentStep :String): IChangeProjectCurrentStepActionType {
    return { type: CHANGE_PROJECT_CURRENT_STEP, project: project, currentStep: currentStep  };
}

interface IGetProjectListActionType{ type: string, projects: IProject[] };
interface IChangeSelectedProjectActionType{ type: string, project: IProject };
interface IChangeProjectCurrentStepActionType{ type: string, project: IProject, currentStep: String };


