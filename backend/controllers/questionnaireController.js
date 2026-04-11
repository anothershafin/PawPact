const Pet = require("../models/Pet");
const User = require("../models/User");

const QUESTIONS = [
  { key: "homeType", label: "Home type", options: ["apartment", "house"] },
  { key: "activityLevel", label: "Activity level", options: ["low", "medium", "high"] },
  { key: "timeAvailable", label: "Time available daily", options: ["low", "medium", "high"] },
  { key: "goodWithKids", label: "Kids in home", options: ["yes", "no"] },
  { key: "goodWithOtherPets", label: "Other pets in home", options: ["yes", "no"] },
  { key: "experienceLevel", label: "Pet care experience", options: ["firstTime", "experienced"] },
];

const ANSWER_KEYS = QUESTIONS.map((q) => q.key);

const ALLOWED_ANSWERS = {
  homeType: ["apartment", "house"],
  activityLevel: ["low", "medium", "high"],
  timeAvailable: ["low", "medium", "high"],
  goodWithKids: ["yes", "no"],
  goodWithOtherPets: ["yes", "no"],
  experienceLevel: ["firstTime", "experienced"],
};

const DIMENSION_ORDER = [
  "homeType",
  "activityLevel",
  "timeAvailable",
  "goodWithKids",
  "goodWithOtherPets",
  "experienceLevel",
];

/**
 * Compare one adopter answer to one pet requirement.
 * Returns { ok, counted } — counted=false means this dimension does not affect the score (pet has no preference).
 */
function matchDimension(key, petNeed, userAnswer) {
  const need = petNeed && petNeed !== "" ? petNeed : "any";
  if (need === "any") {
    return { ok: true, counted: false };
  }

  if (key === "experienceLevel") {
    if (need === "firstTimeOk") {
      // Pet is suitable for first-time owners → does not exclude any adopter
      return { ok: true, counted: false };
    }
    if (need === "experiencedOnly") {
      return { ok: userAnswer === "experienced", counted: true };
    }
    return { ok: false, counted: true };
  }

  return { ok: need === userAnswer, counted: true };
}

const getQuestionnaire = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("lifestyleAnswers").lean();
    const saved = user?.lifestyleAnswers
      ? {
          homeType: user.lifestyleAnswers.homeType,
          activityLevel: user.lifestyleAnswers.activityLevel,
          timeAvailable: user.lifestyleAnswers.timeAvailable,
          goodWithKids: user.lifestyleAnswers.goodWithKids,
          goodWithOtherPets: user.lifestyleAnswers.goodWithOtherPets,
          experienceLevel: user.lifestyleAnswers.experienceLevel,
        }
      : null;

    res.json({
      questions: QUESTIONS,
      savedAnswers: saved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveAnswers = async (req, res) => {
  try {
    const answers = {};
    for (const key of ANSWER_KEYS) {
      const v = req.body[key];
      if (v === undefined || v === null || String(v).trim() === "") {
        return res.status(400).json({ message: `Missing or empty answer: ${key}` });
      }
      const allowed = ALLOWED_ANSWERS[key];
      if (!allowed.includes(v)) {
        return res.status(400).json({ message: `Invalid value for ${key}` });
      }
      answers[key] = v;
    }

    const user = await User.findById(req.user._id);
    user.lifestyleAnswers = answers;
    await user.save();
    res.json(user.lifestyleAnswers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scoreForPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).lean();
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const user = await User.findById(req.user._id).select("lifestyleAnswers").lean();
    if (!user.lifestyleAnswers) {
      return res.status(400).json({ message: "Questionnaire not completed" });
    }

    const answers = user.lifestyleAnswers;
    const reqs = pet.lifestyleRequirements || {};

    const labelByKey = Object.fromEntries(QUESTIONS.map((q) => [q.key, q.label]));

    let matched = 0;
    let total = 0;
    const breakdown = [];

    for (const key of DIMENSION_ORDER) {
      const petNeed = reqs[key] || "any";
      const userAnswer = answers[key];
      const { ok, counted } = matchDimension(key, petNeed, userAnswer);
      if (counted) {
        total += 1;
        if (ok) matched += 1;
      }
      breakdown.push({
        key,
        label: labelByKey[key],
        petNeed,
        userAnswer,
        ok,
        counted,
      });
    }

    let score = 100;
    let scoringNote =
      "This pet has not set specific lifestyle criteria; match is shown as 100%.";

    if (total > 0) {
      score = Math.round((matched / total) * 100);
      scoringNote = null;
    }

    res.json({ score, breakdown, scoringNote, matchedDimensions: matched, totalDimensions: total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestionnaire, saveAnswers, scoreForPet };
