"use client";
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

const iconRetina = new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href;
const iconUrl = new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href;
const shadowUrl = new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

function parseCoords(raw: any): [number, number] | null {
    if (!raw) return null;

    if (typeof raw === "object" && !Array.isArray(raw)) {
        const lat = Number(raw.latitude ?? raw.lat ?? raw.Lat ?? raw.Latitude);
        const lon = Number(raw.longitude ?? raw.lon ?? raw.lng ?? raw.Longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) return [lat, lon];
    }

    if (Array.isArray(raw) && raw.length >= 2) {
        const a = Number(raw[0]);
        const b = Number(raw[1]);
        if (a >= -90 && a <= 90 && b >= -180 && b <= 180) return [a, b];
        if (b >= -90 && b <= 90 && a >= -180 && a <= 180) return [b, a];
    }

    if (typeof raw === "string") {
        const m = raw.match(/POINT\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
        if (m) {
            const lon = parseFloat(m[1]);
            const lat = parseFloat(m[2]);
            if (!Number.isNaN(lat) && !Number.isNaN(lon)) return [lat, lon];
        }
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length >= 2) {
                const lon = Number(parsed[0]),
                    lat = Number(parsed[1]);
                if (!Number.isNaN(lat) && !Number.isNaN(lon)) return [lat, lon];
            }
        } catch { }
    }

    return null;
}

const Map = () => {
    const filters = useAppSelector((state) => state.global.filters);
    const { data: properties, isLoading, isError } = useGetPropertiesQuery(filters);
    const itemsWithPos = useMemo(() => {
        if (!properties) return [];
        return properties
            .map((p: Property) => {
                const raw = p?.location?.coordinates ?? p?.coordinates ?? null;
                const pos = parseCoords(raw);
                if (!pos) return null;
                const [lat, lon] = pos;
                if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
                return { property: p, position: pos as [number, number] };
            })
            .filter(Boolean) as { property: Property; position: [number, number] }[];
    }, [properties]);

    


    const center = useMemo<[number, number]>(() => {
        if (filters?.coordinates) {
            const fc = filters.coordinates;
            if (Array.isArray(fc) && fc.length >= 2) {
                const a = Number(fc[0]),
                    b = Number(fc[1]);
                return [b, a];
            }
        }

        if (itemsWithPos.length === 0) return [19.076, 72.8777]; // Mumbai fallback
        const avgLat = itemsWithPos.reduce((s, it) => s + it.position[0], 0) / itemsWithPos.length;
        const avgLon = itemsWithPos.reduce((s, it) => s + it.position[1], 0) / itemsWithPos.length;
        return [avgLat, avgLon];
    }, [filters.coordinates, itemsWithPos]);

    const MapUpdater = ({ center }: { center: [number, number] }) => {
        const map = useMap();
        React.useEffect(() => {
            if (center) {
                map.flyTo(center, 13, { duration: 1.5 }); // Smooth transition
            }
        }, [center, map]);

        return null;
    };
    

    if (isLoading) return <>Loading map...</>;
    if (isError || !properties) return <div>Failed to fetch properties</div>;

    return (
        <div className="basis-5/12 grow relative rounded-xl h-[600px] z-10">
            <MapContainer key={center.join(",")} center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={center} />

                {itemsWithPos.map(({ property, position }) => (
                    <Marker key={property.id} position={position}>
                        <Popup>
                            <div>
                                <strong>{property.name ?? property.title}</strong>
                                {property.description && <div>{property.description}</div>}
                                <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
                                    {property.location?.address ?? property.location?.city}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

        </div>
    );
};

export default Map;
