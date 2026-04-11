const Pet = require("../models/Pet");

// @desc    Create a new pet
// @route   POST /api/pets
// @access  Private (Pet Parent only)
const createPet = async (req, res) => {
  try {
    const { name, breed, age, district, upazilla, diet, pottyTrained } = req.body;

    const pet = await Pet.create({
      owner: req.user._id,
      name,
      breed,
      age,
      district,
      upazilla,
      diet: diet || "",
      pottyTrained: pottyTrained || false,
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pets of logged in pet parent
// @route   GET /api/pets/mypets
// @access  Private (Pet Parent only)
const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single pet by ID
// @route   GET /api/pets/:id
// @access  Public (but edit button only shown to owner)
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
// @access  Private (Owner only)
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // Check if the logged in user is the owner
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
    pet.bio = req.body.bio !== undefined ? req.body.bio : pet.bio;
    pet.adoptionStatus = req.body.adoptionStatus || pet.adoptionStatus;

    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPet, getMyPets, getPetById, updatePet };