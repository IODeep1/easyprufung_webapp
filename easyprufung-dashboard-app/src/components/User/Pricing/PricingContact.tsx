import React, {FormEvent, useState} from "react";
import Container from "../../Shared/Container";
import PricingIMG from "../../../images/shared/pricing.png";
import {OnChangeModel} from "../../../common/types/Form.types";
import {requestCreateContactForm} from "../../../api/contact/contact-api-helper";
import {IContact} from "../../../store/models/contact.interface";
import {useTranslation} from "react-i18next";
import TextAreaInput from "../../../common/components/TextAreaInput";
import TextInput from "../../../common/components/TextInput";

const PricingContact = () => {
    let contactForm: IContact;
    const { t } = useTranslation();
    const [popup, setPopup] = useState(false);
    const [error, setError] = useState('');
    const [selectedButton, setSelectedButton] = useState(0);
    const [formState, setFormState] = useState({
        firstName: { error: "", value: "" },
        lastName: { error: "", value: "" },
        email: { error: "", value: "" },
        message: { error: "", value: "" },
    });

    function hasFormValueChanged(model: OnChangeModel): void {
        setFormState({ ...formState, [model.field]: { error: model.error, value: model.value } });
    }


    //actions
    async function sendContactForm(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        if(selectedButton ===0 ){
            setError('Please select one option before submitting.');
            return ;
        }
        const newContactForm ={
            ...contactForm,
            firstname: formState.firstName.value,
            lastname: formState.lastName.value,
            email: formState.email.value,
            message: formState.message.value,
            budget: (selectedButton == 1 ? "$2.5K to $10K" : "Over $10K"),
            type: "pricing-contact-form"
        };
        setPopup(true);
        await requestCreateContactForm(newContactForm);
    }

    return (
        <>
            <section>
                <div className="flex flex-wrap lg:gap-10 lg:flex-nowrap ">
                    <div className="flex flex-wrap items-center justify-center w-full lg:w-1/2">
                        <div className="relative mt-6">
                            <img
                                src={PricingIMG}
                                alt=""
                                className="block"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center w-full lg:w-1/2 ">
                        <div className="flex flex-col xl:flex-row gap-4 xl:gap-8">
                            <div className="px-4 mx-auto max-w-screen-md">
                                <h2 className="text-4xl font-bold leading-snug tracking-tight text-gray-800 lg:text-4xl lg:leading-tight xl:text-5xl xl:leading-tight dark:text-white">Need a custom exam-preparation plan?
                                </h2>
                                <p className="py-5 mb-8 font-light text-gray-500 dark:text-gray-400 sm:text-xl">Tell us about your language school, course, organization, or learner group and the German exams you want to prepare for.
                                </p>
                                <form onSubmit={sendContactForm} className="space-y-8">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="message" className="block mb-2 text-lg font-semibold text-gray-900 dark:text-white">Tell us about your exam-preparation needs.</label>
                                        <TextAreaInput id="input_message"
                                                       field="message"
                                                       value={formState.message.value}
                                                       required
                                                       onChange={hasFormValueChanged} rows="6" inputClass="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Tell us which TELC or Goethe levels you need, how many learners you support, and any specific requirements."></TextAreaInput>
                                    </div>
                                    <label className="block mb-2 text-lg font-semibold font-medium text-gray-900 dark:text-white">What is your estimated budget?</label>
                                    <div className="flex space-x-4">
                                        <button type="button" className={`px-6 py-3 w-60 text-sm font-semibold transition-colors duration-300 rounded-md 
                                              ${selectedButton === 1 ? 'border-blue-500 bg-blue-100 dark:bg-blue-400' : 'border-gray-300'} 
                                              dark:text-white border-2 focus:outline-none hover:bg-blue-100 dark:hover:bg-blue-400`}
                                                onClick={() => { setError(''); setSelectedButton(1); }} >
                                            $2.5K to $10K
                                        </button>
                                        <button  type="button" className={`px-6 py-3 w-60 text-sm font-semibold transition-colors duration-300 rounded-md 
                                              ${selectedButton === 2 ? 'border-blue-500 bg-blue-100 dark:bg-blue-400' : 'border-gray-300'} 
                                              dark:text-white border-2 focus:outline-none hover:bg-blue-100 dark:hover:bg-blue-400`}
                                                 onClick={() => { setError(''); setSelectedButton(2); }} // Set state to 2 on click
                                        >
                                            Over $10K
                                        </button>
                                    </div>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                    <label className="block mb-2 text-lg font-semibold font-medium text-gray-900 dark:text-white">How can we reach you?</label>
                                    <div className="w-full flex">
                                        <div className="flex flex-wrap w-1/2">
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                First name</label>
                                            <TextInput type="text"
                                                       id="input_firstName"
                                                       field="firstName"
                                                       value={formState.firstName.value}
                                                       onChange={hasFormValueChanged}
                                                       inputClass="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                                       placeholder="Emily" required/>
                                        </div>
                                        <div className="flex flex-wrap ml-10 w-1/2">
                                            <label
                                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Last name</label>
                                            <TextInput type="text"
                                                       id="input_lastName"
                                                       field="lastName"
                                                       value={formState.lastName.value}
                                                       onChange={hasFormValueChanged}
                                                       inputClass="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                                       placeholder="Anderson" required/>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Work email</label>
                                        <TextInput type="email"
                                                   id="input_email"
                                                   field="email"
                                                   value={formState.email.value}
                                                   onChange={hasFormValueChanged}
                                                   inputClass="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light" placeholder="emily@email.com" required/>
                                    </div>
                                    <button type="submit" className="py-3 px-10 text-sm font-medium text-center text-white rounded-lg bg-blue-600 sm:w-fit hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {popup &&
                <div className="relative z-10">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div  className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center text-center">
                            <div className="max-w-2xl p-8">
                                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                    <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            EasyPrüfung
                                        </h3>
                                        <button type="button"
                                                onClick={() => {
                                                    setPopup(false);
                                                }}
                                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                        >
                                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                 fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                      strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                            </svg>
                                            <span className="sr-only">Close modal</span>
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                            {t('contact_us_popup_description')}
                                        </p>
                                    </div>
                                    <div
                                        className="p-6 space-x-2 text-right border-t border-gray-200 rounded-b dark:border-gray-600">
                                        <button type="button"
                                                onClick={() => {
                                                    setPopup(false);
                                                }}
                                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue700 dark:focus:ring-blue-800">
                                            {t('contact_us_popup_close')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                }
            </section>
        </>
    );
}

export default PricingContact;