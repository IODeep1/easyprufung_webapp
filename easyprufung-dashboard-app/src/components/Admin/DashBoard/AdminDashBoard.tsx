import TotalUsers from "./TotalUsers";
import TotalProjects from "./TotalProjects";
import SubscriptionsPlanChart from "./SubscriptionsPlanChart";
import SubscriptionsTypeChart from "./SubscriptionsTypeChart";
import SubscriptionsStatusChart from "./SubscriptionsStatusChart";
import {useEffect, useState} from "react";
import {IStateType, ISubscriptionState} from "../../../store/models/root.interface";
import {useSelector} from "react-redux";

const AdminDashBoard = () => {
    const subscriptionState: ISubscriptionState = useSelector((state: IStateType) => state.subscriptions);
    const [subscriptionCount, setSubscriptionCount] = useState(0);
    useEffect(() => {
        if(subscriptionState.subscriptions.length !== 0) {
            setSubscriptionCount(subscriptionState.subscriptions.length );
        }
    }, [subscriptionState.subscriptions]);
    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <TotalUsers/>
                <TotalProjects/>
            </div>
            <div className="mt-5 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-title-md2 font-semibold text-black dark:text-white">
                        Subscriptions: {subscriptionCount}
                    </h2>
                </div>
                <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
                    <SubscriptionsPlanChart/>
                    <SubscriptionsStatusChart/>
                    <SubscriptionsTypeChart/>
                </div>
            </div>
        </>
    );
};

export default AdminDashBoard;