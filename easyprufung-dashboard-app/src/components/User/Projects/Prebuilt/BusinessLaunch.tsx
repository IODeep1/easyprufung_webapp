import React, { useState } from "react";
import {Card} from "../../../../common/components/Card.tsx";
import {IProject} from "../../../../store/models/user/project/project.interface.ts";
import AppDetails from "../ProjectLaunch/Details/ProjectDetails.tsx";
import BusinessDetails from "./BusinessDetails.tsx";
import StarterMap from "../../Map/StarterMap.tsx";


// Sidebar
function Sidebar({ selected, onSelect }) {
    return (
        <div className="pt-10 px-4 flex flex-col">
            <h3 className="mb-4 ml-4 text-md font-bold text-gray-900 dark:text-gray-200">
                Dashboard
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
                {/* <!-- Details --> */}
                <li>
                    <button
                        onClick={() => onSelect("details")}
                        className={`w-full group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                            selected === "details" &&
                            'bg-gray-100 dark:bg-gray-800'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        >
                            <rect width="7" height="9" x="3" y="3" rx="1"/>
                            <rect width="7" height="5" x="14" y="3" rx="1"/>
                            <rect width="7" height="9" x="14" y="12" rx="1"/>
                            <rect width="7" height="5" x="3" y="16" rx="1"/>
                        </svg>

                        Business Details
                    </button>
                </li>
                {/* <!-- Details --> */}

                {/* <!-- StarterMap --> */}
                <li>
                    <button
                        onClick={() => onSelect("startermap")}
                        className={`w-full group relative flex items-center gap-2.5 py-2 px-4 rounded-xl font-normal text-gray-700 duration-300 ease-in-out hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 ${
                            selected === "startermap" &&
                            'bg-gray-100 dark:bg-gray-800'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                             stroke-linejoin="round">
                            <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/>
                            <path
                                d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/>
                            <path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/>
                            <circle cx="12" cy="12" r="10"/>
                        </svg>

                        StarterMap
                    </button>
                </li>
                {/* <!-- StarterMap --> */}
            </ul>
        </div>
    );
}


export default function BusinessLaunch({projectState}){
    let project: IProject = projectState.selectedProject;
    const [selected, setSelected] = useState("details");
    const renderSelection = () => {
        switch (selected) {
            case 'details':
                return <BusinessDetails  project={project}/>;
            case 'startermap':
                return <StarterMap showfilter={false} />;

            default:
                return <div>Please select an option</div>;
        }
    };
    return (
        <Card className="bg-white dark:bg-gray-900">
            <div className="bg-white text-black dark:bg-black dark:text-white transition-colors">
                <main className="flex flex-col sm:flex-row w-full sm:min-h-[50vh]">
                    {/* Sidebar */}
                    <aside className="w-full sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-black transition-colors">
                        <Sidebar selected={selected} onSelect={setSelected} />
                    </aside>

                    {/* Content */}
                    <section className="flex-1 w-full px-6 py-6 transition-colors">
                        {renderSelection()}
                    </section>
                </main>
            </div>
        </Card>
    );
}