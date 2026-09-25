import React, { useState, ChangeEvent } from "react";
import {useTranslation} from "react-i18next";
import {TextInputTypes} from "../types/TextInput.types";

function TextInput(props: TextInputTypes): JSX.Element {
    const { t } = useTranslation();
    const [touched, setTouch] = useState(false);
    const [, setValue] = useState("");


    function onValueChanged(event: ChangeEvent<HTMLInputElement>): void {
        let [error, validClass, elementValue] = ["", "", event.target.value];

        [error, validClass] = (!elementValue && props.required) ?
            [t("empty_value_error"), "is-invalid"] : ["", "is-valid"];

        if (!error) {
            [error, validClass] = (props.maxLength && elementValue && elementValue.length > (props.maxLength)) ?
                [`Value can't have more than ${props.maxLength} characters`, "is-invalid"] : ["", "is-valid"];
        }

        props.onChange({ value: elementValue, error: error, touched: touched, field: props.field });

        setTouch(true);
        setValue(elementValue);
    }

    return (
            <input
                disabled={props.disabled || false}
                value={props.value}
                type={props.type}
                onChange={onValueChanged}
                className={`${props.inputClass}`}
                id={`id_${props.id}`}
                required={props.required}
                placeholder={props.placeholder} />
    );
}

export default TextInput;