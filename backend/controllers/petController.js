const Pet = require("../models/Pet");



const calculateVaccineStatus = (schedule) => {
  
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return "Not Vaccinated";
  }
  
  const completedCount = schedule.filter(v => 
    v.status && v.status.toLowerCase() === "completed"
  ).length;
  
  
  if (completedCount === schedule.length) return "Fully Vaccinated";
  if (completedCount > 0) return "Partially Vaccinated";
  
  
  return "Vaccinations Pending";
};

// @desc    Create a new pet
// @route   POST /api/pets
// @access  Private
const createPet = async (req, res) => {
  try {
    const { name, breed, age, district, upazilla, diet, pottyTrained, vaccinationSchedule } = req.body;

    const pet = await Pet.create({
      owner: req.user._id,
      name,
      breed,
      age,
      district,
      upazilla,
      diet: diet || "",
      pottyTrained: pottyTrained || false,
      vaccinationSchedule: vaccinationSchedule || [],
      // Auto-set the general status!
      vaccinationStatus: calculateVaccineStatus(vaccinationSchedule) 
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pets of logged in pet parent
// @route   GET /api/pets/mypets
// @access  Private
const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available pets
// @route   GET /api/pets
// @access  Public
const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({ adoptionStatus: "available" }).populate("owner", "name");
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single pet by ID
// @route   GET /api/pets/:id
// @access  Public
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate("owner", "name email phone");
    if (pet) {
      res.json(pet);
    } else {
      res.status(404).json({ message: "Pet not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a pet
// @route   PUT /api/pets/:id
// @access  Private
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to edit this pet" });
    }

    pet.name = req.body.name || pet.name;
    pet.breed = req.body.breed || pet.breed;
    pet.age = req.body.age || pet.age;
    pet.district = req.body.district || pet.district;
    pet.upazilla = req.body.upazilla || pet.upazilla;
    pet.diet = req.body.diet !== undefined ? req.body.diet : pet.diet;
    pet.pottyTrained = req.body.pottyTrained !== undefined ? req.body.pottyTrained : pet.pottyTrained;
    pet.adoptionStatus = req.body.adoptionStatus || pet.adoptionStatus;
    
    // Update schedule and auto-calculate new status!
    pet.vaccinationSchedule = req.body.vaccinationSchedule || pet.vaccinationSchedule;
    pet.vaccinationStatus = calculateVaccineStatus(pet.vaccinationSchedule);

    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPet, getMyPets, getAllPets, getPetById, updatePet };