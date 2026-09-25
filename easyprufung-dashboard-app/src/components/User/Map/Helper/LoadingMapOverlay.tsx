// LoadingOverlay.js
export default function LoadingMapOverlay() {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/30 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-50"></div>
            <span className="ml-4 text-xl text-white font-semibold">Loading map...</span>
        </div>
    );
}