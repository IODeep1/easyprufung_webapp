import React, {Dispatch, useContext, useEffect, useRef, useState} from "react";
import { Card } from "../../../common/components/Card";
import { useDispatch, useSelector } from "react-redux";
import {
    updateProjectLandingPage,
    updateProjectName,
    updateProjectSvgIcon,
    updateProjectValidation
} from "../../../api/project/api-helper";
import { changeSelectedProject} from "../../../store/actions/user/project.actions";
import { getProjectChatHistory } from "../../../api/chat/api-helper";
import { IChatRequest } from "../../../store/models/user/Chat/chatRequest.interface";
import { IUserAccount } from "../../../store/models/user/userAccount.interface";
import { IStateType } from "../../../store/models/root.interface";
import { useNavigate } from "react-router-dom";
import {ProjectContext} from "../Projects/context/ProjectContext.tsx";

const MainChat = ({ projectState }) => {
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const account: IUserAccount = useSelector((state: IStateType) => state.userAccount);
    const iteration = account.subscription ? account.subscription.iteration : 0;
    const { generatingHtml, setGeneratingHtml } = useContext(ProjectContext);

    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [userInput, setUserInput] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isChatDisabled, setIsChatDisabled] = useState(false);

    let chatRequest: IChatRequest;

    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    const landingPageAssistantMessage = {
        role: "assistant",
        content: [
            {
                type: "text",
                text: "Your landing page has been generated based on your input! Feel free to preview and make any adjustments."
            }
        ]
    };

    const PROGRESS_STEPS = [
        { threshold: 0, text: "Thinking" },
        { threshold: 15, text: "Generating content" },
        { threshold: 100, text: "Preparing editor" },
    ];

    const [progressPercent, setProgressPercent] = useState(0);
    const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);

    useEffect(() => {
        let interval: any;
        if (isThinking && projectState.currentStep === "project_landingpage") {
            if (!thinkingStartTime) setThinkingStartTime(Date.now());
            interval = setInterval(() => {
                if (thinkingStartTime) {
                    const elapsed = (Date.now() - thinkingStartTime) / 1000;
                    let percent = Math.min(100, Math.floor((elapsed / 600) * 100));
                    setProgressPercent(percent);
                }
            }, 500);
        } else {
            setProgressPercent(0);
            setThinkingStartTime(null);
        }
        return () => clearInterval(interval);
    }, [isThinking, projectState.currentStep, thinkingStartTime]);

    function getProgressText() {
        if (progressPercent >= 100) return PROGRESS_STEPS[PROGRESS_STEPS.length - 1].text;
        let step = PROGRESS_STEPS[0];
        for (let i = 1; i < PROGRESS_STEPS.length; i++) {
            if (progressPercent >= PROGRESS_STEPS[i].threshold) {
                step = PROGRESS_STEPS[i];
            }
        }
        return step.text;
    }

    const ProgressThinkingMessage = () => {
        const text = getProgressText();
        return (
            <div className="flex w-full justify-start">
                <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm bg-white/80 dark:bg-gray-800/80 ring-1 ring-gray-200/70 dark:ring-gray-700/60 backdrop-blur">
                    <div className="flex gap-3 items-center">
          <span className="flex shrink-0 overflow-hidden rounded-full w-8 h-8 ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-900 items-center justify-center">
            <div className="rounded-full bg-gradient-to-br from-blue-300 to-black p-1.5">
              <svg stroke="none" fill="white" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
              </svg>
            </div>
          </span>
                        <div className="text-sm md:text-[15px] text-gray-600 dark:text-gray-200 flex items-center">
                            <span className="font-medium mr-1">{text}</span>
                            <span className="inline-flex items-end">
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full mx-0.5 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full mx-0.5 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full mx-0.5 animate-bounce"></span>
            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if(!generatingHtml || !chatMessages) return;
        setChatMessages([{
            role: "user",
            content: [{ type: "text", text:  projectState.selectedProject?.description}]
        }]);
        setIsThinking(true)
    }, [generatingHtml]);

    useEffect(() => {
        const processApi = async () => {
            setChatMessages([]);
            if (projectState.selectedProject === null || !projectState.selectedProject.uuid) return;
            setIsChatDisabled(false);
            setIsFetching(true);

            chatRequest = await getProjectChatHistory(projectState.selectedProject.uuid, projectState.currentStep);
            if (chatRequest !== null && chatRequest !== undefined) {
                let filteredMessages = chatRequest.messages.filter((chatMessage) => chatMessage.role !== "system");

                if (projectState.currentStep === "project_landingpage") {
                    filteredMessages = filteredMessages.filter((chatMessage) => chatMessage.role !== "assistant");
                    for (let i = 0; i < filteredMessages.length; i++) {
                        if (filteredMessages[i].role === "user") {
                            filteredMessages.splice(i + 1, 0, landingPageAssistantMessage);
                            i++;
                        }
                    }
                }

                setChatMessages(filteredMessages);
            } else {
                setIsChatDisabled(true);
                setChatMessages([]);
            }
            setIsFetching(false);
            setIsThinking(false);
        };
        processApi();
    }, [projectState.currentStep, projectState?.selectedProject?.updatedDate]);

    useEffect(() => {
        const scrollToBottom = () => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        };
        setTimeout(scrollToBottom, 50);
    }, [chatMessages, isThinking]);

    const sendUserInput = async () => {
        if (!userInput.trim()) return;

        if (iteration == 0) {
            navigate("/settings/#credits");
            return;
        }

// Optimistic UI: append user message immediately and show typing indicator
        const optimisticUserMsg = {
            role: "user",
            content: [{ type: "text", text: userInput }]
        };
        setChatMessages((prev) => [...prev, optimisticUserMsg]);

        setIsThinking(true);
        setIsChatDisabled(true);
        const outgoingText = userInput;
        setUserInput("");

        const newChatMessage = {
            step: projectState.currentStep,
            content: outgoingText
        };

        try {
            switch (projectState.currentStep) {
                case "initial_prompt":
                case "project_validation": {
                    const updatedProject = await updateProjectValidation(newChatMessage, projectState.selectedProject.uuid);
                    if (updatedProject) dispatch(changeSelectedProject(updatedProject));
                    break;
                }
                case "project_name": {
                    const updatedProject = await updateProjectName(newChatMessage, projectState.selectedProject.uuid);
                    if (updatedProject) dispatch(changeSelectedProject(updatedProject));
                    break;
                }
                case "project_icon": {
                    const updatedProject = await updateProjectSvgIcon(newChatMessage, projectState.selectedProject.uuid);
                    if (updatedProject) dispatch(changeSelectedProject(updatedProject));
                    break;
                }
                case "project_landingpage": {
                    setGeneratingHtml(true);
                    const updatedProject = await updateProjectLandingPage(newChatMessage, projectState.selectedProject.uuid);
                    setGeneratingHtml(false);
                    if (updatedProject) dispatch(changeSelectedProject(updatedProject));
                    break;
                }
                default: {
                }
            }
        } finally {
            setIsThinking(false); // Hidden once the refreshed history arrives; this is a safeguard.
            setIsChatDisabled(false);
        }
    };

    function fixNewlinesInJson(inputJson) {
        let fixedJson = "";
        let inString = false;

        for (let i = 0; i < inputJson.length; i++) {
            let c = inputJson[i];
            if (c === '"') {
                inString = !inString;
                fixedJson += c;
            } else if (inString && c === "\n") {
                fixedJson += "\\n";
            } else {
                fixedJson += c;
            }
        }
        return fixedJson;
    }

    const AiChatAreaWrapper = ({ chatMessage, k }) => {
        let parsedText = chatMessage?.content?.[0]?.text ?? "";
        try {
            const jsonString = parsedText.replace("json", "").replace("", "");
            const parsedJson = JSON.parse(fixNewlinesInJson(jsonString));
            if (parsedJson?.content) parsedText = parsedJson.content;
        } catch {}
        return (
            <div key={k} className="flex w-full justify-start">
                <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm bg-white/80 dark:bg-gray-800/80 ring-1 ring-gray-200/70 dark:ring-gray-700/60 backdrop-blur">
                    <div className="flex gap-3">
                        <span className="flex shrink-0 overflow-hidden rounded-full w-8 h-8 ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-900 items-center justify-center">
                        <div className="rounded-full bg-gradient-to-br from-blue-300 to-black p-1.5">
                        <svg stroke="none" fill="white" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path>
                        </svg>
                        </div>
                        </span>
                        <p className="leading-relaxed text-sm md:text-[15px] text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">{parsedText}</p>
                    </div>
                </div>
            </div>
        );
    };

    const UserMessage = ({ chatMessage, k }) => {
        const text = chatMessage?.content?.[0]?.text ?? "";
        return (
            <div key={k} className="flex w-full justify-end">
                <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm bg-white/80 dark:bg-gray-800/80 ring-1 ring-gray-200/70 dark:ring-gray-700/60 backdrop-blur">
                    <div className="flex gap-3 items-start">
                        <p className="leading-relaxed text-sm md:text-[15px] text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">{text}</p>
                        <span className="flex shrink-0 overflow-hidden rounded-full w-8 h-8 ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-900 items-center justify-center">
                            <div className="rounded-full bg-gradient-to-br from-blue-300 to-black p-1.5">
                            <svg stroke="none" fill="white" viewBox="0 0 16 16" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"></path>
                            </svg>
                            </div>
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const TypingMessage = () => {
        return (
            <div className="flex w-full justify-start">
                <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm bg-white/70 dark:bg-gray-800/70 ring-1 ring-gray-200/70 dark:ring-gray-700/60 backdrop-blur">
                    <div className="flex gap-3 items-center">
                        <span className="flex shrink-0 overflow-hidden rounded-full w-8 h-8 ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-900 items-center justify-center">
                        <div className="rounded-full bg-gradient-to-br from-blue-300 to-black p-1.5">
                        <svg stroke="none" fill="white" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"></path>
                        </svg>
                        </div>
                        </span>
                        <div className="text-sm md:text-[15px] text-gray-600 dark:text-gray-200 flex items-center">
                            <span className="font-medium mr-1">Thinking</span>
                            <span className="inline-flex items-end">
                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full mx-0.5 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full mx-0.5 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-300 rounded-full mx-0.5 animate-bounce"></span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const onInputKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isChatDisabled) sendUserInput();
        }
    };

    return (
        <Card className="p-0 h-[calc(100vh-14rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200/60 dark:border-gray-800/60 px-4 py-3 flex items-center justify-between bg-white/60 dark:bg-gray-900/60 backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        EasyPrufung Assistant
                    </div>
                </div>
                {projectState?.currentStep && (
                    <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        Step: {projectState.currentStep.replaceAll("_", " ")}
                    </div>
                )}
            </div>

            {/* Chat Messages - scrollable */}
            <div className="relative flex-1 min-h-0"> {/* min-h-0 is important for flex children with overflow */}
                <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40">
                    <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900"></div>
                </div>
                <div
                    ref={chatContainerRef}
                    className="relative z-10 flex flex-col space-y-4 overflow-y-auto px-3 py-4 h-full"
                >
                    {isFetching ? (
                        <div className="space-y-3">
                            <div className="flex w-full justify-start">
                                <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ring-1 ring-gray-200 dark:ring-gray-800 bg-white/70 dark:bg-gray-800/70 backdrop-blur">
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                                    <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex w-full justify-end">
                                <div className="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ring-1 ring-gray-200 dark:ring-gray-800 bg-white/70 dark:bg-gray-800/700 backdrop-blur">
                                    <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ) : projectState.selectedProject !== null && chatMessages.length !== 0 ? (
                        <>
                            {chatMessages.map((chatMessage, i) =>
                                chatMessage.role === "user" ? (
                                    <UserMessage key={i} chatMessage={chatMessage} />
                                ) : (
                                    <AiChatAreaWrapper key={i} chatMessage={chatMessage} />
                                )
                            )}
                            {isThinking && projectState.currentStep === "project_landingpage" ? (
                                <ProgressThinkingMessage />
                            ) : isThinking ? (
                                <TypingMessage />
                            ) : null}
                        </>
                    ) : (
                        <div className="flex h-full font-semibold text-2xl md:text-3xl text-center px-6 justify-center items-center text-gray-900 dark:text-white">
                            EasyPrufung: Ready to assist you.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200/60 dark:border-gray-800/60 px-3 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur">
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <div className="relative">
                          <textarea
                              id="input_userprompt"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              onKeyDown={onInputKeyDown}
                              rows={3}
                              className="block resize-none p-3 w-full text-sm text-gray-900 bg-white rounded-xl shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white transition"
                              placeholder="Ask anything to move your project forward..."
                          />
                            {userInput.trim() === "" && (
                                <div className="absolute right-3 bottom-3 text-[11px] text-gray-400 dark:text-gray-500 pointer-events-none select-none">
                                    Press Enter to send • Shift+Enter for newline
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <button
                            disabled={isChatDisabled || !userInput.trim()}
                            onClick={sendUserInput}
                            className="inline-flex gap-x-2 items-center justify-center rounded-lg text-sm font-medium bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:pointer-events-none disabled:opacity-50 h-11 px-5 transition dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:active:bg-neutral-300 dark:focus:ring-white dark:focus:ring-offset-gray-900"                              title="Send"
                        >
                            <span>Send</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m22 2-7 20-4-9-9-4Z"></path>
                                <path d="M22 2 11 13"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default MainChat;