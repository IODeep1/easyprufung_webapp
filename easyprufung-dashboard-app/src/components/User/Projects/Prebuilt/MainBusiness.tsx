import React, {Dispatch, useEffect, useState} from "react";
import { useParams } from 'react-router-dom';
import { IProjectState, IStateType } from "../../../../store/models/root.interface";
import {useDispatch, useSelector} from "react-redux";
import { IProject } from "../../../../store/models/user/project/project.interface";
import { changeProjectCurrentStep, changeSelectedProject } from "../../../../store/actions/user/project.actions";
import {getProject} from "../../../../api/project/api-helper.ts";
import Stepper from "../Step.tsx";
import Loading from "../../../Shared/Loading.tsx";
import BusinessLaunch from "./BusinessLaunch.tsx";


const MainBusiness = () => {
    const { id } = useParams();
    const dispatch: Dispatch<any> = useDispatch();

    const steps = [ "Publish"];
    const stepTags = [ "project_launch"];
    const [stepIndex, setStepIndex] = useState(0);
    const icons = [
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-rocket-icon lucide-rocket\"><path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\"/><path d=\"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z\"/><path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0\"/><path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\"/></svg>",
    ];

    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject | null = projectState.selectedProject;

    const handleStepSelect = (step) => {
        if(project == null) return ;
        setStepIndex(step);
        dispatch(changeProjectCurrentStep(project, stepTags[step]));
    };


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(id){
            const processApi = async () => {
                setLoading(true);
                project = await getProject(id, dispatch);
                if(project){
                    dispatch(changeSelectedProject(project));
                }
                setLoading(false);
            };
            processApi();
        }
    }, [id]);

    return (
        <div>
            <div className="m-4 text-4xl flex justify-center">
                <Stepper steps={steps} initialStep={stepIndex}  onStepSelect={handleStepSelect} icons={icons} />
            </div>
            <div className="m-4 flex justify-between">

            </div>

            <div className="flex flex-col justify-center px-2 space-x-0 xl:flex-row xl:space-x-4">
                {!(stepIndex == 0 ) ?
                    <div className="flex-wrap mb-4 xl:mb-0 w-full  xl:w-1/3" >
                    </div> : null
                }
                <div className={`flex-wrap w-full ${stepIndex === 0 ? 'xl:w-full' : 'xl:w-2/3'}`}>
                    <BusinessLaunch projectState={projectState}/>
                </div>
            </div>
            {loading && <Loading/> }
        </div>
    );
}

export default MainBusiness;