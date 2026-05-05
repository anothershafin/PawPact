# Sprint 2 Demo Video Script - Nehal
**Total Duration: ~5 minutes**

---

## PART 1: INTRODUCTION (0:00 - 0:30)

**What to say:**
"Hello, I'm Nehal. In Sprint 2, I implemented two features for the PawPact pet adoption platform:

1. **Media Upload** — Allows pet owners to upload profile pictures and photo albums for their pets.
2. **Search & Filter** — Allows adopters to search and filter available pets by location, breed, vaccination status, and age."

**Visual:** Show your face, then show the GitHub `nehal` branch:
- Open terminal and type: `git log --oneline | head -5`
- Capture the commit: "Added pet media upload and search-filter(Nehal)"

---

## PART 2: FEATURE 1 - MEDIA UPLOAD (0:30 - 2:15)

### 2A: Demonstrate the Feature (0:30 - 1:15)

**What to do:**
1. Open the app in the browser (logged in as a pet parent).
2. Go to "Pets" → click on a pet → click "Edit Pet".
3. Show the "Add Media" button.
4. Click it to expand the media upload section.
5. Show:
   - Profile photo upload input
   - Profile photo preview
   - Album photos upload input
6. Upload a test image as profile photo.
7. Upload 1-2 test images to the album.
8. Click "Save".
9. Navigate back to the pet profile.
10. Show the profile picture now displays at the top.
11. Scroll down and show the photo album section with the uploaded images.

**What to say (narrate while showing):**
"First, let me demonstrate the media upload feature. A pet parent can edit their pet and click 'Add Media' to expand the upload options. They can upload a profile picture for the pet, and multiple photos for the album. After saving, the images are stored on the backend and displayed in the pet's profile — here's the profile picture at the top, and below is the photo album showing all the uploaded images."

---

### 2B: Explain the Backend Code (1:15 - 1:50)

**File 1: [backend/middleware/upload.js](backend/middleware/upload.js)**

Open and show:
```javascript
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
```

**What to say:**
"On the backend, I use Multer middleware to handle file uploads. This configures where files are saved (`backend/uploads/`), and it auto-creates the directory if it doesn't exist. Each file is named with a timestamp to avoid conflicts. I also added a file filter to accept only image files."

---

**File 2: [backend/controllers/petController.js](backend/controllers/petController.js) — `uploadProfilePhoto` and `uploadAlbumPhotos` functions**

Scroll to and show these two functions (around lines 89–130):

```javascript
const uploadProfilePhoto = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

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
      return res.status(401).json({ message: "Not authorized" });
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
```

**What to say:**
"These are the two upload controllers. Both verify that:
1. The pet exists.
2. The logged-in user is the owner (authorization check).
3. Files were actually uploaded.

For profile photo: we save the file path to the `profilePhoto` field.
For album photos: we append each new path to the `photos` array so we can store multiple images.

Then we save the updated pet to the database."

---

**File 3: [backend/models/Pet.js](backend/models/Pet.js) — Schema fields**

Show the Pet model around lines 58–69:

```javascript
profilePhoto: {
  type: String,
  default: "",
},
photos: {
  type: [String],
  default: [],
},
```

**What to say:**
"The Pet model has two fields: `profilePhoto` stores a single image path as a string, and `photos` stores multiple image paths in an array. These are served from the backend's `/uploads` folder."

---

### 2C: Explain the Frontend Code (1:50 - 2:15)

**File: [frontend/src/pages/EditPet.jsx](frontend/src/pages/EditPet.jsx)**

Show the "Add Media" section (around lines 230–265):

```javascript
<button
  type="button"
  className="auth-btn"
  style={{ backgroundColor: "#2d6a4f" }}
  onClick={() => setShowMedia(!showMedia)}
>
  {showMedia ? "Hide Media Options" : "Add Media"}
</button>

{showMedia && (
  <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
    <h3 style={{ marginBottom: "0.5rem" }}>Update Profile Picture</h3>
    <input
      type="file"
      accept="image/*"
      onChange={handleProfilePhotoChange}
      style={{ marginBottom: "1rem" }}
    />
    {formData.profilePhoto && (
      <img
        src={`http://localhost:5000${formData.profilePhoto}`}
        alt="Profile preview"
        style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "1rem" }}
      />
    )}

    <h3 style={{ marginBottom: "0.5rem" }}>Add Photos to Album</h3>
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleAlbumPhotosChange}
    />
  </div>
)}
```

Show the handlers (around lines 82–108):

```javascript
const handleProfilePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    setUploading(true);
    const { data } = await uploadPetProfilePhoto(id, file);
    setFormData((prev) => ({ ...prev, profilePhoto: data.profilePhoto }));
  } catch (err) {
    console.error("Profile photo upload failed", err);
  } finally {
    setUploading(false);
  }
};

const handleAlbumPhotosChange = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  try {
    setUploading(true);
    const { data } = await uploadPetAlbumPhotos(id, files);
    setFormData((prev) => ({ ...prev, photos: data.photos || [] }));
  } catch (err) {
    console.error("Album upload failed", err);
  } finally {
    setUploading(false);
  }
};
```

**What to say:**
"On the frontend, clicking 'Add Media' shows the upload inputs. When a user selects a file, the handler immediately calls the backend API (`uploadPetProfilePhoto` or `uploadPetAlbumPhotos`). The backend returns the updated pet data, which I use to update the form state and show a live preview. The images are immediately displayed without needing to save the entire form."

---

## PART 3: FEATURE 2 - SEARCH & FILTER (2:15 - 4:45)

### 3A: Demonstrate the Feature (2:15 - 3:00)

**What to do:**
1. Log out and log back in as an **adopter**.
2. Go to Home page.
3. Show the search box at the top.
4. Show the "Search Pets" and "Filters" buttons.
5. Click "Filters" to expand the filter options.
6. Show all filter fields:
   - Location
   - Breed
   - Vaccination
   - Age (min)
   - Age (max)
7. Fill in a few filters (e.g., Location = "Dhaka", Breed = "Labrador").
8. Click "Search Pets".
9. Show the browser navigates to `/search?location=Dhaka&breed=Labrador`.
10. Show the same search bar + filters on the search page.
11. Show the results below — pet cards with profile pictures, breed, age, vaccination status.
12. Try a search with no matches (e.g., Location = "xyz").
13. Show the message "No pets matched your search. Showing available pets instead."
14. Show the "Available Pets" section appears below with all adoption-available pets.

**What to say (narrate while showing):**
"Now let me demonstrate the search and filter feature for adopters. From the Home page, adopters can type a search term or click Filters to expand options. The filters include location, breed, vaccination status, and age range. When they click 'Search Pets', they're taken to a dedicated search page where results appear below. If no pets match the search, a message appears and we show all available pets instead, so adopters always see something relevant."

---

### 3B: Explain the Backend Code (3:00 - 3:50)

**File: [backend/routes/petRoutes.js](backend/routes/petRoutes.js)**

Show the route (line 17):

```javascript
router.get("/search", searchPets);
```

**What to say:**
"First, I added a public `/api/pets/search` route that calls the `searchPets` controller. This route must be placed BEFORE the `/:id` route so that 'search' is not interpreted as a pet ID."

---

**File: [backend/controllers/petController.js](backend/controllers/petController.js) — `searchPets` function**

Show the function (around lines 38–100):

**Key sections to highlight:**

```javascript
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
      adoptionStatus: "available",
    };

    if (location) {
      const locRegex = { $regex: location, $options: "i" };
      orConditions.push({ district: locRegex }, { upazilla: locRegex });
    }

    if (breed) {
      query.breed = { $regex: breed, $options: "i" };
    }

    if (vaccinationStatus) {
      query.vaccinationStatus = vaccinationStatus;
    }

    // Age filtering in memory
    if (ageMin || ageMax) {
      const min = ageMin ? Number(ageMin) : null;
      const max = ageMax ? Number(ageMax) : null;

      pets = pets.filter((pet) => {
        const num = parseInt(pet.age, 10);
        if (Number.isNaN(num)) return true;
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
```

**What to say:**
"The backend `searchPets` function reads query parameters from the URL: `q` (search text), `location`, `breed`, `vaccinationStatus`, and age range.

It builds a MongoDB query that:
- Always filters to only `adoptionStatus: 'available'` pets (so we only show pets up for adoption).
- Uses case-insensitive regex matching for text fields like location and breed.
- For the `location` parameter, it matches against both `district` and `upazilla` fields because location can be either.
- For `vaccinationStatus`, it does an exact match.
- For age, since it's stored as a string like '2 years', I parse the number in memory and filter.

The query is executed against MongoDB, and the results are returned as JSON to the frontend."

---

### 3C: Explain the Frontend Code (3:50 - 4:45)

**File: [frontend/src/pages/Home.jsx](frontend/src/pages/Home.jsx)**

Show the filter state (around lines 14–22):

```javascript
const [filters, setFilters] = useState({
  location: "",
  breed: "",
  vaccinationStatus: "",
  ageMin: "",
  ageMax: "",
});
const [showFilters, setShowFilters] = useState(false);
```

Show the `handleSearch` function (around lines 27–40):

```javascript
const handleSearch = (e) => {
  if (e) e.preventDefault();
  if (!userInfo) return;

  const params = new URLSearchParams();
  if (searchTerm) params.set("q", searchTerm);
  if (filters.location) params.set("location", filters.location);
  if (filters.breed) params.set("breed", filters.breed);
  if (filters.vaccinationStatus) params.set("vaccinationStatus", filters.vaccinationStatus);
  if (filters.ageMin) params.set("ageMin", filters.ageMin);
  if (filters.ageMax) params.set("ageMax", filters.ageMax);

  navigate(`/search?${params.toString()}`);
};
```

**What to say:**
"On the Home page, I store the filter values in state. When the adopter clicks 'Search Pets', the handler builds a URL query string from all non-empty filters and navigates to `/search`. This keeps the filters persistent in the URL so if someone shares the link, the same search will run."

---

**File: [frontend/src/pages/SearchPets.jsx](frontend/src/pages/SearchPets.jsx)**

Show the initial state and useEffect (around lines 17–27 and 62–64):

```javascript
const [searchTerm, setSearchTerm] = useState(query.get("q") || "");
const [filters, setFilters] = useState({
  location: query.get("location") || "",
  breed: query.get("breed") || "",
  vaccinationStatus: query.get("vaccinationStatus") || "",
  ageMin: query.get("ageMin") || "",
  ageMax: query.get("ageMax") || "",
});
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [showAvailableTitle, setShowAvailableTitle] = useState(false);

// Run search on first load
useEffect(() => {
  runSearch();
}, []);
```

Show the `runSearch` function (around lines 29–63):

```javascript
const runSearch = async (e) => {
  if (e) e.preventDefault();
  if (!userInfo) return;

  setLoading(true);
  setError("");
  try {
    const params = {
      q: searchTerm || undefined,
      location: filters.location || undefined,
      breed: filters.breed || undefined,
      vaccinationStatus: filters.vaccinationStatus || undefined,
      ageMin: filters.ageMin || undefined,
      ageMax: filters.ageMax || undefined,
    };

    const { data } = await searchPets(params);

    // If no matches, show all available pets
    if (!data || data.length === 0) {
      const fallback = await searchPets({});
      setResults(fallback.data || []);
      setShowAvailableTitle(true);
    } else {
      setResults(data);
      setShowAvailableTitle(false);
    }
  } catch (err) {
    console.error("Pet search failed", err);
    setError(err.response?.data?.message || "Failed to search pets. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

Show the results rendering (around lines 145–180):

```javascript
{!loading && !error && showAvailableTitle && results.length > 0 && (
  <p className="pets-empty" style={{ marginBottom: "8px" }}>
    No pets matched your search. Showing available pets instead.
  </p>
)}
{!loading && !error && results.length > 0 && (
  <div className="pets-grid">
    {showAvailableTitle && (
      <h2 className="pets-section-title" style={{ gridColumn: "1 / -1", marginBottom: "8px" }}>
        Available Pets
      </h2>
    )}
    {results.map((pet) => (
      <div key={pet._id} className="pet-card-wrapper">
        <Link to={`/pet/${pet._id}`} className="pet-card">
          {/* Pet card content */}
        </Link>
      </div>
    ))}
  </div>
)}
```

**What to say:**
"The search results page reads the query parameters from the URL and populates the filters. On first load, it automatically runs the search. The smart part is the fallback: if the specific search returns 0 results, it calls the API again with no filters to get all available pets, then shows them with a message 'No pets matched your search. Showing available pets instead.' This ensures adopters always see some pets to browse, even if their exact search has no matches."

---

## PART 4: CONCLUSION (4:45 - 5:00)

**What to say:**
"That's a summary of my two Sprint 2 features:

1. **Media Upload** — Pet parents can upload profile pictures and photo albums, which are stored on the backend and displayed in pet profiles.

2. **Search & Filter** — Adopters can search and filter available pets by location, breed, vaccination status, and age. If no exact matches are found, available pets are shown as a fallback.

Both features enhance the user experience for pet parents and adopters. Thank you!"

**Visual:** Show your GitHub branch once more or the running app.

---

## FILES TO OPEN DURING VIDEO (In Order)

1. App in browser (demonstrate the features live)
2. `backend/middleware/upload.js`
3. `backend/controllers/petController.js` (upload functions + search function)
4. `backend/models/Pet.js` (profilePhoto & photos fields)
5. `backend/routes/petRoutes.js` (search route)
6. `frontend/src/pages/EditPet.jsx` (media upload UI)
7. `frontend/src/pages/Home.jsx` (filter input + navigation)
8. `frontend/src/pages/SearchPets.jsx` (search logic + results)

---

## TIPS FOR RECORDING

- **Speak clearly** and explain as you show code.
- **Pause on each code section** for 3-5 seconds so viewers can read it.
- **Show the app live** for at least 1 minute to demonstrate the actual user experience.
- **Point your cursor** or use highlights to show key lines in code.
- **Be confident** — you built these features, so explain your decisions.
- **Test timing** — record a practice run first to ensure you fit in ~5 minutes.
- **Good audio** — reduce background noise; speak at a normal pace.

---

## QUICK TIMING CHECKLIST

- 0:00–0:30: Introduction & GitHub commit
- 0:30–1:15: Feature 1 Demo (media upload live)
- 1:15–1:50: Feature 1 Backend Code (upload middleware & controllers)
- 1:50–2:15: Feature 1 Frontend Code (EditPet component)
- 2:15–3:00: Feature 2 Demo (search & filter live)
- 3:00–3:50: Feature 2 Backend Code (search controller)
- 3:50–4:45: Feature 2 Frontend Code (Home + SearchPets)
- 4:45–5:00: Conclusion

**Total: ~5 minutes**
