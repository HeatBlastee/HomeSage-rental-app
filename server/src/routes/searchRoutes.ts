// routes/geocode.ts
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            q as string
        )}`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "YourAppName/1.0 (your.email@example.com)",
                "Accept-Language": "en",
            },
        });

        // if (!response.ok) {
        //     return res.status(500).json({ error: response.error ||"Geocoding API error" });
        // }

        const data = await response.json();
        console.log("DATA: ", data);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
