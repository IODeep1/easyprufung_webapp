import React, {Dispatch, Suspense, useEffect, useMemo, useRef, useState} from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useTexture, Stars } from "@react-three/drei";
import * as turf from "@turf/turf";
import {updateProject} from "../../../../../api/project/api-helper.ts";
import {changeSelectedProject} from "../../../../../store/actions/user/project.actions.ts";
import {useDispatch} from "react-redux";
import {Satellite} from "../../../Map/Helper/Satellite.tsx";
import {Countries} from "../../../Map/Helper/Countries.tsx";
import {calcLatLngFromVec3, getNormal, latLngToVec3} from "../../../Map/Helper/Calculator.ts";
import Loading from "../../../../Shared/Loading.tsx";
import LoadingMapOverlay from "../../../Map/Helper/LoadingMapOverlay.tsx";



function BuildingPin({ pin, onClick }) {
    // Adjust for desired size
    const scale = 1;

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
        >
            {/* Main building - wider, clear rectangular footprint */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[0.034 * scale, buildingHeight, 0.026 * scale]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.18} roughness={0.43} />
            </mesh>

            {/* Base shadow */}
            <mesh position={[0, -buildingHeight / 2 - 0.006 * scale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.044 * scale, 0.035 * scale]} />
                <meshStandardMaterial color="#000" opacity={0.12} transparent />
            </mesh>

            {/* Roof accent - "company" style */}
            <mesh position={[0, buildingHeight / 2 + 0.009 * scale, 0]}>
                <boxGeometry args={[0.028 * scale, 0.007 * scale, 0.020 * scale]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.45} roughness={0.2} />
            </mesh>
            {/* Suggest central atrium with glass (looks good from above) */}
            <mesh position={[0, buildingHeight / 2 + 0.013 * scale, 0]}>
                <boxGeometry args={[0.010 * scale, 0.002 * scale, 0.007 * scale]} />
                <meshStandardMaterial color="#bae6fd" metalness={0.6} roughness={0.1} opacity={0.5} transparent />
            </mesh>

            {/* Small rooftop "unit" */}
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

            {/* Windows, more "corporate" aligned on two sides */}
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

            {/* Company name tag remains the same */}
            <Html
                distanceFactor={4}
                position={[0, buildingHeight / 2 + 0.037 * scale, 0]}
                zIndexRange={[100, 0]}
            >
                <div
                    className="flex items-center font-semibold bg-slate-900/80 text-white font-mono whitespace-nowrap shadow cursor-pointer"
                    style={{
                        fontSize: `${5 * scale}px`,
                        lineHeight: 1,
                        padding: `${1 * scale}px ${8 * scale}px ${1 * scale}px ${2 * scale}px`,
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

                </div>
            </Html>
        </group>
    );
}


// The rotating Earth with the single Pin
function EarthMesh({ pin, onEarthClick, onPinClick, setCountriesExternal, onLoaded }) {
    const [texture] = useTexture(["/earth-daymap-8k.jpg"]);
    const earthGroupRef = useRef();

    useEffect(() => {
        if (texture) onLoaded();
    }, [texture]);

    const handlePointerDown = (e) => {
        const mesh = earthGroupRef.current.children[0];
        const localPoint = mesh.worldToLocal(e.point.clone());
        const { lat, lng } = calcLatLngFromVec3(localPoint);
        onEarthClick({ lat, lng }); // Pass to parent
    };
    return (
        <group ref={earthGroupRef}>
            <mesh onPointerDown={handlePointerDown}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial map={texture} />
            </mesh>
            {pin &&
                <BuildingPin pin={pin} onClick={onPinClick} />}
            <Countries geojsonUrl={"/contries.geo.json"} setCountriesExternal={setCountriesExternal} />
        </group>
    );
}

// The main globe scene – only one pin, moves when the Earth is clicked!
export default function Globe({ project }) {
    const dispatch: Dispatch<any> = useDispatch();
    // Pin state
    const [pin, setPin] = useState({
        name: project.name,
        icon: project.logoUrl,
        description: project.description,
        lat: project.latitude,
        lng: project.longitude,
        url: project.tempUrl,
    });

    const [loading, setLoading] = useState(false);
    const [loadingMap, setLoadingMap] = useState(true);
    const [showInfo, setShowInfo] = useState(true);
    const [lastCoords, setLastCoords] = useState(null);
    const [countries, setCountries] = useState([]);
    const [countryName, setCountryName] = useState(""); // For display when clicked

    // Handler to move the pin and lookup country
    const handleEarthClick = ({ lat, lng }) => {
        if(showInfo)
            setShowInfo(false);
        setPin(cur => ({
            ...cur,
            lat,
            lng
        }));
        setLastCoords({ lat, lng });

        // --- COUNTRY DETECT ---
        const point = turf.point([lng, lat]);
        // Search for country containing this point (could optimize e.g. with a spatial index for large files)
        const country = countries.find(feature =>
            turf.booleanPointInPolygon(point, feature)
        );
        setCountryName(country ? (country.properties.name || "Unknown") : "Unknown");
    };

    const [modalData, setModalData] = useState(null);

    const selectLocation = async () => {
        setLoading(true);
        const updatedProject = {
            ...project,
            isPublic: true,
            latitude: pin.lat,
            longitude: pin.lng,
            country: countryName, // include if you want; optional
        };
        const _project = await updateProject(updatedProject);
        if(_project){
            dispatch(changeSelectedProject(_project));
        }
        setLoading(false);
    };
    return (
        <div className="relative h-screen rounded-lg bg-gray-900 text-white flex flex-col">
            {loadingMap && <LoadingMapOverlay />}
            {/* Info display for current lat/lng and country */}
            {lastCoords && (
                <div className="absolute left-1/2 top-5 -translate-x-1/2 z-20 bg-black/80 rounded px-4 py-2 text-white text-sm font-mono flex items-center gap-3">
                    <span>
                        <b>Country:</b> {countryName}
                    </span>
                    <button
                        onClick={selectLocation}
                        className="ml-2 px-2 py-2 rounded bg-blue-600 hover:bg-blue-500 font-semibold text-xs"
                    >Select location</button>
                </div>
            )}

            {showInfo &&
                <div className="absolute top-5 left-5 z-30 bg-black/70 rounded px-4 py-2 text-white text-sm font-mono shadow-lg max-w-xs">
                    <h2 className="font-semibold text-base mb-1">Info</h2>
                    <p>Choose where you'd like to launch your idea. It will be publicly visible on the EasyPrufung website.</p>
                    <br/>
                    <p>Click on Earth to move the marker! Zoom and pan to explore.</p>
                </div>
            }
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
                            pin={pin}
                            onEarthClick={handleEarthClick}
                            onPinClick={setModalData}
                            setCountriesExternal={setCountries}
                            onLoaded={() => setLoadingMap(false)}
                        />
                        <Satellite altitude={3.25} speed={0.3} size={0.15} color="orange" />
                        <OrbitControls enableZoom minDistance={2.3} zoomSpeed={0.5} />
                    </Suspense>
                </Canvas>
            </div>
            {loading &&  <Loading text="Loading"/> }
        </div>
    );
}