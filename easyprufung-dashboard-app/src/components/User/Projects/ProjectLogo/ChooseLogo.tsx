import React, {Dispatch, useCallback, useContext, useRef, useState} from 'react';
import { FormLogoContext } from "./context/logo-context.tsx";
import {removeProjectLogoBg, saveProjectIcon} from "../../../../api/project/api-helper.ts";
import {IProjectState, IStateType} from "../../../../store/models/root.interface.ts";
import {useDispatch, useSelector} from "react-redux";
import {IProject} from "../../../../store/models/user/project/project.interface.ts";
import {IProjectIconConfiguration} from "../../../../store/models/user/project/projectIconConfiguration.interface.ts";
import Loading from "../../../Shared/Loading.tsx";

export default function ChooseLogo() {
    const formLogoCtx = useContext(FormLogoContext);
    const projectState: IProjectState = useSelector((state: IStateType) => state.projects);
    let project: IProject | null = projectState.selectedProject;
    const [loadingMessage, setLoadingMessage] = useState("Loading...");
    const [loading, setLoading] = useState(false);
    const dispatch: Dispatch<any> = useDispatch();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedImage, setUploadedImage] = useState("");
    let svgConfiguration : IProjectIconConfiguration;
    const [showRemoveBg, setShowRemoveBg] = useState(false);
    const fileInputRef = useRef(null);

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    // Handle when user picks file (from input or drag drop)
    const handleFile = async (file) => {
        if (!file) return;
        // validate file type and size if needed
        const allowedTypes = ["image/png", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
            alert("Unsupported file type");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("File too large (max 5MB)");
            return;
        }
        const base64 = await fileToBase64(file);
        uploadOriginalLogo(base64);
        //setUploadedImage(base64);
        //setShowRemoveBg(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };
    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    const onSelectAI = () => {
        formLogoCtx.setState({ name: "generate" });
    };

    const removeBgAndUploadLogo = async() => {
        setLoading(true);
        if(uploadedImage){
            let cleanBase64 = uploadedImage.replace(/^data:image\/(png|jpeg);base64,/, "");
            var result = await removeProjectLogoBg(cleanBase64);
            setUploadedImage(result);
            await uploadLogo(result);
        }
        setLoading(false);
    };

    // Cancel and reset
    const uploadOriginalLogo = async(img) => {
        setLoading(true);
        await uploadLogo(img);
        setLoading(false);

    };

    const uploadLogo = async(img) => {
        if (!img || !project) return;
        const newIconConfiguration = {
            ...svgConfiguration,
            size: 300,
            rotation: 0,
            strokeWidth: 2,
            strokeColor: "#FFFFFF",
            fillColor: "#FFFFFF",
            fillOpacity: 0,
            backgroundRounded: 4,
            backgroundPadding: 2,
            backgroundColor: "rgba(255, 255, 255, 0)",
            isGradientBackground: false,
        }
        project.svgIcon = generateSvg(img);
        project.iconConfiguration = JSON.stringify(newIconConfiguration);;
        await saveProjectIcon(project, dispatch);
        formLogoCtx.setState({
            name: "editor",
        });
    };

    const generateSvg = (img) => {

        // Return the full SVG string with the appropriate sections
        return ` <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 400">
            <image
            x="0"
            y="0"
            width="100%"
            height="100%"
            href="${img}"
            />
        </svg>
    `;
    };

    return (
        <div className="flex flex-col items-center py-16 px-4 rounded-2xl transition-colors relative">
            {/* Title and Description */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white mb-4">
                    Create Your Logo
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                    Instantly generate a unique logo with AI, or upload your own design.
                </p>
            </div>
            {/* Main Options */}
            <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center w-full max-w-4xl">
                {/* AI Generate Section */}
                <button
                    onClick={onSelectAI}
                    className="flex-1 group bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-xl border-2 border-transparent hover:border-blue-500 transition-all px-8 py-10 flex flex-col items-center cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
                >
                    <div className="bg-blue-100 dark:bg-blue-900 p-5 rounded-full mb-5 flex items-center justify-center transition group-hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round">
                            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                            <path d="M20 3v4" />
                            <path d="M22 5h-4" />
                            <path d="M4 17v2" />
                            <path d="M5 18H3" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Generate with AI</span>
                    <span className="text-gray-600 dark:text-gray-300 text-base text-center">
            Let our advanced AI craft a logo tailored just for you.
          </span>
                </button>
                {/* OR Divider */}
                <div className="hidden md:flex flex-col items-center">
                    <span className="text-gray-400 font-bold text-lg mb-2">OR</span>
                    <div className="w-0.5 h-20 bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded"></div>
                </div>
                <div className="md:hidden text-gray-400 font-bold text-lg my-4">OR</div>
                {/* Upload Section */}
                <div className="flex-1 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-xl px-8 py-10 border-2 border-transparent hover:border-blue-500 transition-all flex flex-col items-center">
                    <div
                        className={`flex flex-col items-center justify-center w-full h-36 mb-5 rounded-xl cursor-pointer border-2 transition-all ${
                            isDragging
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/60'
                                : 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-zinc-800/60'
                        } hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40`}
                        onClick={openFileDialog}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className=" text-blue-400 dark:text-blue-300 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                 className="lucide lucide-cloud-upload-icon lucide-cloud-upload">
                                <path d="M12 13v8" />
                                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                <path d="m8 17 4-4 4 4" />
                            </svg>
                        </div>
                        <span className="text-gray-700 dark:text-gray-200 text-base font-medium">
              Drag &amp; drop logo here
            </span>
                        <span className="text-xs text-gray-400 dark:text-gray-400">
              PNG, or JPG • Max 5MB
            </span>
                    </div>
                    <button
                        className="w-full py-2.5 px-4 mt-2 rounded-md bg-gray-800 text-white font-semibold hover:bg-gray-900 transition-colors text-lg shadow"
                        onClick={openFileDialog}
                    >
                        Upload Logo
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* If image uploaded, show preview */}
                    {uploadedImage && (
                        <div className="mt-6 flex flex-col items-center w-full">
                            <div className="mb-3 text-base font-semibold text-gray-700 dark:text-gray-200">Preview:</div>
                            <img
                                src={uploadedImage}
                                alt="Logo preview"
                                className="max-h-40 max-w-xs rounded-lg shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal/Popup for background removal */}
            {showRemoveBg && uploadedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-xl max-w-sm w-full flex flex-col items-center">
                        <div className="mb-4 text-xl font-bold text-gray-800 dark:text-white text-center">
                            Remove Background?
                        </div>
                        <img
                            src={uploadedImage}
                            alt="Logo preview"
                            className="max-h-32 max-w-full rounded-md mb-4 border border-gray-200 dark:border-gray-700"
                        />
                        <div className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                            Do you want to remove the background from your uploaded image?
                        </div>
                        <div className="flex gap-4 w-full">
                            <button
                                className="flex-1 py-2 px-4 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                                onClick={removeBgAndUploadLogo}
                            >
                                Yes, remove
                            </button>
                            <button
                                className="flex-1 py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                                onClick={uploadOriginalLogo}
                            >
                                No, keep
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {loading && <Loading text={loadingMessage} showProgressBar={false}/> }
        </div>
    );
}