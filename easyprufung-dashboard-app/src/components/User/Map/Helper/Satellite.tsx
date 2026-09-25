import React, {useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {Html} from "@react-three/drei";
import Logo from "../../../../images/logo.png";

export function Satellite({
                              altitude = 2.25,
                              speed = 0.15,
                              inclination = 38, // degrees, adjust for fun
                              size = 0.05,
                              name = "EasyPrufung",
                              showLabel = true,
                              color = "#dbeafe"
                          }) {
    const ref = useRef();
    const inclinationRad = inclination * Math.PI / 180;

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * speed;
        // Basic inclined circular orbit
        const x = altitude * Math.cos(t) * Math.cos(inclinationRad);
        const y = altitude * Math.sin(inclinationRad);
        const z = altitude * Math.sin(t) * Math.cos(inclinationRad);
        if (ref.current) {
            ref.current.position.set(x, y, z);
            ref.current.rotation.y = -t; // optional: spin satellite to "face forward"
        }
    });

    return (
        <group ref={ref}>
            {/* Satellite BODY */}
            <mesh>
                <boxGeometry args={[size * 0.6, size * 0.4, size * 0.4]} />
                <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* SOLAR PANEL LEFT */}
            <mesh position={[-size * 0.65, 0, 0]}>
                <boxGeometry args={[size * 0.7, size * 0.13, size * 0.02]} />
                <meshStandardMaterial color="#2563eb" metalness={0.5} roughness={0.5} emissive="#60a5fa" />
            </mesh>
            {/* SOLAR PANEL RIGHT */}
            <mesh position={[size * 0.65, 0, 0]}>
                <boxGeometry args={[size * 0.7, size * 0.13, size * 0.02]} />
                <meshStandardMaterial color="#2563eb" metalness={0.5} roughness={0.5} emissive="#60a5fa" />
            </mesh>
            {/* Antenna dish */}
            <mesh position={[0, -size*0.27, size*0.13]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[size * 0.06, size * 0.18, size * 0.1, 14, 1, true]} />
                <meshStandardMaterial color="#fee2e2" metalness={0.9} roughness={0.4} side={2} />
            </mesh>
            {/* Optional: Satellite label */}
            {showLabel && (
                <Html distanceFactor={10} position={[0, size * 0.33, 0]} zIndexRange={[100, 0]}>
                    <div className="text-[6px] px-2 py-0.5 rounded bg-slate-900/80 text-white  font-mono whitespace-nowrap shadow">
                        <div className="flex justify-center items-center space-x-2">
                            <img alt="logo" width="8" height="8" src={Logo}  />
                            {name}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}