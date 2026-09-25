import React, {useEffect, useState} from "react";
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';
import {useSelector} from "react-redux";
import {IStateType, ISubscriptionState} from "../../../store/models/root.interface";


interface SubscriptionChartState {
    series: number[];
}

const options: ApexOptions = {
    chart: {
        type: 'donut',
    },
    colors: ['#259AE6','#10B981'],
    labels: ['Active', 'Cancelled'],
    legend: {
        show: true,
        position: 'bottom',
    },

    plotOptions: {
        pie: {
            donut: {
                size: '55%',
                background: 'transparent',
            },
        },
    },
    dataLabels: {
        enabled: true,
    },
    responsive: [
        {
            breakpoint: 2600,
            options: {
                chart: {
                    width: 380,
                },
            },
        },
        {
            breakpoint: 640,
            options: {
                chart: {
                    width: 200,
                },
            },
        },
    ],
};

const SubscriptionsPlanChart: React.FC  = () => {
    const [chartState, setChartState] = useState<SubscriptionChartState>({
        series: [100,0],
    });
    const subscriptionState: ISubscriptionState = useSelector((state: IStateType) => state.subscriptions);

    useEffect(() => {
        if(subscriptionState.subscriptions.length !== 0) {
            let activeSubCount = subscriptionState.subscriptions.filter((sub) => sub.isActive).length;
            let cancelledSubCount = subscriptionState.subscriptions.filter((sub) => !sub.isActive).length;
            setChartState({series: [activeSubCount,cancelledSubCount]});
        }
    }, [subscriptionState.subscriptions]);

    return (
        <>
            <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
                <div className="mb-3 justify-between gap-4 sm:flex">
                    <div>
                        <h5 className="text font-semibold text-black dark:text-white">
                            Status
                        </h5>
                    </div>
                </div>

                <div className="mb-2">
                    <div id="chartStatusSub" className="mx-auto flex justify-center">
                        <ReactApexChart
                            options={options}
                            series={chartState.series}
                            type="donut"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubscriptionsPlanChart;