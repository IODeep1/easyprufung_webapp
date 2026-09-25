import {IProjectValidation} from "./projectValidation.interface";
import {IWaitlist} from "./waitlist.iterface.ts";
import {IContactForm} from "./contactform.interface.ts";

export interface IProject {
    id: number;
    uuid: string;
    name: string;
    prompt: string;
    description: string;
    shortDescription: string;
    source: string;
    type: string;
    tempUrl: string;
    url: string;
    buildError: string;
    isWebsiteUp: boolean;
    isBuilding: boolean;
    path: string;
    validationData: IProjectValidation;
    nameData: string[];
    iconData: string;
    svgIcon: string;
    indexHtmlContent: string;
    logoUrl: string;
    iconConfiguration : string;
    dnsVerificationToken : string;
    upvote: number;
    isApproved: boolean;
    isPublic: boolean;
    category: string;
    country: string;
    latitude: number;
    longitude: number;
    contactForms: IContactForm[];
    waitlists: IWaitlist[];
    createdDate: string;
    updatedDate: string;

}