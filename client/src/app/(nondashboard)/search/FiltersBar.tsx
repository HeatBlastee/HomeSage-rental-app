import {
    FiltersState,
    setFilters,
    setViewMode,
    toggleFiltersFullOpen,
} from "@/state";
import { useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { cleanParams, cn, formatPriceValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PropertyTypeIcons } from "@/lib/constants";

/**
 * NOTE: This version uses OpenStreetMap / Nominatim for geocoding instead of Mapbox.
 * Nominatim is free but rate-limited and intended for light usage. Consider a paid provider
 * for production traffic.
 */

const FiltersBar = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const filters = useAppSelector((state) => state.global.filters);
    const isFiltersFullOpen = useAppSelector(
        (state) => state.global.isFiltersFullOpen
    );
    const viewMode = useAppSelector((state) => state.global.viewMode);
    const [searchInput, setSearchInput] = useState(filters.location);

    const updateURL = debounce((newFilters: FiltersState) => {
        const cleanFilters = cleanParams(newFilters);
        const updatedSearchParams = new URLSearchParams();

        Object.entries(cleanFilters).forEach(([key, value]) => {
            updatedSearchParams.set(
                key,
                Array.isArray(value) ? value.join(",") : value.toString()
            );
        });

        router.push(`${pathname}?${updatedSearchParams.toString()}`);
    });

    const handleFilterChange = (
        key: string,
        value: any,
        isMin: boolean | null
    ) => {
        let newValue = value;

        if (key === "priceRange" || key === "squareFeet") {
            const currentArrayRange = [...filters[key]];
            if (isMin !== null) {
                const index = isMin ? 0 : 1;
                currentArrayRange[index] = value === "any" ? null : Number(value);
            }
            newValue = currentArrayRange;
        } else if (key === "coordinates") {
            newValue = value === "any" ? [0, 0] : value.map(Number);
        } else {
            newValue = value === "any" ? "any" : value;
        }

        const newFilters = { ...filters, [key]: newValue };
        dispatch(setFilters(newFilters));
        updateURL(newFilters);
    };

    // ---------- Replaced Mapbox geocoding with Nominatim (OpenStreetMap) ----------
    const handleLocationSearch = async () => {
        const q = (searchInput || "").trim();
        if (!q) return;

        try {
            // Nominatim search endpoint (format=json). limit=1 for single result.
            // We include a small 'User-Agent' header as recommended by the Nominatim usage policy.
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
                q
            )}`;

            const response = await fetch(url, {
                headers: {
                    // polite header — if you have your own domain include it here
                    "User-Agent": "YourAppName/1.0 (your.email@example.com)",
                    "Accept-Language": "en",
                },
            });

            if (!response.ok) {
                console.error("Geocoding error:", response.statusText);
                return;
            }

            const results = await response.json();
            if (Array.isArray(results) && results.length > 0) {
                // Nominatim returns { lat: "xx.x", lon: "yy.y", display_name, ... }
                const best = results[0];
                const lat = Number(best.lat);
                const lon = Number(best.lon);

                // Keep same [lng, lat] shape your app expects
                dispatch(
                    setFilters({
                        location: q,
                        coordinates: [lon, lat],
                    })
                );

                // Also update URL & state via handleFilterChange if you'd prefer:
                // handleFilterChange("coordinates", [lon, lat], null);
            } else {
                console.warn("No location results for:", q);
            }
        } catch (err) {
            console.error("Error searching location:", err);
        }
    };
    // ---------------------------------------------------------------------------

    return (
        <div className="flex justify-between items-center w-full py-5">
            {/* Filters */}
            <div className="flex justify-between items-center gap-4 p-2">
                {/* All Filters */}
                <Button
                    variant="outline"
                    className={cn(
                        "gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100",
                        isFiltersFullOpen && "bg-primary-700 text-primary-100"
                    )}
                    onClick={() => dispatch(toggleFiltersFullOpen())}
                >
                    <Filter className="w-4 h-4" />
                    <span>All Filters</span>
                </Button>

                {/* Search Location */}
                <div className="flex items-center">
                    <Input
                        placeholder="Search location"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0"
                    />
                    <Button
                        onClick={handleLocationSearch}
                        className={`rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none 
              border hover:bg-primary-700 hover:text-primary-50`}
                    >
                        <Search className="w-4 h-4" />
                    </Button>
                </div>

                {/* Price Range */}
                <div className="flex gap-1">
                    {/* Minimum Price Selector */}
                    <Select
                        value={filters.priceRange[0]?.toString() || "any"}
                        onValueChange={(value) =>
                            handleFilterChange("priceRange", value, true)
                        }
                    >
                        <SelectTrigger className="w-22 rounded-xl border-primary-400">
                            <SelectValue>
                                {formatPriceValue(filters.priceRange[0], true)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Min Price</SelectItem>
                            {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((price) => (
                                <SelectItem key={price} value={price.toString()}>
                                    ${price / 1000}k+
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Maximum Price Selector */}
                    <Select
                        value={filters.priceRange[1]?.toString() || "any"}
                        onValueChange={(value) =>
                            handleFilterChange("priceRange", value, false)
                        }
                    >
                        <SelectTrigger className="w-22 rounded-xl border-primary-400">
                            <SelectValue>
                                {formatPriceValue(filters.priceRange[1], false)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Max Price</SelectItem>
                            {[1000, 2000, 3000, 5000, 10000].map((price) => (
                                <SelectItem key={price} value={price.toString()}>
                                    &lt;${price / 1000}k
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Beds and Baths */}
                <div className="flex gap-1">
                    {/* Beds */}
                    <Select
                        value={filters.beds}
                        onValueChange={(value) => handleFilterChange("beds", value, null)}
                    >
                        <SelectTrigger className="w-26 rounded-xl border-primary-400">
                            <SelectValue placeholder="Beds" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Beds</SelectItem>
                            <SelectItem value="1">1+ bed</SelectItem>
                            <SelectItem value="2">2+ beds</SelectItem>
                            <SelectItem value="3">3+ beds</SelectItem>
                            <SelectItem value="4">4+ beds</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Baths */}
                    <Select
                        value={filters.baths}
                        onValueChange={(value) => handleFilterChange("baths", value, null)}
                    >
                        <SelectTrigger className="w-26 rounded-xl border-primary-400">
                            <SelectValue placeholder="Baths" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="any">Any Baths</SelectItem>
                            <SelectItem value="1">1+ bath</SelectItem>
                            <SelectItem value="2">2+ baths</SelectItem>
                            <SelectItem value="3">3+ baths</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Property Type */}
                <Select
                    value={filters.propertyType || "any"}
                    onValueChange={(value) =>
                        handleFilterChange("propertyType", value, null)
                    }
                >
                    <SelectTrigger className="w-32 rounded-xl border-primary-400">
                        <SelectValue placeholder="Home Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="any">Any Property Type</SelectItem>
                        {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                            <SelectItem key={type} value={type}>
                                <div className="flex items-center">
                                    <Icon className="w-4 h-4 mr-2" />
                                    <span>{type}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* View Mode */}
            <div className="flex justify-between items-center gap-4 p-2">
                <div className="flex border rounded-xl">
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50",
                            viewMode === "list" ? "bg-primary-700 text-primary-50" : ""
                        )}
                        onClick={() => dispatch(setViewMode("list"))}
                    >
                        <List className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50",
                            viewMode === "grid" ? "bg-primary-700 text-primary-50" : ""
                        )}
                        onClick={() => dispatch(setViewMode("grid"))}
                    >
                        <Grid className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FiltersBar;
