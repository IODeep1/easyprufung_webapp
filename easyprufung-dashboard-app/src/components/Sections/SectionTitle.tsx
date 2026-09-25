import React from "react";
import Container from "../Shared/Container";

const SectionTitle = (props) => {
    return (
        <Container
            className={`flex w-full flex-col mt-4 ${
                props.align === "left" ? "" : "items-center justify-start text-center"
            }`}>
            {props.pretitle && (
                <div className="text-xl font-bold tracking-wider text-blue-600 uppercase">
                    {props.pretitle}
                </div>
            )}

            {props.title && (
                props.bigTitle ?
                    <h2 className="max-w-2xl mt-3 text-6xl font-bold leading-snug tracking-tight text-gray-800 lg:leading-tight lg:text-8xl dark:text-white">
                        {props.title}
                    </h2>:
                    <h2 className="max-w-2xl mt-3 text-3xl font-bold leading-snug tracking-tight text-gray-800 lg:leading-tight lg:text-5xl dark:text-white">
                        {props.title}
                    </h2>

            )}

            {props.children && (
                <p className="max-w-2xl py-4 text-lg leading-normal text-gray-500 lg:text-xl xl:text-xl dark:text-gray-300">
                    {props.children}
                </p>
            )}
        </Container>
    );
}

export default SectionTitle;