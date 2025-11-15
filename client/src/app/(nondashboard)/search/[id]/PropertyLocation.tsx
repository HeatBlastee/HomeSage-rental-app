import React, { useEffect, useRef } from "react";
import { useGetPropertyQuery } from "@/state/api";
import { Compass, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type PropertyDetailsProps = { propertyId: number };

const PropertyLocation = ({ propertyId }: PropertyDetailsProps) => {
    const {
        data: property,
        isError,
        isLoading,
    } = useGetPropertyQuery(propertyId);

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === "undefined") return; 
        if (isLoading || isError || !property) return;

        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const lat = property.location.coordinates.latitude;
        const lng = property.location.coordinates.longitude;

        if (!mapContainerRef.current) return;
        const map = L.map(mapContainerRef.current, {
            center: [lat, lng],
            zoom: 14,
            scrollWheelZoom: false,
        });

        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
        <path fill="#000000" d="M12 2C8.1 2 5 5.1 5 9c0 5.3 6.7 11.7 6.9 11.9.2.2.5.2.7 0C12.3 20.7 19 14.3 19 9c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>
      </svg>
    `);

        const icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="transform: translate(-50%, -100%); width:36px; height:36px;">${decodeURIComponent(
                svg
            )}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
        });

        L.marker([lat, lng], { icon }).addTo(map);

        setTimeout(() => map.invalidateSize(), 0);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [property, isError, isLoading]);

    if (isLoading) return <>Loading...</>;
    if (isError || !property) return <>Property not Found</>;

    const address = property.location?.address || "";


    return (
        <div className="py-16">
            <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">
                Map and Location
            </h3>
            <div className="flex justify-between items-center text-sm text-primary-500 mt-2">
                <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1 text-gray-700" />
                    Property Address:
                    <span className="ml-2 font-semibold text-gray-700">
                        {property.location?.address || "Address not available"}
                    </span>
                </div>
                <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                        property.location?.address || ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between items-center hover:underline gap-2 text-primary-600"
                >
                    <Compass className="w-5 h-5" />
                    Get Directions
                </a>
            </div>
            <div
                className="relative mt-4 h-[300px] rounded-lg overflow-hidden"
                ref={mapContainerRef}
            />
        </div>
    );
};

export default PropertyLocation;