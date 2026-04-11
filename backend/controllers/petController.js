const Pet = require("../models/Pet");

// @desc    Create a new pet
// @route   POST /api/pets
// @access  Private (Pet Parent only)
const createPet = async (req, res) => {
  try {
    const {
      name,
      breed,
      age,
      district,
      upazilla,
      diet,
      pottyTrained,
      bio,
      vaccinationStatus,
      requirements,
      temperamentTags,
      specialNeeds,
      rehomingReason,
      preferredAdopterType,
      profilePhoto,
      coverPhoto,
      photos,
      lifestyleRequirements,
    } = req.body;

    const pet = await Pet.create({
      owner: req.user._id,
      name,
      breed,
      age,
      district,
      upazilla,
      diet: diet || "",
      pottyTrained: pottyTrained || false,
      bio: bio || "",
      vaccinationStatus: vaccinationStatus || "Not Vaccinated",
      requirements: requirements || [],
      temperamentTags: temperamentTags || [],
      specialNeeds: specialNeeds || "",
      rehomingReason: rehomingReason || "",
      preferredAdopterType: preferredAdopterType || "",
      profilePhoto: profilePhoto || "",
      coverPhoto: coverPhoto || "",
      photos: photos || [],
      lifestyleRequirements: lifestyleRequirements || undefined,
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List available pets (search/filter)
// @route   GET /api/pets
// @access  Public
const listPets = async (req, res) => {
  try {
    const {
      q,
      district,
      upazilla,
      breed,
      age,
      vaccinationStatus,
      adoptionStatus,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (district) filter.district = district;
    if (upazilla) filter.upazilla = upazilla;
    if (breed) filter.breed = breed;
    if (age) filter.age = age;
    if (vaccinationStatus) filter.vaccinationStatus = vaccinationStatus;
    filter.adoptionStatus = adoptionStatus || "available";

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { breed: { $regex: q, $options: "i" } },
        { district: { $regex: q, $options: "i" } },
        { upazilla: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Pet.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Pet.countDocuments(filter),
    ]);

    res.json({ items, page: pageNum, limit: limitNum, total });
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
    pet.vaccinationStatus =
      req.body.vaccinationStatus !== undefined ? req.body.vaccinationStatus : pet.vaccinationStatus;
    pet.requirements = req.body.requirements !== undefined ? req.body.requirements : pet.requirements;
    pet.temperamentTags =
      req.body.temperamentTags !== undefined ? req.body.temperamentTags : pet.temperamentTags;
    pet.specialNeeds =
      req.body.specialNeeds !== undefined ? req.body.specialNeeds : pet.specialNeeds;
    pet.rehomingReason =
      req.body.rehomingReason !== undefined ? req.body.rehomingReason : pet.rehomingReason;
    pet.preferredAdopterType =
      req.body.preferredAdopterType !== undefined ? req.body.preferredAdopterType : pet.preferredAdopterType;
    pet.profilePhoto =
      req.body.profilePhoto !== undefined ? req.body.profilePhoto : pet.profilePhoto;
    pet.coverPhoto = req.body.coverPhoto !== undefined ? req.body.coverPhoto : pet.coverPhoto;
    pet.photos = req.body.photos !== undefined ? req.body.photos : pet.photos;
    pet.lifestyleRequirements =
      req.body.lifestyleRequirements !== undefined ? req.body.lifestyleRequirements : pet.lifestyleRequirements;

    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add vaccination entry to pet
// @route   POST /api/pets/:id/vaccinations
// @access  Private (Owner only)
const addVaccination = async (req, res) => {
  try {
    const { title, scheduledAt, notes, status } = req.body;
    if (!title || !scheduledAt) {
      return res.status(400).json({ message: "title and scheduledAt are required" });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    pet.vaccinationSchedule.push({
      title,
      scheduledAt: new Date(scheduledAt),
      notes: notes || "",
      status: status || "scheduled",
    });
    await pet.save();
    res.status(201).json(pet.vaccinationSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vaccination entry
// @route   PUT /api/pets/:id/vaccinations/:vaccinationId
// @access  Private (Owner only)
const updateVaccination = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const entry = pet.vaccinationSchedule.id(req.params.vaccinationId);
    if (!entry) return res.status(404).json({ message: "Vaccination entry not found" });

    if (req.body.title !== undefined) entry.title = req.body.title;
    if (req.body.scheduledAt !== undefined) entry.scheduledAt = new Date(req.body.scheduledAt);
    if (req.body.notes !== undefined) entry.notes = req.body.notes;
    if (req.body.status !== undefined) entry.status = req.body.status;

    await pet.save();
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vaccination entry
// @route   DELETE /api/pets/:id/vaccinations/:vaccinationId
// @access  Private (Owner only)
const deleteVaccination = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const entry = pet.vaccinationSchedule.id(req.params.vaccinationId);
    if (!entry) return res.status(404).json({ message: "Vaccination entry not found" });
    entry.deleteOne();
    await pet.save();
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPet,
  listPets,
  getMyPets,
  getPetById,
  updatePet,
  addVaccination,
  updateVaccination,
  deleteVaccination,
};