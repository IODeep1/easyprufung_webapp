import React, { Dispatch, useRef, useState, FormEvent } from "react";
import {
    createPrebuiltProject,
    removeProjectLogoBg,
    saveProjectIcon,
} from "../../../../api/project/api-helper.ts";
import Loading from "../../../Shared/Loading.tsx";
import { IProjectIconConfiguration } from "../../../../store/models/user/project/projectIconConfiguration.interface.ts";
import { IProject } from "../../../../store/models/user/project/project.interface.ts";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const CHAR_LIMITS = {
    name: 40,
    url: 80,
    description: 2500,
};

function CharIndicator({ value, limit }) {
    return (
        <span
            className={`absolute bottom-1 right-2 px-1 text-xs pointer-events-none select-none ${
                value.length === limit
                    ? "text-red-500 font-semibold"
                    : "text-gray-500 dark:text-gray-400"
            }`}
        >
      {value.length}/{limit}
    </span>
    );
}

export default function AddBusiness() {
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        url: "",
        description: "",
    });

    const [isDragging, setIsDragging] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    let svgConfiguration: IProjectIconConfiguration;
    let project: IProject;

    const [showRemoveBg, setShowRemoveBg] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Loading...");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const inputClass =
        "block w-full text-sm rounded-xl px-4 py-3 bg-white/80 dark:bg-white/5 " +
        "border border-black/10 dark:border-white/10 text-black dark:text-white " +
        "placeholder-gray-500 dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
// enforce per-field limits
        if (value.length <= (CHAR_LIMITS as any)[name]) {
            setForm((f) => ({ ...f, [name]: value }));
        }
    }

    const fileToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(String(e.target?.result || ""));
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });

    const handleFile = async (file?: File) => {
        setError("");
        if (!file) return;

        const allowedTypes = ["image/png", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
            setError("Sorry, this file type is not supported.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Your image is too large. Please select a file smaller than 5MB.");
            return;
        }

        const base64 = await fileToBase64(file);
        setUploadedImage(base64);
        setShowRemoveBg(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFile(file);
    };
    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const removeBgAndUploadLogo = async () => {
        if (!uploadedImage) return;
        setLoading(true);
        setLoadingMessage("Removing background...");
        try {
            const cleanBase64 = uploadedImage.replace(/^data:image\/(png|jpeg);base64,/, "");
            const result = await removeProjectLogoBg(cleanBase64);
            setUploadedImage(result);
        } catch {
            setError("We couldn't process the image background. You can keep the original.");
        } finally {
            setLoading(false);
            setShowRemoveBg(false);
        }
    };

    const keepOriginalLogo = () => {
        setShowRemoveBg(false);
    };

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (!form.name.trim() || !form.description.trim()) {
            setError("Please fill in the required fields.");
            return;
        }

        setLoading(true);
        setLoadingMessage("Creating your business...");
        try {
            const newProject: IProject = {
                ...(project as IProject),
                name: form.name.trim(),
                url: form.url.trim(),
                description: form.description.trim(),
            };

            const createdProject = await createPrebuiltProject(newProject);
            if (!createdProject) {
                setError("We couldn’t create your business. Please try again.");
                setLoading(false);
                return;
            }

            if (createdProject.uuid && uploadedImage) {
                const newIconConfiguration: IProjectIconConfiguration = {
                    ...(svgConfiguration as IProjectIconConfiguration),
                    size: 300,
                    rotation: 0,
                    strokeWidth: 2,
                    strokeColor: "#FFFFFF",
                    fillColor: "#FFFFFF",
                    fillOpacity: 0,
                    backgroundRounded: 100,
                    backgroundPadding: 0,
                    backgroundColor: "rgba(255, 255, 255, 0)",
                    isGradientBackground: false,
                };

                createdProject.svgIcon = generateSvg(uploadedImage);
                createdProject.iconConfiguration = JSON.stringify(newIconConfiguration);
                await saveProjectIcon(createdProject, dispatch);
            }

            navigate("/businesses/" + createdProject.uuid, { state: createdProject });
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const generateSvg = (img) => {
        return `  
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 400">  
            <image  
                x="0"  
                y="0"  
                width="100%"  
                height="100%"  
                href="${img}"  
            />  
        </svg>  
        `;    };

    const canSubmit = form.name.trim().length > 0 && form.description.trim().length > 0;

    return (
        <section
            id="add-business"
            className="relative min-h-screen text-black  dark:text-white px-6 py-10"
        >

            <div className="relative z-10 mx-auto w-full max-w-3xl">
                <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden">
                    <div className="p-6 sm:p-10">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Add Your Business</h1>
                            <p className="mt-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
                                Showcase your established company to the EasyPrufung community. Publish your profile to gain exposure and connect with like‑minded entrepreneurs.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-lg border border-red-400/40 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 px-4 py-2 text-sm">
                                {error}
                            </div>
                        )}

                        <form className="space-y-7" onSubmit={handleSubmit} noValidate>
                            {/* Business Name */}
                            <div>
                                <label htmlFor="business-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Business name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="business-name"
                                        name="name"
                                        required
                                        value={form.name}
                                        onChange={handleInputChange}
                                        maxLength={CHAR_LIMITS.name}
                                        className={inputClass}
                                        placeholder="e.g., EasyPrufung"
                                    />
                                    <CharIndicator value={form.name} limit={CHAR_LIMITS.name} />
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Logo</label>
                                <div
                                    className={`flex flex-col items-center justify-center w-full h-40 mb-3 rounded-xl cursor-pointer border-2 transition-all
                ${
                                        isDragging
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/40"
                                            : "border-dashed border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5"
                                    } hover:border-blue-400`}
                                    onClick={openFileDialog}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="text-blue-500 dark:text-blue-400 mb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="34"
                                            height="34"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 13v8" />
                                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                            <path d="m8 17 4-4 4 4" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">Drag and drop your logo</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">PNG or JPG, up to 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <button
                                    className="w-full mt-2 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition
                         border border-black dark:border-white
                         bg-black text-white hover:bg-black/90 active:bg-black
                         dark:bg-white dark:text-black dark:hover:bg-white/90"
                                    onClick={openFileDialog}
                                    type="button"
                                >
                                    Upload logo
                                </button>

                                {uploadedImage && (
                                    <div className="mt-4 flex flex-col items-center w-full">
                                        <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Preview</div>
                                        <img
                                            src={uploadedImage}
                                            alt="Logo preview"
                                            className="max-h-40 max-w-xs rounded-lg shadow border border-black/10 dark:border-white/10 bg-white dark:bg-black"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Business URL */}
                            <div>
                                <label htmlFor="business-url" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Website URL
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        id="business-url"
                                        name="url"
                                        value={form.url}
                                        onChange={handleInputChange}
                                        maxLength={CHAR_LIMITS.url}
                                        className={inputClass}
                                        placeholder="https://yourbusiness.com"
                                    />
                                    <CharIndicator value={form.url} limit={CHAR_LIMITS.url} />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="business-desc" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Description
                                </label>
                                <div className="relative">
              <textarea
                  id="business-desc"
                  name="description"
                  rows={5}
                  required
                  value={form.description}
                  onChange={handleInputChange}
                  maxLength={CHAR_LIMITS.description}
                  className={inputClass}
                  placeholder="Describe your business, mission, or idea..."
              />
                                    <CharIndicator value={form.description} limit={CHAR_LIMITS.description} />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!canSubmit || loading}
                                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition
                         border border-black dark:border-white
                         bg-black text-white hover:bg-black/90 active:bg-black
                         dark:bg-white dark:text-black dark:hover:bg-white/90
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Add business
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                                        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                                        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                                        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal for background removal */}
            {showRemoveBg && uploadedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative z-10 w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-2xl overflow-hidden">
                        <div className="px-6 py-6 flex flex-col items-center">
                            <div className="text-lg font-semibold mb-4">Remove background?</div>
                            <img
                                src={uploadedImage}
                                alt="Logo preview"
                                className="max-h-32 rounded-md border border-black/10 dark:border-white/10 mb-4"
                            />
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
                                Do you want to remove the background from your uploaded image?
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition bg-blue-600 text-white hover:bg-blue-500"
                                    onClick={removeBgAndUploadLogo}
                                >
                                    Yes, remove
                                </button>
                                <button
                                    className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition
                         border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10"
                                    onClick={keepOriginalLogo}
                                >
                                    Keep original
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && <Loading text={loadingMessage} showProgressBar={false} />}
        </section>
    );
}