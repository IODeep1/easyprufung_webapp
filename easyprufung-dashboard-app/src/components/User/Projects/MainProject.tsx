import React, {Dispatch, useEffect, useState} from "react";
import { useParams } from 'react-router-dom';
import MainChat from "../Chat/MainChat";
import {IProjectState, IStateType} from "../../../store/models/root.interface";
import {useDispatch, useSelector} from "react-redux";
import {IProject} from "../../../store/models/user/project/project.interface";
import {
    changeProjectCurrentStep,
    changeSelectedProject,
} from "../../../store/actions/user/project.actions";
import {getProject} from "../../../api/project/api-helper";
import Stepper from "./Step";
import ProjectName from "./ProjectName/ProjectName";
import ProjectValidation from "./ProjectValidation/ProjectValidation";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import LandingPage from "./ProjectLandingPage/LandingPage";
import Loading from "../../Shared/Loading";
import ProjectLaunch from "./ProjectLaunch/ProjectLaunch.tsx";
import MainLogo from "./ProjectLogo/MainLogo.tsx";
import {ProjectProvider} from "./context/ProjectContext.tsx";

const MainProject = () => {
    const { id } = useParams();
    const dispatch: Dispatch<any> = useDispatch();

    const steps = ["Validation", "Name", "Logo", "Landing page", "Launchpad"];
    const stepTags = ["project_validation", "project_name", "project_icon", "project_landingpage", "project_launch"];
    const [stepIndex, setStepIndex] = useState(stepTags.indexOf(localStorage.getItem("current_step") || "project_validation"));
    const icons = ["<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" ><path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"/><path d=\"M9 18h6\"/><path d=\"M10 22h4\"/></svg>",
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" ><path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z\"/><path d=\"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\"/><path d=\"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2\"/><path d=\"M10 6h4\"/><path d=\"M10 10h4\"/><path d=\"M10 14h4\"/><path d=\"M10 18h4\"/></svg>",
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" ><path d=\"M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13\"/><path d=\"m8 6 2-2\"/><path d=\"m18 16 2-2\"/><path d=\"m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17\"/><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/><path d=\"m15 5 4 4\"/></svg>",
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" ><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"M9 21V9\"/></svg>",
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" ><path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\"/><path d=\"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z\"/><path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0\"/><path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\"/></svg>",
    ];

    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject | null = projectState.selectedProject;

    const handleStepSelect = (step) => {
        if(project == null) return ;
        setStepIndex(step);
        localStorage.setItem("current_step", stepTags[step]);
        dispatch(changeProjectCurrentStep(project, stepTags[step]));
    };


    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if(id){
            const processApi = async () => {
                setLoading(true);
                project = await getProject(id, dispatch);
                if(project){
                    const step = localStorage.getItem("current_step") || "project_validation";
                    dispatch(changeProjectCurrentStep(project, step));
                }
                setLoading(false);
            };
            processApi();
        }
    }, [id]);

    return (
        <div>
            <div className="m-4 flex justify-center">
                <Stepper steps={steps} initialStep={stepIndex}  onStepSelect={handleStepSelect} icons={icons} />
            </div>
            <div className="m-4 flex justify-between">
                {
                    (stepIndex !=0) ?
                         <button  onClick={(e) => {handleStepSelect (stepIndex -1);  localStorage.setItem("current_step", stepTags[stepIndex -1]);}}
                                  className="py-3 px-5 flex text-sm font-medium text-center text-black bg-white rounded-lg sm:w-fit hover:bg-gray-200 dark:text-white dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-700">
                             <div className="flex items-center space-x-2">
                                <FaArrowLeft/>
                                <span>Previous</span>
                            </div>
                         </button>
                            : <div></div>

                }
                {stepIndex !=4 &&
                <button onClick={(e) => { handleStepSelect(stepIndex + 1); localStorage.setItem("current_step", stepTags[stepIndex +1]); }}
                        className="py-3 px-5 flex text-sm font-medium text-center text-black bg-white rounded-lg sm:w-fit hover:bg-gray-200 f dark:text-white dark:bg-black dark:hover:bg-gray-800 dark:focus:ring-gray-700">
                    <div className="flex items-center space-x-2">
                        <span>Next</span>
                        <FaArrowRight />
                    </div>
                </button>

                }
            </div>

            <ProjectProvider>
            <div className="flex flex-col justify-center px-2 space-x-0  xl:flex-row xl:space-x-4">
                {!(stepIndex == 2 || stepIndex == 4 ) ?
                    <div className="flex-wrap  w-full order-2 xl:order-1 xl:w-1/3" >
                      <MainChat projectState={projectState}></MainChat>
                    </div> : null
                }
                <div className={`flex-wrap w-full mb-4 xl:mb-0 order-1 xl:order-2 ${stepIndex === 4 ? 'xl:w-full' : 'xl:w-2/3'}`}>
                {stepIndex == 0 && <ProjectValidation  projectState={projectState}/>}
                    {stepIndex == 1 && <ProjectName  projectState={projectState}/>}
                    {stepIndex == 2 && <MainLogo projectState={projectState}/>}
                    {stepIndex == 3 && <LandingPage/>}
                    {stepIndex == 4 && <ProjectLaunch projectState={projectState}/>}
                </div>
            </div>
            </ProjectProvider>
            {loading && <Loading/> }
        </div>
           );
}

export default MainProject;