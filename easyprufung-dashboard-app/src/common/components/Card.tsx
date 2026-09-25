export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-gray-800 shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-600 rounded-2xl p-4  ${className}`}>
            {children}
        </div>
    );
}
