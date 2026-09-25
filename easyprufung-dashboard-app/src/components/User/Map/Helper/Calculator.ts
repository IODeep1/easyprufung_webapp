import * as THREE from "three";

const RADIUS = 2;
const DEG = 57.2957795;

export function calcLatLngFromVec3(pp) {
    const lati = 90 - (DEG * Math.acos(-pp.y / RADIUS));
    let longi;
    if (pp.z >= 0) {
        longi = -90 + (DEG * Math.atan(pp.x / pp.z));
    } else {
        const temp = 180 + (DEG * Math.atan(pp.x / pp.z));
        if (temp <= 180) {
            longi = -(90 - temp);
        } else {
            longi = temp - 90;
        }
    }
    return {
        lat: -Number(lati),
        lng: Number(longi),
    };
}

export function latLngToVec3(lat, lng, radius = RADIUS) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return [x, y, z];
}


// Helper to get normalized direction from center
export function getNormal(lat, lng, radius) {
    const [x, y, z] = latLngToVec3(lat, lng, radius);
    const normal = new THREE.Vector3(x, y, z).normalize();
    return normal;
}