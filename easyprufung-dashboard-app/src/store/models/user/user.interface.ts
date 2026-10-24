import type { SupportedLanguage } from "../../../localization/languages";
import type { AcquisitionSource } from "../../../components/User/Onboarding/acquisition-sources";
import {ISubscription} from "../subscription.interface";

export interface IUser {
    id: number;
    uuid: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    source: string;
    preferredLanguage?: SupportedLanguage;
    acquisitionSource?: AcquisitionSource | null;
    acquisitionOnboardingCompleted?: boolean;
    createdDate: string;
    token: string;
    subscription: ISubscription
}