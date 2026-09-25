import React from "react";
import {useTranslation} from "react-i18next";

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <section className="pt-40">
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
                <div className="mx-auto max-w-screen-sm text-center">
                    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-blue-500">404</h1>
                    <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
                        {t('not_found_title')}</p>
                    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
                        {t('not_found_description')}
                    </p>
                    <a href="/"
                       className="inline-flex text-white bg-blue-500  focus:ring-4 focus:outline-none focus:ring-primar font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-500 my-4">
                        {t('not_found_button')}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default NotFound;