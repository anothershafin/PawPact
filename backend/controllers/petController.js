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

// @desc    Search pets with filters for adopters
// @route   GET /api/pets/search
// @access  Public (listing only, editing still protected)
const searchPets = async (req, res) => {
  try {
    const {
      q,
      location,
      breed,
      vaccinationStatus,
      ageMin,
      ageMax,
    } = req.query;

    const query = {
      // By default show pets that are currently available for adoption
      adoptionStatus: "available",
    };

    if (breed) {
      query.breed = { $regex: breed, $options: "i" };
    }

    if (vaccinationStatus) {
      query.vaccinationStatus = vaccinationStatus;
    }

    const orConditions = [];

    if (q) {
      const textRegex = { $regex: q, $options: "i" };
      orConditions.push({ name: textRegex }, { breed: textRegex });
    }

    if (location) {
      const locRegex = { $regex: location, $options: "i" };
      orConditions.push({ district: locRegex }, { upazilla: locRegex });
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    let pets = await Pet.find(query);

    // Age is stored as a string (e.g. "2 years"), so we do
    // simple numeric filtering in memory when possible.
    if (ageMin || ageMax) {
      const min = ageMin ? Number(ageMin) : null;
      const max = ageMax ? Number(ageMax) : null;

      pets = pets.filter((pet) => {
        const num = parseInt(pet.age, 10);
        if (Number.isNaN(num)) return true; // keep unparseable ages
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
      });
    }

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

const uploadProfilePhoto = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to edit this pet" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Path served from /uploads
    pet.profilePhoto = `/uploads/${req.file.filename}`;
    await pet.save();

    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadAlbumPhotos = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to edit this pet" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const newPaths = req.files.map((f) => `/uploads/${f.filename}`);
    pet.photos = [...pet.photos, ...newPaths];

    await pet.save();
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPet,
  getMyPets,
  getPetById,
  updatePet,
  searchPets,
  uploadProfilePhoto,
  uploadAlbumPhotos,
};
