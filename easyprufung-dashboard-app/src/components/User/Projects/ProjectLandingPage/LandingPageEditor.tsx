import React, { useRef, useEffect, useState, useContext, useCallback, useMemo } from "react";
import { ProjectContext } from "../context/ProjectContext";
import { uploadImageResource } from "../../../../api/storage/api-helper.ts";
import Loading from "../../../Shared/Loading.tsx";

// Helper: Extract <body> class
function getBodyClass(htmlString: string) {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.getAttribute("class") || "";
}
// Helper: Extract <head> content
function getHeadContent(htmlString: string) {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.head.innerHTML;
}

// CSS style helpers
function parseStyleString(styleStr: string | undefined | null): Record<string, string> {
    const result: Record<string, string> = {};
    if (!styleStr) return result;
    styleStr
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((chunk) => {
            const idx = chunk.indexOf(":");
            if (idx === -1) return;
            const key = chunk.slice(0, idx).trim();
            const val = chunk.slice(idx + 1).trim();
            if (key) result[key] = val;
        });
    return result;
}
function styleObjToString(styleObj: Record<string, string>) {
    return Object.entries(styleObj)
        .filter(([_, v]) => v !== "" && v != null)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
}
function mergeStyle(base: Record<string, string>, updates: Record<string, string | undefined | null>) {
    const out = { ...base };
    Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === "") delete out[k];
        else out[k] = v;
    });
    return out;
}
function onlyNumber(v: string) {
    return v.replace(/[^\d.]/g, "");
}
function ensurePx(v: string) {
    if (!v) return "";
    const n = onlyNumber(v);
    return n ? `${n}px` : "";
}

// Update only the text content of an element while preserving its existing element children (e.g., SVG icons)
function setElementTextPreservingChildren(doc: Document, el: HTMLElement, newText: string) {
    // 1) Try to update a direct text node child (common case: <svg />Text or Text<svg />)
    const directTextNode = Array.from(el.childNodes).find(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim().length > 0
    );
    if (directTextNode) {
        directTextNode.textContent = newText || "";
        return;
    }

    // 2) Try to find the deepest element that contains text but no nested element children (e.g., <span>Text</span>)
    const walker = doc.createTreeWalker(el, NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
            const e = node as HTMLElement;
            if (e.children.length === 0 && (e.textContent || "").trim().length > 0) {
                return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
        },
    } as unknown as TreeWalker["filter"]);

    let best: HTMLElement | null = null;
    while (walker.nextNode()) {
        const cur = walker.currentNode as HTMLElement;
        if (!best || (cur.textContent || "").length > (best.textContent || "").length) best = cur;
    }
    if (best) {
        best.textContent = newText || "";
        return;
    }

    // 3) As a fallback, if there's no existing text container, append/insert a text node without removing children
    if ((newText || "").length > 0) {
        // If the last child is an SVG or any element, append text after it for readability
        const textNode = doc.createTextNode(newText);
        el.appendChild(textNode);
    }
}

type SelectedType = {
    tag: string;
    uid: string;
    text: string; // innerText for element or link text, empty for img
    attrs: {
        href?: string;
        target?: string;
        rel?: string;
        src?: string;
        alt?: string;
        className?: string;
        style?: string;
        id?: string;
    };
};

type Props = {
    inputHtml: string;
    html: string;
    setHtml: (newHtml: string) => void;
    reloadCount: number;
};

// Small labeled input component
function Labeled({
                     label,
                     children,
                     className = "",
                 }: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
            {children}
        </div>
    );
}

// Top helper bar displaying current selection
function HelperBar() {
    return (
        <div className="sticky top-0 my-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-700 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-200">
            <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>Tip: Click any highlighted element to edit. You can now edit text, colors, classes, and more.</span>
            </div>
        </div>
    );
}

// Overlay
function Overlay({ show, onClick }: { show: boolean; onClick: () => void }) {
    if (!show) return null;
    return <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClick} />;
}

// Modal Component (moved out so it doesn't remount on each parent render)
function EditModal({
                       showModal,
                       selected,
                       closeModal,
                       handleSave,

                       // Content
                       textValue,
                       setTextValue,
                       // Link
                       linkHref,
                       setLinkHref,
                       linkTarget,
                       setLinkTarget,
                       linkRel,
                       setLinkRel,
                       // Image
                       imgUrl,
                       setImgUrl,
                       imgAlt,
                       setImgAlt,
                       imageFile,
                       setImageFile,

                       // Classes
                       classNameValue,
                       setClassNameValue,

                       // Styles
                       styleObj,
                       setStyleObj,
                   }: {
    showModal: boolean;
    selected: SelectedType | null;
    closeModal: () => void;
    handleSave: () => void;

    textValue: string;
    setTextValue: React.Dispatch<React.SetStateAction<string>>;

    linkHref: string;
    setLinkHref: React.Dispatch<React.SetStateAction<string>>;
    linkTarget: string;
    setLinkTarget: React.Dispatch<React.SetStateAction<string>>;
    linkRel: string;
    setLinkRel: React.Dispatch<React.SetStateAction<string>>;

    imgUrl: string;
    setImgUrl: React.Dispatch<React.SetStateAction<string>>;
    imgAlt: string;
    setImgAlt: React.Dispatch<React.SetStateAction<string>>;
    imageFile: File | null;
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>;

    classNameValue: string;
    setClassNameValue: React.Dispatch<React.SetStateAction<string>>;

    styleObj: Record<string, string>;
    setStyleObj: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [error, setError] = useState("");

    const tabList = useMemo(() => {
        const base = ["Content", "Styles", "Classes"];
        if (selected?.tag === "a") base.push("Link");
        if (selected?.tag === "img") base.push("Image");
        return base;
    }, [selected?.tag]);

    const [activeTab, setActiveTab] = useState<string>("Content");
    useEffect(() => {
        // Reset active tab on open/selection change
        if (!showModal) return;
        setUploadedImage(null);
        setActiveTab("Content");
    }, [showModal, selected?.uid]);

    const openFileDialog = (e?: React.MouseEvent) => {
        e?.preventDefault();
        fileInputRef.current?.click();
    };

    const validateImage = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file (PNG, JPG, WEBP).");
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB.");
            return false;
        }
        setError("");
        return true;
    };

    const readFileAsDataUrl = (file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const data = ev.target?.result as string;
            setUploadedImage(data);
            setImgUrl(data);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!validateImage(file)) return;
        readFileAsDataUrl(file);
        setImageFile(file);
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
        if (!file) return;
        if (!validateImage(file)) return;
        readFileAsDataUrl(file);
        setImageFile(file);
    };

    if (!showModal || !selected) return null;

    const isImg = selected.tag === "img";
    const isLink = selected.tag === "a";

    // Style convenience getters/setters
    const setStyle = (prop: string, value: string) => {
        setStyleObj((prev) => mergeStyle(prev, { [prop]: value }));
    };

    const colorValue = styleObj["color"] || "";
    const bgValue = styleObj["background-color"] || "";
    const fontSizeValue = styleObj["font-size"] || "";
    const weightValue = styleObj["font-weight"] || "";
    const italic = (styleObj["font-style"] || "").toLowerCase() === "italic";
    const underline = (styleObj["text-decoration-line"] || styleObj["text-decoration"] || "")
        .toLowerCase()
        .includes("underline");
    const alignValue = styleObj["text-align"] || "";
    const radiusValue = styleObj["border-radius"] || "";
    const paddingValue = styleObj["padding"] || "";
    const marginValue = styleObj["margin"] || "";
    const lineHeightValue = styleObj["line-height"] || "";
    const letterSpacingValue = styleObj["letter-spacing"] || "";

    const contentTab = (
        <div className="space-y-3">
            {isImg ? (
                <>
                    <Labeled label="Image link (URL)">
                        <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => {
                                setImgUrl(e.target.value);
                                setUploadedImage(null);
                                setError("");
                            }}
                            className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="https://your-image-url.com/image.png"
                        />
                    </Labeled>

                    <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">Or upload</div>
                    <div
                        className={`mt-2 flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 transition-all ${
                            isDragging
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                : "border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800"
                        }`}
                        onClick={openFileDialog}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="mb-1 text-blue-500 dark:text-blue-300">
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
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Drag & drop image here</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP • Max 5MB</span>
                    </div>

                    {error && (
                        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-300">
                            {error}
                        </div>
                    )}

                    <div className="mt-3">
                        <button
                            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 active:bg-black dark:bg_white dark:text-gray-900 dark:hover:bg-gray-200"
                            onClick={openFileDialog}
                            type="button"
                        >
                            Upload image
                        </button>
                        <input type="file" accept="image/png,image/jpeg,image/webp" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>

                    {(uploadedImage || imgUrl) && (
                        <div className="mt-5 flex w-full flex-col items-center">
                            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Preview</div>
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                <img src={uploadedImage || imgUrl} alt="Image preview" className="max-h-40 max-w-xs rounded-md object-contain" />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <Labeled label={isLink ? "Link text" : "Text"}>
                        <textarea
                            rows={isLink ? 2 : 4}
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder={isLink ? "Link text" : "Text"}
                        />
                    </Labeled>
                </>
            )}
        </div>
    );

    const stylesTab = (
        <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
                <Labeled label="Text color">
                    <div className="mt-1 flex gap-2">
                        <input
                            type="color"
                            value={/^#([0-9A-F]{3}){1,2}$/i.test(colorValue) ? colorValue : "#000000"}
                            onChange={(e) => setStyle("color", e.target.value)}
                            className="h-9 w-12 cursor-pointer rounded-md border border-gray-200 p-1 dark:border-gray-700"
                        />
                        <input
                            type="text"
                            placeholder="e.g. #1f2937 or rgb(31,41,55)"
                            value={colorValue}
                            onChange={(e) => setStyle("color", e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </Labeled>

                <Labeled label="Background color">
                    <div className="mt-1 flex gap-2">
                        <input
                            type="color"
                            value={/^#([0-9A-F]{3}){1,2}$/i.test(bgValue) ? bgValue : "#ffffff"}
                            onChange={(e) => setStyle("background-color", e.target.value)}
                            className="h-9 w-12 cursor-pointer rounded-md border border-gray-200 p-1 dark:border-gray-700"
                        />
                        <input
                            type="text"
                            placeholder="e.g. #ffffff"
                            value={bgValue}
                            onChange={(e) => setStyle("background-color", e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </Labeled>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <Labeled label="Font size">
                    <input
                        type="text"
                        placeholder="e.g. 16px"
                        value={fontSizeValue}
                        onChange={(e) => setStyle("font-size", ensurePx(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </Labeled>
                <Labeled label="Font weight">
                    <select
                        value={weightValue}
                        onChange={(e) => setStyle("font-weight", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Default</option>
                        <option value="400">Normal (400)</option>
                        <option value="500">Medium (500)</option>
                        <option value="600">Semibold (600)</option>
                        <option value="700">Bold (700)</option>
                        <option value="800">Extra Bold (800)</option>
                        <option value="900">Black (900)</option>
                    </select>
                </Labeled>
                <Labeled label="Text align">
                    <select
                        value={alignValue}
                        onChange={(e) => setStyle("text-align", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Default</option>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="justify">Justify</option>
                    </select>
                </Labeled>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setStyle("font-style", italic ? "" : "italic")}
                    className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm ${
                        italic
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/10 dark:text-blue-300"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                    title="Italic"
                >
                    Italic
                </button>
                <button
                    type="button"
                    onClick={() => setStyle("text-decoration-line", underline ? "" : "underline")}
                    className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm ${
                        underline
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-500/10 dark:text-blue-300"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                    title="Underline"
                >
                    Underline
                </button>

                <div className="ml-auto">
                    <button
                        type="button"
                        onClick={() => setStyleObj({})}
                        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        Reset styles
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Labeled label="Border radius">
                    <input
                        type="text"
                        placeholder="e.g. 8px"
                        value={radiusValue}
                        onChange={(e) => setStyle("border-radius", ensurePx(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </Labeled>
                <Labeled label="Line height">
                    <input
                        type="text"
                        placeholder="e.g. 1.5 or 24px"
                        value={lineHeightValue}
                        onChange={(e) => setStyle("line-height", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </Labeled>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Labeled label="Padding">
                    <input
                        type="text"
                        placeholder="e.g. 12px 16px"
                        value={paddingValue}
                        onChange={(e) => setStyle("padding", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </Labeled>
                <Labeled label="Margin">
                    <input
                        type="text"
                        placeholder="e.g. 12px auto"
                        value={marginValue}
                        onChange={(e) => setStyle("margin", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </Labeled>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Labeled label="Letter spacing">
                    <input
                        type="text"
                        placeholder="e.g. 0.5px"
                        value={letterSpacingValue}
                        onChange={(e) => setStyle("letter-spacing", e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </Labeled>
            </div>
        </div>
    );

    const classesTab = (
        <div className="space-y-3">
            <Labeled label="Tailwind/Classes">
                <textarea
                    rows={2}
                    value={classNameValue}
                    onChange={(e) => setClassNameValue(e.target.value)}
                    placeholder="e.g. text-gray-900 font-semibold px-4 py-2 rounded-lg"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
            </Labeled>
            <div className="text-xs text-gray-500 dark:text-gray-400">
                Tip: You can paste Tailwind classes here. They will be applied directly to the selected element's class attribute.
            </div>
        </div>
    );

    const linkTab = isLink ? (
        <div className="space-y-3">
            <Labeled label="URL (href)">
                <input
                    type="text"
                    value={linkHref}
                    onChange={(e) => setLinkHref(e.target.value)}
                    placeholder="https://"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
            </Labeled>
            <div className="grid grid-cols-2 gap-3">
                <Labeled label="Target">
                    <select
                        value={linkTarget}
                        onChange={(e) => setLinkTarget(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Default</option>
                        <option value="_blank">_blank (new tab)</option>
                        <option value="_self">_self</option>
                        <option value="_parent">_parent</option>
                        <option value="_top">_top</option>
                    </select>
                </Labeled>
                <Labeled label="Rel">
                    <input
                        type="text"
                        value={linkRel}
                        onChange={(e) => setLinkRel(e.target.value)}
                        placeholder="e.g. nofollow noopener"
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </Labeled>
            </div>
        </div>
    ) : null;

    const imageTab = isImg ? (
        <div className="space-y-3">
            <Labeled label="Alt text">
                <input
                    type="text"
                    value={imgAlt}
                    onChange={(e) => setImgAlt(e.target.value)}
                    placeholder="Describe the image"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
            </Labeled>
        </div>
    ) : null;

    const tabsRender: Record<string, React.ReactNode> = {
        Content: contentTab,
        Styles: stylesTab,
        Classes: classesTab,
        ...(isLink ? { Link: linkTab } : {}),
        ...(isImg ? { Image: imageTab } : {}),
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Edit <span className="capitalize">{selected.tag}</span>
                    </h3>
                    <button
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 pt-4">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {tabList.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                    activeTab === tab
                                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-[60vh] overflow-auto pb-2">{tabsRender[activeTab]}</div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Press Cmd/Ctrl + S to save</div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 active:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LandingPageEditor({ inputHtml, html, setHtml, reloadCount }: Props) {
    const [selected, setSelected] = useState<SelectedType | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Content
    const [textValue, setTextValue] = useState<string>("");
    const [linkHref, setLinkHref] = useState<string>("");
    const [linkTarget, setLinkTarget] = useState<string>("");
    const [linkRel, setLinkRel] = useState<string>("");

    // Image
    const [imgUrl, setImgUrl] = useState<string>("");
    const [imgAlt, setImgAlt] = useState<string>("");
    const [validImageUrl, setValidImageUrl] = useState<string>(""); // for upload overwrite
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Classes
    const [classNameValue, setClassNameValue] = useState<string>("");

    // Inline styles
    const [styleObj, setStyleObj] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState<boolean>(false);

    const headContent = getHeadContent(inputHtml);
    const bodyClass = getBodyClass(inputHtml);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Refresh iframe when reloadCount changes (from parent)
    useEffect(() => {
        if (iframeRef.current) {
            iframeRef.current.src = `${iframeRef.current.src}?t=${new Date().getTime()}`;
        }
    }, [reloadCount]);

    // Inject HTML into iframe
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(`
  <html>
    <head>
      ${headContent}
      <style>
        :root { --sp-sel:#3b82f6; --sp-sel-2:rgba(59,130,246,.2); }
        [data-uid] { position: relative; }
        [data-uid]::after {
          content: "";
          position: absolute;
          inset: -2px;
          pointer-events: none;
          border-radius: 6px;
          opacity: 0;
          transition: opacity .15s ease;
          box-shadow: 0 0 0 0px var(--sp-sel-2);
        }
        [data-uid]:hover::after {
          opacity: 1;
          box-shadow: 0 0 0 2px var(--sp-sel-2);
          outline: 2px dashed var(--sp-sel);
          outline-offset: 2px;
        }
        [data-uid].selected::after {
          opacity: 1 !important;
          box-shadow: 0 0 0 2px var(--sp-sel-2);
          outline: 2px solid var(--sp-sel);
          outline-offset: 2px;
        }
        * { cursor: default !important; }
        a, button { cursor: pointer !important; }
      </style>
    </head>
    <body class="${bodyClass}">
      ${html}
      <script>
        window.__attachEditorListeners = function() {
          document.querySelectorAll('[data-uid]').forEach(function(el) {
            el.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              const tag = el.tagName.toLowerCase();
              const payload = {
                type: 'element-click',
                uid: el.getAttribute('data-uid'),
                tag,
                text: tag === 'img' ? '' : el.innerText,
                attrs: {
                  src: tag === 'img' ? el.getAttribute('src') : undefined,
                  alt: tag === 'img' ? el.getAttribute('alt') : undefined,
                  href: tag === 'a' ? el.getAttribute('href') : undefined,
                  target: tag === 'a' ? el.getAttribute('target') : undefined,
                  rel: tag === 'a' ? el.getAttribute('rel') : undefined,
                  className: el.getAttribute('class') || '',
                  style: el.getAttribute('style') || '',
                  id: el.getAttribute('id') || ''
                }
              };
              window.parent.postMessage(payload, '*');

              document.querySelectorAll('[data-uid]').forEach(function(x) {
                x.classList.remove('selected');
              });
              el.classList.add('selected');
            }, { capture: true });
          });
        };
        window.__attachEditorListeners();
      </script>
    </body>
  </html>
`);
        doc.close();
    }, [html, headContent, bodyClass]);

    // Listen for element clicks from iframe
    useEffect(() => {
        function handleMsg(event: MessageEvent) {
            const d = event.data;
            if (!d || d.type !== "element-click") return;

            const sel: SelectedType = {
                tag: d.tag,
                uid: d.uid,
                text: d.text || "",
                attrs: d.attrs || {},
            };
            setSelected(sel);

            // Initialize modal states
            setClassNameValue(sel.attrs.className || "");
            setStyleObj(parseStyleString(sel.attrs.style));

            if (sel.tag === "img") {
                const src = sel.attrs.src || "";
                setImgUrl(src);
                setImgAlt(sel.attrs.alt || "");
                if (src.startsWith("https://")) setValidImageUrl(src);
                setTextValue("");
                setLinkHref("");
                setLinkTarget("");
                setLinkRel("");
            } else if (sel.tag === "a") {
                setTextValue(sel.text || "");
                setLinkHref(sel.attrs.href || "");
                setLinkTarget(sel.attrs.target || "");
                setLinkRel(sel.attrs.rel || "");
                setImgUrl("");
                setImgAlt("");
            } else {
                setTextValue(sel.text || "");
                setImgUrl("");
                setImgAlt("");
                setLinkHref("");
                setLinkTarget("");
                setLinkRel("");
            }

            setShowModal(true);
            setImageFile(null);
        }
        window.addEventListener("message", handleMsg);
        return () => window.removeEventListener("message", handleMsg);
    }, []);

    // Keyboard: Esc to close, Cmd/Ctrl+S to save
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!showModal) return;
            if (e.key === "Escape") {
                e.preventDefault();
                closeModal();
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showModal, selected, textValue, imgUrl, classNameValue, styleObj, linkHref, linkTarget, linkRel, imgAlt, imageFile]);

    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
        // reset modal states
        setTextValue("");
        setClassNameValue("");
        setStyleObj({});
        setLinkHref("");
        setLinkTarget("");
        setLinkRel("");
        setImgUrl("");
        setImgAlt("");
        setImageFile(null);
    };

    // Save changes to the HTML
    const handleSave = useCallback(async () => {
        if (!selected) return;

        let newHtml = html;
        const doc = new DOMParser().parseFromString(newHtml, "text/html");

        const el = doc.querySelector<HTMLElement>(`[data-uid="${selected.uid}"]`);
        if (!el) {
            closeModal();
            return;
        }

        // Content updates
        if (selected.tag === "img") {
            let finalSrc = imgUrl;
            if (imageFile) {
                setLoading(true);
                try {
                    finalSrc = await uploadImageResource(imageFile, validImageUrl);
                } finally {
                    setLoading(false);
                }
            }
            if (finalSrc) el.setAttribute("src", finalSrc);
            else el.removeAttribute("src");
            if (imgAlt) el.setAttribute("alt", imgAlt);
            else el.removeAttribute("alt");
        } else if (selected.tag === "a") {
            // Update only the text part, keep children (e.g., SVG icons)
            setElementTextPreservingChildren(doc, el, textValue);

            // Href/target/rel
            if (linkHref) el.setAttribute("href", linkHref);
            else el.removeAttribute("href");

            if (linkTarget) el.setAttribute("target", linkTarget);
            else el.removeAttribute("target");

            if (linkRel) el.setAttribute("rel", linkRel);
            else el.removeAttribute("rel");
        } else {
            // Generic text content: preserve any child elements (e.g., <strong>, <em>, <svg>, etc.)
            setElementTextPreservingChildren(doc, el, textValue);
        }

        // Classes
        if (classNameValue?.trim()) el.setAttribute("class", classNameValue.trim());
        else el.removeAttribute("class");

        // Styles
        const nextStyleStr = styleObjToString(styleObj);
        if (nextStyleStr) el.setAttribute("style", nextStyleStr);
        else el.removeAttribute("style");

        const updated = doc.body.innerHTML;

        setHtml(updated);

        setShowModal(false);
        setSelected(null);
        // reset local state
        setTextValue("");
        setImgUrl("");
        setImgAlt("");
        setLinkHref("");
        setLinkTarget("");
        setLinkRel("");
        setClassNameValue("");
        setStyleObj({});
        setImageFile(null);
    }, [
        selected,
        html,
        imgUrl,
        imgAlt,
        linkHref,
        linkTarget,
        linkRel,
        textValue,
        classNameValue,
        styleObj,
        imageFile,
        validImageUrl,
        inputHtml,
        setHtml,
    ]);

    return (
        <div className="min-h-screen w-full bg-transparent text-black dark:text-white">
            <HelperBar />
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <iframe
                    ref={iframeRef}
                    title="Preview"
                    className="min-h-[80vh] w-full bg-white dark:bg-gray-900"
                    sandbox="allow-scripts allow-forms allow-popups allow-modals allow-storage-access-by-user-activation allow-same-origin"
                    allow="cross-origin-isolated"
                />
            </div>
            <Overlay show={showModal} onClick={closeModal} />
            <EditModal
                showModal={showModal}
                selected={selected}
                closeModal={closeModal}
                handleSave={handleSave}
                textValue={textValue}
                setTextValue={setTextValue}
                linkHref={linkHref}
                setLinkHref={setLinkHref}
                linkTarget={linkTarget}
                setLinkTarget={setLinkTarget}
                linkRel={linkRel}
                setLinkRel={setLinkRel}
                imgUrl={imgUrl}
                setImgUrl={setImgUrl}
                imgAlt={imgAlt}
                setImgAlt={setImgAlt}
                imageFile={imageFile}
                setImageFile={setImageFile}
                classNameValue={classNameValue}
                setClassNameValue={setClassNameValue}
                styleObj={styleObj}
                setStyleObj={setStyleObj}
            />
            {loading && <Loading />}
        </div>
    );
}