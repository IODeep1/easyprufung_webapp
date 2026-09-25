import React, { useMemo, useState } from "react";

function formatDateToLocalTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const time = date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    return `${year}-${month}-${day} at ${time}`;
}

const ITEMS_PER_PAGE = 10;

export default function WaitlistList({ project }) {
    const waitlists = Array.isArray(project?.waitlists) ? project.waitlists : [];

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [copiedIdx, setCopiedIdx] = useState(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return waitlists;
        const q = search.toLowerCase();
        return waitlists.filter((w) => w?.email?.toLowerCase().includes(q));
    }, [waitlists, search]);

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const paginatedWaitlist = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    function handlePrev() {
        setPage((p) => Math.max(1, p - 1));
    }

    function handleNext() {
        setPage((p) => Math.min(totalPages, p + 1));
    }

    function resetSearch() {
        setSearch("");
        setPage(1);
    }

    const copyEmail = async (email, idx) => {
        try {
            await navigator.clipboard.writeText(email);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1200);
        } catch {}
    };


return (
    <div className="w-full mt-8 sm:mt-0">
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

        {/* Header */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 dark:bg-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-white dark:text-black"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </span>
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-black dark:text-white sm:text-3xl">
                        Waitlist
                    </h2>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        Total: {waitlists.length.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Actions: search + export */}
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="m21 21-4.3-4.3" />
                        <circle cx="11" cy="11" r="8" />
                    </svg>
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by email..."
                        className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                        type="text"
                    />
                    {search && (
                        <button
                            onClick={resetSearch}
                            title="Clear"
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-black">
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="w-2/3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                            Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                            Join Date
                        </th>
                        <th className="px-4 py-3" />
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedWaitlist.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                No waitlist entries found.
                            </td>
                        </tr>
                    ) : (
                        paginatedWaitlist.map((item, idx) => (
                            <tr
                                key={`${item.email}-${idx}`}
                                className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                            >
                                <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.email}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {formatDateToLocalTime(item.joinedDate)}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => copyEmail(item.email, idx)}
                                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        {copiedIdx === idx ? "Copied" : "Copy"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Footer: Pagination info */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 p-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400 sm:flex-row">
                <div>
                    Showing {totalItems === 0 ? 0 : startIdx + 1} - {Math.min(startIdx + ITEMS_PER_PAGE, totalItems)} of {totalItems}
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={page === 1}
                            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm ${
                                page === 1
                                    ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            }`}
                        >
                            Previous
                        </button>
                        <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
            Page {page} of {totalPages}
          </span>
                        <button
                            onClick={handleNext}
                            disabled={page === totalPages}
                            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm ${
                                page === totalPages
                                    ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
);
}