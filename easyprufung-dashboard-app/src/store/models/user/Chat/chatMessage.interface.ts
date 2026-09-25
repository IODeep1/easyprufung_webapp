import {IChatContent} from "./chatContent.interface";

export interface IChatMessage {
    role: string;
    content: IChatContent;
}

