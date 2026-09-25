import { useState, ChangeEvent, Fragment } from "react";
import { SelectProps } from "../types/Select.types";

function SelectInput(props: SelectProps): JSX.Element {
    const [touched, setTouch] = useState(false);
    const [error, setError] = useState("");
    const [htmlClass, setHtmlClass] = useState("");
    const [value, setValue] = useState(props.value);

    function onValueChanged(event: ChangeEvent<HTMLSelectElement>): void {
        let [error, validClass, elementValue] = ["", "", event.target.value];

        [error, validClass] = (!elementValue && props.required) ?
            ["Value has to be selected", "is-invalid"] : ["", "is-valid"];


        if(props.onChange)
            props.onChange({ value: elementValue, error: error, touched: touched, field: props.field });

        setTouch(true);
        setError(error);
        setHtmlClass(validClass);
        setValue(elementValue);
    }

    const getOptions: (JSX.Element | null)[] = props.options.map(option => {
        return (
            <option key={option} value={`${option}`}>{option}</option>
        )
    });

    return (
        <Fragment>
            <div>
                {props.label?
                    <label htmlFor={`${props.id}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {props.label}
                    </label> : null
                }
                <div className="relative">
                    <select
                        disabled={props.disabled || false}
                        value={value}
                        id={`${props.id}`}
                        onChange={onValueChanged}
                        required={props.required}
                        className="appearance-none shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light">
                        <option value="">Choose...</option>
                        {getOptions}
                    </select>
                    <span className="absolute top-1/2 right-4 -translate-y-1/2">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.8">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill="#637381"
                        ></path>
                      </g>
                    </svg>
                  </span>
                </div>
            </div>
        </Fragment>
    );
}

export default SelectInput;