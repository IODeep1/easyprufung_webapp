import React, {Dispatch, useEffect, useRef, useState} from "react";
import {IProjectState, IStateType} from "../../../../store/models/root.interface.ts";
import {IProject} from "../../../../store/models/user/project/project.interface.ts";
import {useDispatch, useSelector} from "react-redux";
import {changeSelectedProject} from "../../../../store/actions/user/project.actions.ts";
import {getProject} from "../../../../api/project/api-helper.ts";

function LandingPagePreview({ projectUuid, token }: { projectUuid: string; token: string }) {
    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject | null = projectState.selectedProject;
    const dispatch: Dispatch<any> = useDispatch();

    const [html, setHtml] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        const ws = new WebSocket((process.env.NODE_ENV === 'development') ?"ws://localhost:8080/ws/landingpage/stream":"wss://app.easyprufung.com/ws/landingpage/stream");
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    authorization: token,
                    projectUuid: projectUuid,
                })
            );
        };

        ws.onmessage = (event) => {
            if (event.data === "[EASYPRUFUNG_DONE]") {
                ws.close();
                return;
            }
            let editedHtml = (event.data as string).replace(
                'class="scroll-smooth"',
                ""
            ).replace("```html","").replace("```","");

            if(editedHtml){
                setIsLoading(false);
            }

            editedHtml = `  
                  <script>  
                    document.addEventListener('click', function(e) {  
                      e.preventDefault();  
                      e.stopPropagation();  
                      return false;  
                    }, true);  
                  </script>  
                  ${editedHtml}  
                `;
            setHtml(editedHtml);
        };

        ws.onerror = (err) => {
            console.error("WebSocket error", err);
            setIsLoading(false);
        };

        ws.onclose = async () => {
            if(project)
            {
                var result = await getProject(project.uuid, dispatch);
                dispatch(changeSelectedProject(result));
            }
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [projectUuid, token]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            setTimeout(() => {
                try {
                    const doc = iframe.contentWindow.document;
                    doc.documentElement.scrollTop = doc.documentElement.scrollHeight;
                    doc.body.scrollTop = doc.body.scrollHeight;
                } catch (e) {
                    // If cross-origin or sandboxed, ignore
                }
            }, 100);
        }
    }, [html]);

    return (
        <div className="relative">
            <div className="absolute top-4 right-4 z-20 animate-fade-in">
                <div className="flex items-start gap-2 rounded-lg border  text-gray-700 dark:text-gray-200 border-blue-200 bg-white px-4 py-3 shadow-lg dark:border-blue-800 dark:bg-gray-800">
                    {/* Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                         className="lucide lucide-info-icon lucide-info">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4"/>
                        <path d="M12 8h.01"/>
                    </svg>

                    {/* Text */}
                    <div className="text-sm text-gray-700 dark:text-gray-200">
                        <p className="font-medium">Generating your website...</p>
                        <p>You’ll be able to edit once it’s ready.</p>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                {isLoading ? (
                    <div className="flex min-h-[75vh] items-center justify-center bg-white dark:bg-gray-900">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Loading preview...
                            </p>
                        </div>
                    </div>
                ) : (
                    <iframe
                        ref={iframeRef}
                        srcDoc={html}
                        title="Landing Page View"
                        className="min-h-[75vh] w-full bg-white dark:bg-gray-900"
                        allow="cross-origin-isolated"
                    />
                )}
            </div>
        </div>
    );
}

export default LandingPagePreview;