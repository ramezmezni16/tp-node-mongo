const express = require("express");
const router = express.Router();
const Consultation = require("../models/consultation");
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

// CREATE -> 201, or 404 if the patient doesn't exist
router.post("/", async (req, res) => {
  try {
    const existe = await Patient.exists({ _id: req.body.patient });
    if (!existe) return res.status(404).json({ message: "Patient introuvable" });

    const consultation = new Consultation(req.body);
    await consultation.save();
    res.status(201).json(consultation);
  } catch (err) { handleError(res, err); }
});


router.get("/", async (req, res) => {
  try {
    const filtre = {};
    if (req.query.patient) filtre.patient = req.query.patient;
    if (req.query.statut)  filtre.statut  = req.query.statut;

    const consultations = await Consultation.find(filtre)
      .populate("patient", "nom prenom")
      .sort({ date: -1 });
    res.json(consultations);
  } catch (err) { handleError(res, err); }
});


router.get("/:id", async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate("patient", "nom prenom");
    if (!consultation) return res.status(404).json({ message: "Consultation introuvable" });
    res.json(consultation);
  } catch (err) { handleError(res, err); }
});


router.put("/:id", async (req, res) => {
  try {
    if (req.body.patient) {
      const existe = await Patient.exists({ _id: req.body.patient });
      if (!existe) return res.status(404).json({ message: "Patient introuvable" });
    }
    const consultation = await Consultation.findByIdAndUpdate(req.params.id, req.body,
      { returnDocument: "after", runValidators: true });
    if (!consultation) return res.status(404).json({ message: "Consultation introuvable" });
    res.json(consultation);
  } catch (err) { handleError(res, err); }
});


router.delete("/:id", async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) return res.status(404).json({ message: "Consultation introuvable" });
    res.status(204).send();
  } catch (err) { handleError(res, err); }
});


module.exports = router;