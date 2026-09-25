import React, { useEffect, useState } from "react";

const Step = ({ svgIcon, isActive, onClick }) => {
    return (
        <div className="flex items-center space-x-2" onClick={onClick}>
            <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold cursor-pointer 
                ${isActive ? "bg-black text-white" : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"} 
                transition-all`}
            >
                <span
                    className={`w-6 h-6`}
                    dangerouslySetInnerHTML={{ __html: svgIcon }} // Render the raw SVG content
                />
            </div>
        </div>
    );
};

const Stepper = ({ steps, initialStep, onStepSelect, icons }) => {
    const [currentStep, setCurrentStep] = useState(initialStep);

    useEffect(() => {
        setCurrentStep(initialStep); // Update currentStep whenever initialStep changes
    }, [initialStep]); // Only re-run if initialStep changes

    const handleStepClick = (stepIndex) => {
        setCurrentStep(stepIndex);
        if (onStepSelect) {
            onStepSelect(stepIndex); // Inform the parent about the selected step
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-4">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <Step
                        onClick={() => handleStepClick(index)}
                        svgIcon={icons[index]} // Pass the raw SVG content
                        isActive={index === currentStep} // Add onClick handler
                    />
                    <div
                        onClick={() => handleStepClick(index)}
                        className={`cursor-pointer font-semibold text-center ${index === currentStep ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-400"}`}
                    >
                        {step}
                    </div>
                    {index !== steps.length - 1 && (
                        <div
                            className="hidden sm:block ml-2 mr-2 w-20 h-0.5 bg-gray-400 dark:bg-gray-600"
                        ></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Stepper;
