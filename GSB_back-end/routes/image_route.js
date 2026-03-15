const express = require("express");
const router = express.Router();
const { getImageFromS3 } = require("../utils/s3");
const { verifyToken } = require("../controllers/authentification_controller");

// Route pour servir les images depuis S3 via un proxy sécurisé (admin uniquement)
router.get("/proxy", verifyToken, async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Vérifier si l'utilisateur est admin
    const userRole = req.user.role || req.user.Role || "user";
    const isAdmin =
      userRole.toLowerCase() === "admin" ||
      userRole.toLowerCase() === "administrator";

    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Admin access required." });
    }

    // Vérifier si l'URL est une URL S3 valide
    if (!url.includes("amazonaws.com") && !url.includes("s3.amazonaws.com")) {
      return res.status(400).json({ error: "Invalid S3 URL" });
    }

    console.log("Admin proxying image from S3:", url);
    console.log("User:", req.user.id, "Role:", userRole);

    // Récupérer l'image depuis S3
    const imageBuffer = await getImageFromS3(url);

    // Déterminer le type de contenu
    const contentType =
      url.toLowerCase().includes(".jpg") || url.toLowerCase().includes(".jpeg")
        ? "image/jpeg"
        : url.toLowerCase().includes(".png")
          ? "image/png"
          : url.toLowerCase().includes(".gif")
            ? "image/gif"
            : "image/jpeg";

    // Servir l'image avec headers de sécurité
    res.set({
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600", // Cache privé uniquement
      "Access-Control-Allow-Origin": req.headers.origin || "*", // CORS dynamique
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Content-Type-Options": "nosniff", // Sécurité supplémentaire
    });

    res.send(imageBuffer);
  } catch (error) {
    console.error("Error proxying image:", error);

    // Si l'erreur est liée à S3, retourner une image par défaut
    if (error.message.includes("S3") || error.message.includes("NoSuchKey")) {
      // Retourner une image placeholder
      const svgPlaceholder = `
                <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100%" height="100%" fill="#f8f9fa"/>
                    <text x="50%" y="40%" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="16" font-weight="bold">
                        Image non disponible
                    </text>
                    <text x="50%" y="60%" text-anchor="middle" fill="#adb5bd" font-family="Arial" font-size="12">
                        Erreur: ${error.message}
                    </text>
                </svg>
            `;

      res.set("Content-Type", "image/svg+xml");
      return res.send(svgPlaceholder);
    }

    res.status(500).json({ error: "Failed to fetch image" });
  }
});

module.exports = router;
