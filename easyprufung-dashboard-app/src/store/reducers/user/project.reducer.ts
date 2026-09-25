import {IActionBase, IProjectState} from "../../models/root.interface";
import {CHANGE_PROJECT_CURRENT_STEP, CHANGE_PROJECT_SELECTION, LIST_PROJECTS} from "../../actions/user/project.actions";

const initialState: IProjectState = {
    selectedProject: null,
    projects: [],
    currentStep: 'project_validation'
};

function projectsReducer(state: IProjectState = initialState, action: IActionBase): IProjectState {
    switch (action.type) {
        case LIST_PROJECTS: {
            return { ...state, projects: action.projects};
        }
        case CHANGE_PROJECT_SELECTION: {
            return { ...state, selectedProject: action.project };
        }

        case CHANGE_PROJECT_CURRENT_STEP: {
            return { ...state, selectedProject: action.project, currentStep: action.currentStep };
        }

        default:
            return state;
    }
}


export default projectsReducer;