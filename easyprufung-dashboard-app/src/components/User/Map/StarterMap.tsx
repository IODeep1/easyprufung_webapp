import React, {Suspense, useEffect, useMemo, useRef, useState} from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useTexture, Stars } from "@react-three/drei";
import {getPublicProjects, upvoteProject} from "../../../api/project/api-helper.ts";
import {Satellite} from "./Helper/Satellite.tsx";
import {Countries} from "./Helper/Countries.tsx";
import {getNormal, latLngToVec3} from "./Helper/Calculator.ts";
import {COUNTRY_NAME_TO_CODE} from "../Projects/ProjectPublish/Map/Constants.ts";
import LoadingMapOverlay from "./Helper/LoadingMapOverlay.tsx";

// Top-left floating filter
function CountryFilterFrame({ pins, selectedCountry, setSelectedCountry }) {
    // Collect country info, sorted
    const countryInfo = useMemo(() => {
        const map = {};
        pins.forEach(pin => {
            if (!pin.country) return;
            map[pin.country] = (map[pin.country] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }, [pins]);

    return (
        <div
            className="
                fixed top-20 left-6 z-20
                bg-black/40 dark:bg-black/60 backdrop-blur-md
                rounded-xl
                p-4 w-72
            "
            style={{userSelect: "none", fontFamily: "Inter, sans-serif"}}
        >
            <div className="flex flex-col max-h-80 overflow-y-auto gap-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900/0">
                <button
                    className={`  
                        flex items-center gap-2 px-3 py-2 rounded-lg transition  
                       ${
                        !selectedCountry  && "bg-white/10 font-bold"
                        } 
                        `}
                    onClick={() => setSelectedCountry(null)}
                >
                    <span className="mr-1.5 text-base">🌍</span>
                    <span className="flex-1 truncate text-sm">All countries</span>
                    <span className="ml-2 font-mono text-xs">{pins.length}</span>
                </button>
                <div className="divide-y divide-white/5">
                    {countryInfo.map(([country, count]) => (
                        <button
                            key={country}
                            className={`  
                            flex items-center gap-2 px-3 py-2 w-full rounded-lg transition  text-white
                            ${
                                selectedCountry === country && "bg-white/10 font-bold"
                            }  
                        `}
                            onClick={() => setSelectedCountry(country)}
                        >
                            {COUNTRY_NAME_TO_CODE[country] ? (
                                <img
                                    src={`https://flagcdn.com/w40/${COUNTRY_NAME_TO_CODE[country].toLowerCase()}.png`}
                                    className="rounded border border-white/30 mr-1.5"
                                    alt={country}
                                    style={{width: 22, height: 13, flexShrink: 0}}
                                />
                            ) : (
                                <span className="inline-block mr-1.5" style={{width: 22}}></span>
                            )}
                            <span className="flex-1 truncate text-sm">{country}</span>
                            <span className="ml-2 font-mono text-xs">{count}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// On-globe building pin
function BuildingPin({ pin, onClick }) {
    // Adjust for desired size
    const scale = 0.9;
    const buildingHeight = 0.01 * scale;
    const globeRadius = 2;
    const basePos = latLngToVec3(pin.lat, pin.lng, globeRadius);
    const normal = useMemo(
        () => getNormal(pin.lat, pin.lng, globeRadius),
        [pin.lat, pin.lng]
    );
    const offset = normal.clone().multiplyScalar(buildingHeight / 2 + 0.002 * scale);
    const buildingPos = [
        basePos[0] + offset.x,
        basePos[1] + offset.y,
        basePos[2] + offset.z,
    ];
    const quaternion = useMemo(() => {
        const up = new THREE.Vector3(0, 1, 0);
        const q = new THREE.Quaternion();
        q.setFromUnitVectors(up, normal);
        return q;
    }, [normal]);
    return (
        <group
            position={buildingPos}
            quaternion={quaternion}
            onPointerDown={e => {
                e.stopPropagation();
                if (onClick) onClick(pin);
            }}
        >
            {/* Main building */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[0.034 * scale, buildingHeight, 0.026 * scale]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.18} roughness={0.43} />
            </mesh>
            {/* Base shadow */}
            <mesh position={[0, -buildingHeight / 2 - 0.006 * scale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.044 * scale, 0.035 * scale]} />
                <meshStandardMaterial color="#000" opacity={0.12} transparent />
            </mesh>
            {/* Roof accent */}
            <mesh position={[0, buildingHeight / 2 + 0.009 * scale, 0]}>
                <boxGeometry args={[0.028 * scale, 0.007 * scale, 0.020 * scale]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.45} roughness={0.2} />
            </mesh>
            {/* Central atrium/glass */}
            <mesh position={[0, buildingHeight / 2 + 0.013 * scale, 0]}>
                <boxGeometry args={[0.010 * scale, 0.002 * scale, 0.007 * scale]} />
                <meshStandardMaterial color="#bae6fd" metalness={0.6} roughness={0.1} opacity={0.5} transparent />
            </mesh>
            {/* Rooftop unit */}
            <mesh position={[-0.012 * scale, buildingHeight / 2 + 0.016 * scale, 0.010 * scale]}>
                <boxGeometry args={[0.006 * scale, 0.003 * scale, 0.006 * scale]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.13} />
            </mesh>
            {/* Central subtle glow */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.018 * scale, 12, 8]} />
                <meshBasicMaterial color="#22d3ee" opacity={0.04} transparent />
            </mesh>
            {/* Door with frame */}
            <mesh position={[0, -buildingHeight / 3, 0.013 * scale]}>
                <boxGeometry args={[0.009 * scale, 0.018 * scale, 0.0025 * scale]} />
                <meshStandardMaterial color="#64748b" metalness={0.29} roughness={0.6} />
            </mesh>
            <mesh position={[0, -buildingHeight / 3, 0.014 * scale]}>
                <boxGeometry args={[0.011 * scale, 0.020 * scale, 0.001 * scale]} />
                <meshStandardMaterial color="#334155" metalness={0.05} roughness={0.95} opacity={0.2} transparent />
            </mesh>
            {/* Left company windows */}
            {[...Array(2)].map((_, i) => (
                <mesh key={'winl' + i} position={[-0.012 * scale, 0.008 * scale - i * 0.016 * scale, 0.012 * scale]}>
                    <boxGeometry args={[0.003 * scale, 0.013 * scale, 0.0017 * scale]} />
                    <meshStandardMaterial
                        color="#38bdf8"
                        emissive="#bae6fd"
                        emissiveIntensity={0.18}
                        metalness={0.25}
                        roughness={0.16}
                        opacity={0.97}
                        transparent
                    />
                </mesh>
            ))}
            {/* Right windows */}
            {[...Array(2)].map((_, i) => (
                <mesh key={'winr' + i} position={[0.012 * scale, 0.008 * scale - i * 0.016 * scale, 0.012 * scale]}>
                    <boxGeometry args={[0.003 * scale, 0.013 * scale, 0.0017 * scale]} />
                    <meshStandardMaterial
                        color="#38bdf8"
                        emissive="#bae6fd"
                        emissiveIntensity={0.18}
                        metalness={0.25}
                        roughness={0.16}
                        opacity={0.97}
                        transparent
                    />
                </mesh>
            ))}
            {/* Name tag */}
            <Html
                distanceFactor={4}
                position={[0, buildingHeight / 2 + 0.037 * scale, 0]}
                zIndexRange={[100, 0]}
            >
                <div
                    onPointerDown={e => {
                        e.stopPropagation();
                        if (onClick) onClick(pin);
                    }}
                    className="flex items-center font-semibold bg-slate-900/80 text-white font-mono whitespace-nowrap shadow cursor-pointer"
                    style={{
                        fontSize: `${5 * scale}px`,
                        lineHeight: 1,
                        padding: `${1 * scale}px ${2 * scale}px`,
                        borderRadius: `${2 * scale}px`,
                    }}
                >
                    <img
                        style={{
                            display: "inline-block",
                            width: 7 * scale,
                            height: 7 * scale,
                            marginRight: 3 * scale,
                        }}
                        src={`${(process.env.NODE_ENV === 'development') ?"http://localhost:8080":"https://app.easyprufung.com"}${pin.icon}`}
                    />
                    {pin.name}
                    <span
                        className="ml-1 bg-blue-600 text-white"
                        style={{
                            fontSize: 4 * scale,
                            fontWeight: "bold",
                            marginLeft: 4 * scale,
                            minWidth: 8 * scale,
                            textAlign: "center",
                            display: "inline-block",
                            padding: `0 ${1 * scale}px`,
                            borderRadius: `${2 * scale}px`
                        }}
                        title={`${pin.upvotes} upvotes`}
                    >
                        ▲ {pin.upvote}
                    </span>
                </div>
            </Html>
        </group>
    );
}

// Rotating Earth with all children/pins and country outlines
function EarthMesh({ pins, onPinClick, onLoaded }) {
    const [texture] = useTexture(["/earth-daymap-8k.jpg"]);
    const earthGroupRef = useRef();
    useFrame(() => { if (earthGroupRef.current) earthGroupRef.current.rotation.y -= 0.0004; });
    useEffect(() => {
        if (texture) onLoaded();
    }, [texture]);

    return (
        <group ref={earthGroupRef}>
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial map={texture} />
            </mesh>
            {pins.map((pin, idx) => (
                <BuildingPin key={idx} pin={pin} onClick={onPinClick} />
            ))}
            <Countries geojsonUrl={"/contries.geo.json"} />
        </group>
    );
}

function PinPopup({ pin, onClose, onUpvote }) {
    if (!pin) return null;
    const countryCode = COUNTRY_NAME_TO_CODE[pin.country];
    return (
        <div
            style={{ zIndex: 150 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md"
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div
                className="bg-white/[0.98] dark:bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4 p-8 relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition duration-200"
                    aria-label="Close"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path
                            fillRule="evenodd"
                            d="M10 8.586l4.95-4.95a1 1 0 111.415 1.415l-4.95 4.95 4.95 4.95a1 1 0 01-1.415 1.415l-4.95-4.95-4.95 4.95a1 1 0 01-1.415-1.415l4.95-4.95-4.95-4.95A1 1 0 015.05 3.636l4.95 4.95z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {/* Header: icon, name, upvote */}
                <div className="flex items-center mb-2">
                    <img
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full shadow mr-3"
                        src={`${(process.env.NODE_ENV === 'development')
                            ? "http://localhost:8080"
                            : "https://app.easyprufung.com"}${pin.icon}`}
                        alt="icon"
                    />
                    <h2
                        className="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[18rem]"
                        title={pin.name}
                    >
                        {pin.name}
                    </h2>
                    <button
                        type="button"
                        className="ml-auto flex mr-6 flex-col items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                        aria-label="Upvote"
                        onClick={e => {
                            e.stopPropagation();
                            if (onUpvote) onUpvote(pin);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-black dark:text-white"
                        >
                            <path d="m18 15-6-6-6 6" />
                        </svg>
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-[-5px]">
              {pin.upvote}
            </span>
                    </button>
                </div>

                {/* Description (scrollable if too long) */}
                <div className="mb-3 text-gray-800 dark:text-gray-200 text-sm max-h-75 overflow-auto whitespace-pre-line break-words">
                    {pin.description}
                </div>

                {/* Footer: Website & Country */}
                <div className="flex justify-center">
                    <div className="flex w-full max-w-md justify-between items-center">
                        {pin.url && (
                            <a
                                href={pin.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition"
                            >
                                Check website
                            </a>
                        )}
                        <div className="flex-1" />
                        {pin.country && (
                            <div className="flex items-center">
                                <img
                                    src={countryCode ? `https://flagcdn.com/w40/${countryCode}.png` : ""}
                                    alt={pin.country}
                                    className="w-8 h-6 rounded border-gray-300 dark:border-gray-700 shadow"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{pin.country}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StarterMap({showFilter}) {
    const [loading, setLoading] = useState(true);
    const [filterVisible, setFilterVisible] = useState(showFilter);

    const [pins, setPins] = useState([
        {
            name: "EasyPrufung",
            description: "EasyPrufung is your all-in-one AI cofounder for launching a startup. Whether you’re brainstorming a new business idea or getting ready to go live, EasyPrufung makes the process simple.",
            country: "Germany",
            lat: 51.2205,
            lng: 6.7583,
            url: "https://easyprufung.com",
            icon: "<svg viewBox='0 0 16 16' fill='currentColor'><circle cx='8' cy='8' r='7' fill='#0ea5e9'/></svg>",
            upvote: 100
        }
    ]);
    const [selectedPin, setSelectedPin] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Download real pins
    useEffect(() => {
        setFilterVisible(showFilter);
        const processApi = async () => {
            const projects = await getPublicProjects();
            const projectPins = projects.map(project => ({
                uuid: project.uuid,
                name: project.name,
                country: project.country,
                icon: project.logoUrl,
                upvote: project.upvote,
                description: project.description,
                lat: project.latitude,
                lng: project.longitude,
                url: (project.url ? project.url : project.tempUrl),
            }));
            setPins(projectPins);
        };
        processApi();
    }, [reloadTrigger]);

    // Only pins for selected country (or all)
    const filteredPins = useMemo(
        () => selectedCountry ? pins.filter(pin => pin.country === selectedCountry) : pins,
        [pins, selectedCountry]
    );

    const onUpvote = async () => {
        if (selectedPin == null) return;
        if(!localStorage.getItem('access-token')) window.parent.location.href=(process.env.NODE_ENV === 'development') ?"http://localhost:3006/login":"https://app.easyprufung.com/login"
        let result = await upvoteProject(selectedPin.uuid);
        if(result) {
            setSelectedPin(prev => ({
                ...prev,
                upvote: selectedPin.upvote + 1
            }));
            setReloadTrigger(prev => prev + 1);
        }
    };

    return (
        <div className="relative h-screen bg-gray-900 text-white flex flex-col">
            {loading && <LoadingMapOverlay />}
            {filterVisible && <CountryFilterFrame
                pins={pins}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
            />}
            <div className="flex-1">
                <Canvas camera={{ position: [0, 0, 4] }}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={1} />
                        <directionalLight position={[5, 3, 5]} intensity={0.8} />
                        <Stars
                            radius={100}
                            depth={60}
                            count={5000}
                            factor={4}
                            saturation={0}
                            fade
                            speed={1}
                        />
                        <EarthMesh
                            pins={filteredPins}
                            onPinClick={setSelectedPin}
                            onLoaded={() => setLoading(false)}
                        />
                        <Satellite altitude={3.25} speed={0.3} size={0.15} color="orange" />
                        <OrbitControls
                            enableZoom
                            minDistance={2.1}
                            zoomSpeed={0.5}
                        />
                    </Suspense>
                </Canvas>
            </div>
            <PinPopup pin={selectedPin} onClose={() => setSelectedPin(null)} onUpvote={onUpvote} />
        </div>
    );
}