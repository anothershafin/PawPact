import axios from "axios";

/**
 * Dev: use relative "/api" so CRA's setupProxy forwards to the backend (see REACT_APP_PROXY_TARGET, default :5000).
 * Prod: set REACT_APP_API_URL at build time, or defaults to localhost:5000/api for local preview.
 */
function getApiBaseURL() {
  if (process.env.REACT_APP_API_URL) {
    return String(process.env.REACT_APP_API_URL).replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "/api";
  }
  return "http://localhost:5000/api";
}

const API = axios.create({
  baseURL: getApiBaseURL(),
});

// Before every request, attach the token if user is logged in
API.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

// Auth API calls
export const registerUser = (userData) => API.post("/users/register", userData);
export const loginUser = (userData) => API.post("/users/login", userData);
export const getUserProfile = () => API.get("/users/profile");
export const updateUserProfile = (userData) => API.put("/users/profile", userData);

// Pet API calls
export const createPet = (petData) => API.post("/pets", petData);
export const getMyPets = () => API.get("/pets/mypets");
export const getPetById = (id) => API.get(`/pets/${id}`);
export const updatePet = (id, petData) => API.put(`/pets/${id}`, petData);

// Adopter pet discovery
export const listPets = (params) => API.get("/pets", { params });

// Vaccination schedule
export const addVaccination = (petId, data) => API.post(`/pets/${petId}/vaccinations`, data);
export const updateVaccination = (petId, vaccinationId, data) =>
  API.put(`/pets/${petId}/vaccinations/${vaccinationId}`, data);
export const deleteVaccination = (petId, vaccinationId) =>
  API.delete(`/pets/${petId}/vaccinations/${vaccinationId}`);

// Shortlist
export const getShortlist = () => API.get("/shortlist");
export const createShortlistLabel = (title) => API.post("/shortlist/labels", { title });
export const renameShortlistLabel = (labelId, title) => API.put(`/shortlist/labels/${labelId}`, { title });
export const deleteShortlistLabel = (labelId) => API.delete(`/shortlist/labels/${labelId}`);
export const addPetToShortlistLabel = (labelId, petId) =>
  API.post(`/shortlist/labels/${labelId}/pets`, { petId });
export const removePetFromShortlistLabel = (labelId, petId) =>
  API.delete(`/shortlist/labels/${labelId}/pets/${petId}`);

// Questionnaire + scoring
export const getQuestionnaire = () => API.get("/questionnaire");
export const saveQuestionnaireAnswers = (answers) => API.put("/questionnaire/answers", answers);
export const getMatchScoreForPet = (petId) => API.get(`/questionnaire/pet/${petId}/score`);

// Applications
export const createApplication = (petId, message) => API.post("/applications", { petId, message });
export const getMyApplications = () => API.get("/applications/mine");
export const withdrawApplication = (applicationId) => API.post(`/applications/${applicationId}/withdraw`);
export const getApplicationsForMyPets = () => API.get("/applications/for-my-pets");
export const updateApplicationStatus = (applicationId, status) =>
  API.put(`/applications/${applicationId}/status`, { status });

// Observation contracts
export const getMyContracts = () => API.get("/contracts/mine");
export const getContractById = (contractId) => API.get(`/contracts/${contractId}`);
export const postObservationUpdate = (contractId, payload) => API.post(`/contracts/${contractId}/updates`, payload);
export const createCheckIn = (contractId, payload) => API.post(`/contracts/${contractId}/checkins`, payload);
export const answerCheckIn = (contractId, checkinId, payload) =>
  API.put(`/contracts/${contractId}/checkins/${checkinId}/answer`, payload);
export const requestReturn = (contractId) => API.post(`/contracts/${contractId}/return-request`);
export const confirmContractCompletion = (contractId) => API.post(`/contracts/${contractId}/confirm-completion`);

// Reviews
export const createReview = (payload) => API.post("/reviews", payload);
export const getReviewsForUser = (userId) => API.get(`/reviews/user/${userId}`);

// Reports
export const createReport = (payload) => API.post("/reports", payload);
export const getMyReports = () => API.get("/reports/mine");

// Admin
export const adminListReports = () => API.get("/admin/reports");
export const adminUpdateReport = (reportId, payload) => API.put(`/admin/reports/${reportId}`, payload);
export const adminListUsers = () => API.get("/admin/users");
export const adminVerifyUser = (userId) => API.put(`/admin/users/${userId}/verify`);
export const adminListPets = () => API.get("/admin/pets");
export const adminSetPetStatus = (petId, adoptionStatus) => API.put(`/admin/pets/${petId}/status`, { adoptionStatus });

// Uploads (multipart)
export const uploadImage = (file) => {
  const form = new FormData();
  form.append("file", file);
  return API.post("/uploads", form, { headers: { "Content-Type": "multipart/form-data" } });
};
