import React, {Dispatch, useState} from "react";
import {requestCheckDomain} from "../../../../../api/server/api-helper.ts";
import {addDomain, deleteDomain, getProject} from "../../../../../api/project/api-helper.ts";
import {useDispatch} from "react-redux";
import {changeSelectedProject} from "../../../../../store/actions/user/project.actions.ts";
import EasyPrufungDNSdemo from "../../../../../videos/easyprufung_dns_demo.mp4"
import EasyPrufungDNSImage from "../../../../../images/easyprufung_dns_poster.jpg"


function getDomain(url) {
    // Normalize the URL if it doesn't start with http/https
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname; // returns 'example.com'
    } catch (error) {
        return null; // invalid URL
    }
}

export default function CustomDomain({project}) {
    const dispatch: Dispatch<any> = useDispatch();
    const [url, setUrl] = useState("");
    const [status, setStatus] = useState("");
    const [linkStatus, setLinkStatus] = useState("");// null | "checking" | "up" | "down"
    const [showTxt, setShowTxt] = useState(false);

    // Check if website is up
    const checkWebsite = async () => {
        if (!url.trim()) return;
        setStatus("checking");
        setLinkStatus("");

        const domain = getDomain(url);
        const result = await requestCheckDomain(domain, project.uuid);
        // If we reach here, we assume it's up (as fetch succeeded with no-cors)
        if(result)
        {
            setStatus("up");
        }
        else {
            setStatus("down");
        }
    };

    const linkWebSite = async () => {
        if (!url.trim()) return;
        setLinkStatus("linking");
        const domain = getDomain(url);
        const result = await addDomain(domain, project.uuid);
        if(result)
        {
            setLinkStatus("up");
            const _project = await getProject(project.uuid, dispatch);
            if(_project){
                dispatch(changeSelectedProject(_project));
            }
        }
        else {
            setLinkStatus("down");
        }
    };

    const verificationCode = project.dnsVerificationToken;
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(verificationCode)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500); // Reset copied state after 1.5s
            });
    };

    const [popup, setPopup] = useState(false);
    const showDeletePopUp = () => {
        setPopup(true);
    };
    const deleteWebsiteLinking = async () => {
        if(!project.url) return;
        const result =await deleteDomain(project.uuid);
        if(result)
        {
            const _project = await getProject(project.uuid, dispatch);
            if(_project){
                dispatch(changeSelectedProject(_project));
            }
        }
    };

    return (project.url && project.url.trim() ? (
                // ---- DOMAIN IS CONFIGURED ----
                <div>
                    <div className="flex flex-col items-center justify-center py-16 min-h-[400px]">
                        <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                            {/* Checkmark animated icon */}
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="stroke-current text-green-100/80"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    fill="transparent"
                                />
                                <path
                                    className="stroke-current"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7 13l3 3 7-7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                            Domain Linked!
                        </h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-6 max-w-xl">
                            Your custom domain is now connected and ready to use.
                            <br />
                            <span className="font-semibold text-black dark:text-white">
            {project.url}
          </span>
                            {project.url.startsWith('http')
                                ? ''
                                : <span className="text-xs ml-1 text-gray-400">(http assumed)</span>}
                        </p>
                        <div className="flex space-x-2">
                            <a
                                href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2 rounded-lg bg-gradient-to-br bg-black text-white dark:bg-white dark:text-black font-semibold hover:from-green-600 hover:to-green-500 transition"
                            >
                                Visit my website
                            </a>
                            {/* Delete button */}
                            <button
                                type="button"
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white border border-red-700 font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-red-400"
                                onClick={() => {
                                   showDeletePopUp();
                                }}
                            >
                                {/* Trash icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                    <line x1="10" x2="10" y1="11" y2="17"/>
                                    <line x1="14" x2="14" y1="11" y2="17"/>
                                </svg>
                                Delete Domain
                            </button>
                        </div>
                    </div>
                    {popup &&
                        <div className="relative z-10">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <div  className="fixed inset-0 z-10 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center text-center">
                                    <div className="max-w-2xl p-8">
                                        <div className="relative bg-white rounded-lg lg:mx-20 shadow dark:bg-gray-700">
                                            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                    EasyPrufung
                                                </h3>
                                                <button type="button"
                                                        onClick={() => {
                                                            setPopup(false);
                                                        }}
                                                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                                >
                                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                         fill="none" viewBox="0 0 14 14">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                                    </svg>
                                                    <span className="sr-only">Close modal</span>
                                                </button>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                                    Are you sure you want to delete your custom domain?
                                                </p>
                                            </div>
                                            <div
                                                className="p-6 flex justify-between text-right border-t border-gray-200 rounded-b dark:border-gray-600">
                                                <button type="button"
                                                        onClick={() => {
                                                            setPopup(false);
                                                            deleteWebsiteLinking();
                                                        }}
                                                        className="inline-flex shadow-sm  items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring  bg-red-600 text-white hover:bg-red-700 hover:text-gray-100 transition-colors duration-200 h-10 px-4 py-2">
                                                    Yes
                                                </button>

                                                <button type="button"
                                                        onClick={() => {
                                                            setPopup(false);
                                                        }}
                                                        className="inline-flex shadow-sm  items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring  border border-gray-300 bg-white dark:bg-black  hover:bg-gray-200 text-gray-800 dark:text-white hover:text-gray-900 transition-colors duration-200 h-10 px-4 py-2">
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                    ) : (
            <div className="">
                {!project?.tempUrl && (
                    <div className="mb-3 flex justify-end">
                        <div className="inline-flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-300">
                            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.062 21h13.876c1.054 0 1.702-1.14 1.197-2.046L13.207 2.878a1.2 1.2 0 0 0-2.414 0L3.864 18.954C3.359 19.86 4.007 21 5.062 21z" />
                            </svg>
                            <span>
<strong className="font-semibold">Warning:</strong> Finish generating your name, logo, and website to unlock full access.
</span>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center rounded-full bg-black dark:bg-white w-10 h-10">
                  {/* Domain icon */}
                    <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth={2} />
                  </svg>
                </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                            Connect to Domain
                        </h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        To complete your custom domain setup, please add the required DNS records (A and TXT) in your domain provider’s dashboard. This will ensure your domain points to your site and can be verified successfully.
                    </p>
                <div className="mt-10 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-5 py-6">
                    <div className="flex flex-wrap">
                        <div className="mt-10 xl:mt-0 xl:w-1/2 order-2 xl:order-1">
                            <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4">
                                Add DNS Records
                            </h3>
                            <ol className="list-decimal ml-6 mb-6 space-y-4">
                                <li className="text-black dark:text-white">
      <span className="font-semibold text-black dark:text-white">
        Set an <span className="bg-black/90 dark:bg-white/90 text-white dark:text-black rounded px-1 py-0.5">A Record</span> for root domain
      </span>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="min-w-[330px] text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-black">
                                            <thead>
                                            <tr>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Type</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Host</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Value</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">TTL</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">A</td>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">@</td>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">141.95.86.144</td>
                                                <td className="px-3 py-1 font-mono text-gray-600 dark:text-gray-300">Automatic</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </li>
                                <li className="text-black dark:text-white">
                          <span className="font-semibold text-black dark:text-white">
                            Add <span className="bg-black/90 dark:bg-white/90 text-white dark:text-black rounded px-1 py-0.5">www</span> Record
                          </span>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="min-w-[330px] text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-black">
                                            <thead>
                                            <tr>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Type</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Host</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Value</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">TTL</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">A</td>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">www</td>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">141.95.86.144</td>
                                                <td className="px-3 py-1 font-mono text-gray-600 dark:text-gray-300">Automatic</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </li>
                                <li className="text-black dark:text-white">
  <span className="font-semibold text-black dark:text-white">
    Add <span className="bg-black/90 dark:bg-white/90 text-white dark:text-black rounded px-1 py-0.5">TXT</span> Record for domain verification
  </span>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="min-w-[330px] text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-black">
                                            <thead>
                                            <tr>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Type</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Host</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">Value</th>
                                                <th className="px-3 py-1 border-b border-gray-100 dark:border-zinc-700 font-medium text-left text-gray-800 dark:text-gray-200">TTL</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">TXT</td>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">_verifytoken</td>
                                                <td className="px-3 py-1 font-mono text-black dark:text-white">
                                                    <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-800 border border-yellow-400 dark:border-yellow-500 rounded px-2 py-1">
                                            <span>
                                              {showTxt ? verificationCode : "••••••••••"}
                                            </span>
                                                        <button
                                                            type="button"
                                                            aria-label={showTxt ? "Hide code" : "Show code"}
                                                            className="focus:outline-none"
                                                            onClick={() => setShowTxt(v => !v)}
                                                        >
                                                            {showTxt ? (
                                                                // Hide (eye-off)
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                                                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                    <path
                                                                        d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                                                                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                                                                    <path
                                                                        d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                                                                    <path d="m2 2 20 20"/>
                                                                </svg>
                                                            ) : (
                                                                // Show (eye)
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                                                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                    <path
                                                                        d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                                                                    <circle cx="12" cy="12" r="3"/>
                                                                </svg>
                                                            )}
                                                        </button>
                                                        {/* Copy icon */}
                                                        <button
                                                            type="button"
                                                            aria-label="Copy code"
                                                            className="focus:outline-none"
                                                            onClick={handleCopy} // Optionally disable the button if code is not shown
                                                        >
                                                            {copied ? (
                                                                // Checkmark icon for feedback
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            ) : (
                                                                // Copy SVG icon
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                                                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                                                    <path
                                                                        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-1 font-mono text-gray-600 dark:text-gray-300">Automatic</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </li>
                            </ol>
                            <p className="text-gray-700 dark:text-gray-400 text-sm mt-2">
                                <span className="font-semibold">Tip:</span> DNS changes may take time to propagate.
                            </p>
                        </div>
                        <div className="flex justify-center i w-full xl:w-1/2 order-1 xl:order-2">
                            <div className="h-full w-full flex overflow-hidden shadow-md rounded-2xl">
                                <video
                                    controls
                                    preload="auto"
                                    width="100%"
                                    height="100%"
                                    poster={EasyPrufungDNSImage}
                                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                >
                                    <source src={EasyPrufungDNSdemo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>

                    </div>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3">
                        <input
                            className="flex-1 px-4 py-2 rounded border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter your website URL (e.g. example.com)"
                            disabled={status === "checking"}
                        />
                        <button
                            className="px-4 py-2 rounded-lg bg-black text-white  border border-black dark:bg-white dark:text-black dark:border-white font-semibold hover:bg-white hover:text-black hover:dark:bg-black hover:dark:text-white transition-colors disabled:opacity-50"
                            onClick={checkWebsite}
                            disabled={!url.trim() || status === "checking" || !project.tempUrl}
                        >
                            {status === "checking" ? "Checking..." : "Check DNS"}
                        </button>
                    </div>
                    {/* Status messages */}
                    {status === "up" && (
                        <div className="mt-5 flex flex-col items-center gap-3">
                            <p className="text-green-600 dark:text-green-400 font-semibold">
                                {url} is Ready!
                            </p>
                            <button
                                onClick={linkWebSite}
                                rel="noopener noreferrer"
                                disabled={!url.trim() || linkStatus === "linking"}
                                className="px-4 py-2 rounded-lg bg-black text-white  border border-black dark:bg-white dark:text-black dark:border-white font-semibold hover:bg-white hover:text-black hover:dark:bg-black hover:dark:text-white transition-colors disabled:opacity-50"
                            >
                                {linkStatus === "linking" ? "Linking..." : "Link to my website"}
                            </button>
                        </div>
                    )}
                    {status === "down" && (
                        <div className="flex  justify-center items-center mt-4 ">
                            <div className="flex items-center rounded-lg bg-yellow-100 border border-yellow-400 p-4 text-yellow-800 text-sm dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200">
                                <svg className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-300  flex-shrink-0" fill="none" stroke="currentColor"
                                     strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.702-1.14 1.197-2.046l-6.928-12.076c-.52-.905-1.874-.905-2.393 0L3.058 17.954c-.505.906.143 2.046 1.197 2.046z"/>
                                </svg>
                                <span>
                            <strong className="font-semibold">Could not connect:</strong>  If you recently changed your DNS settings, please note that DNS propagation can take some time. <span className="underline">Try again later.</span><br />

                          </span>
                            </div>
                        </div>
                    )}

                    {linkStatus === "down" && (
                        <div className="mt-5 text-center">
                            <p className="text-red-600 dark:text-red-400 font-semibold">
                                Could not link. The website may be <span className="underline">down or misconfigured.</span>                     </p>
                        </div>
                    )}
                </div>
            )
    );
};