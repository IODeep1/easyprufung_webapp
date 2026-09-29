import React, {Dispatch, FormEvent, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {OnChangeModel} from "../../../common/types/Form.types";
import { requestUpdateUser} from "../../../api/user/api-helper";
import {IUser} from "../../../store/models/user/user.interface";
import {Link, useNavigate} from "react-router-dom";
import Logo from "../../../images/logo.png";
import {IUserAccount} from "../../../store/models/user/userAccount.interface";
import {IStateType} from "../../../store/models/root.interface";
import SelectInput from "../../../common/components/SelectInput";
import { updateUser } from "../../../store/actions/user/userAccount.actions";
import Loading from "../../Shared/Loading";


const AdvancedUserData = () => {
    //init
    let user: IUser;
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    let navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [formState, setFormState] = useState({
        codingKnowledgeLevel: { error: "", value: "" },
        userRole: { error: "", value: ""},
    });

    function hasFormValueChanged(model: OnChangeModel): void {
        setFormState({ ...formState, [model.field]: { error: model.error, value: model.value } });
    }

    //actions
    async function updateuser(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        if(account.user)
             user = account.user;

        const newUserData ={
            ...user,
            email: user.email,
            codingKnowledgeLevel: formState.codingKnowledgeLevel.value,
            userRole: formState.userRole.value,
        };

        setLoadingMessage("Loading...");
        setLoading(true);
        const updatedUser = await requestUpdateUser(newUserData, dispatch);
        setLoadingMessage('');
        setLoading(false);
        if(updatedUser === undefined || updatedUser === null)
        {
            return;
        }
        else
        {
            dispatch(updateUser(updatedUser));
            navigate("/");
        }
    }

    return (
        <section id="register" className="pt-7 pb-20">
            <div className="pl-5 lg:pl-10">
                <Link to="/" className="flex items-center ml- text-2xl font-semibold text-gray-900 dark:text-white">
                    <div className="mr-2">
                        <img alt="logo" width="44" height="44" src={Logo}/>
                    </div>
                    <span className="text-black dark:text-white">EasyPrüfung</span>
                </Link>
            </div>
            <div className="py-8  px-4 mx-auto max-w-screen-md">
                <h2 className="text-4xl text-center font-bold leading-snug tracking-tight text-gray-800 lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight dark:text-white">Personalize Your Exam Practice</h2>
                <p className="py-5 mb-8 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">Tell us your current German level and exam goal so we can tailor your EasyPrüfung experience.</p>

                <form onSubmit={updateuser} className="mt-10 space-y-8">
                    <div className="space-y-5">
                        <SelectInput
                            id="input_codingKnowledgeLevel"
                            field="codingKnowledgeLevel"
                            label="What is your current German level?"
                            options={["A1", "A2", "B1", "B2", "C1", "C2"]}
                            required={true}
                            onChange={hasFormValueChanged}
                            value={formState.codingKnowledgeLevel.value}
                        />

                        <SelectInput
                            id="input_userRole"
                            field="userRole"
                            label="Which exam are you preparing for?"
                            options={["TELC Deutsch B1", "TELC — another level (coming soon)", "Goethe-Zertifikat (coming soon)", "General German exam preparation"]}
                            required={true}
                            onChange={hasFormValueChanged}
                            value={formState.userRole.value}
                        />
                    </div>

                    <button type="submit"  className="w-full px-4 py-2 bg-black text-white border border-black rounded-lg hover:bg-gray-800 active:bg-gray-900
                                   dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-300 dark:active:bg-gray-400 mt-6">Next</button>
                </form>
            </div>
            {loading &&  <Loading text={loadingMessage}/>
            }
        </section>
    );
}



export default AdvancedUserData;