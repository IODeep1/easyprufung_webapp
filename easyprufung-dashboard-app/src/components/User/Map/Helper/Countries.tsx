import React, {useEffect, useState} from "react";
import {latLngToVec3} from "./Calculator.ts";

function LineString({ coords }) {
    const points = coords.map(([lng, lat]) => latLngToVec3(lat, lng, 2));
    return (
        <line>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length}
                    array={new Float32Array(points.flat())}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color="#eaeaea" linewidth={1} />
        </line>
    );
}
export function Countries({ geojsonUrl, setCountriesExternal }) {
    const [countries, setCountries] = useState([]);
    useEffect(() => {
        fetch(geojsonUrl)
            .then(res => res.json())
            .then(data => {
                setCountries(data.features);
                if (setCountriesExternal) setCountriesExternal(data.features);
            });
    }, [geojsonUrl, setCountriesExternal]);
    return (
        <group>
            {countries.map((country, idx) => (
                <group key={`country-lines-${idx}`}>
                    {country.geometry.type === "Polygon" &&
                        country.geometry.coordinates.map((ring, i) => (
                            <LineString key={i} coords={ring} />
                        ))}
                    {country.geometry.type === "MultiPolygon" &&
                        country.geometry.coordinates.map((poly, i) =>
                            poly.map((ring, j) => (
                                <LineString key={`${i}-${j}`} coords={ring} />
                            ))
                        )}
                </group>
            ))}
        </group>
    );
}