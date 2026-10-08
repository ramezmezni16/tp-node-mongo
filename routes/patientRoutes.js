const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");

// Translates Mongoose errors into HTTP codes
function handleError(res, err) {
  if (err.name === "ValidationError") {
    const erreurs = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: "Données invalides", erreurs });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Identifiant invalide" });
  }
  console.error(err);
  return res.status(500).json({ message: "Erreur serveur" });
}

// CREATE -> 201
router.post("/", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) { handleError(res, err); }
});

// READ ONE -> 200 or 404
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient introuvable" });
    res.json(patient);
  } catch (err) { handleError(res, err); }
});





router.put("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body,
      { returnDocument: "after", runValidators: true });
    if (!patient) return res.status(404).json({ message: "Patient introuvable" });
    res.json(patient);
  } catch (err) { handleError(res, err); }
});


router.delete("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient introuvable" });
    res.status(204).send();
  } catch (err) { handleError(res, err); }
});


module.exports = router;