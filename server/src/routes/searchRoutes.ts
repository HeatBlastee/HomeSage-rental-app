// routes/geocode.ts
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
            q as string
        )}`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "RentalApp/1.0",
                "Accept-Language": "en",
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            console.error(`Geocoding API error: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ 
                error: "Geocoding service error",
                status: response.status 
            });
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("Invalid content type received:", contentType);
            return res.status(500).json({ 
                error: "Invalid response from geocoding service" 
            });
        }

        const data: any = await response.json();
        
        if (!Array.isArray(data)) {
            console.error("Unexpected data format:", typeof data);
            return res.status(500).json({ error: "Invalid data format from geocoding service" });
        }

        console.log(`Geocoding results for "${q}":`, data.length, "results");
        res.json(data);
    } catch (err: any) {
        console.error("Geocoding error:", err.message);
        res.status(500).json({ 
            error: "Failed to fetch location data",
            message: err.message 
        });
    }
});

export default router;
