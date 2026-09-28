import React, {useState, FormEvent, Dispatch} from "react";
import {OnChangeModel} from "../../../common/types/Form.types";
import TextInput from "../../../common/components/TextInput";
import { useNavigate} from "react-router-dom";
import Logo from "../../../images/logo.png";
import {authenticateAdmin} from "../../../api/admin/api-helper";
import {useDispatch} from "react-redux";
import {adminLogin} from "../../../store/actions/admin/adminAccount.actions";


const AdminLogin = () => {
    //init
    let navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const [formState, setFormState] = useState({
        email: { error: "", value: "" },
        password: { error: "", value: "" }
    });
    const [error, setError] = useState("");

    function hasFormValueChanged(model: OnChangeModel): void {
        setError("");
        setFormState({ ...formState, [model.field]: { error: model.error, value: model.value } });
    }


    //actions
    async function loginadmin(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        let admin = await authenticateAdmin(formState.email.value,formState.password.value);
        if(admin !== null && admin !== undefined){
            dispatch(adminLogin(admin));
            navigate('/crm_private_access');
        }
        else
            setError("Your email or password is incorrect.");
    }

    return (
        <section id="Login">
            <div className="font-[sans-serif]">
                <div className="min-h-screen flex flex-row items-center justify-center py-6 px-4">
                    <div>
                        <div className="flex items-center justify-center pb-20 text-4xl lg:text-6xl font-semibold text-gray-900 dark:text-white">
                            <div className="mr-2">
                                <img alt="logo" width="88" height="88" src={Logo}/>
                            </div>
                            <span className="text-black dark:text-white">EasyPrufung</span>
                        </div>
                        <div className="items-center gap-10 max-w-6xl w-full">

                            <form className="max-w-lg md:ml-auto w-full" onSubmit={loginadmin}>
                                <h3 className="flex justify-center items-center text-gray-800 text-5xl font-extrabold mb-8  dark:text-white">
                                    CRM
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <TextInput id="input_email"
                                                   field="email"
                                                   value={formState.email.value}
                                                   onChange={hasFormValueChanged}
                                                   required={true}
                                                   type="email"
                                                   inputClass="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                                   placeholder="Email" />
                                    </div>
                                    <div>
                                        <TextInput id="input_password"
                                                   field="password"
                                                   value={formState.password.value}
                                                   onChange={hasFormValueChanged}
                                                   required={true}
                                                   type="password"
                                                   inputClass="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                                                   placeholder="Password" />
                                    </div>
                                </div>

                                <div className="!mt-8">
                                    {error ?
                                        <div>
                                            <h3 className="mb-2 text-center text-red-500 text-l">{error}</h3>
                                        </div> : null
                                    }
                                    <button type="submit"
                                            className="w-full bg-black text-white border border-black px-4 py-2 rounded-lg hover:bg-gray-800 active:bg-gray-900
                                   dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-300 dark:active:bg-gray-400 mt-6"
                                    >
                                        Log in
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}



export default AdminLogin;