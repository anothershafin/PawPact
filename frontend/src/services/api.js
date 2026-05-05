import axios from "axios";

// Base URL of our backend server
const API = axios.create({
  baseURL: "http://localhost:5000/api",
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


//report API calls
export const createReport = (reportData) => API.post("/reports", reportData);
export const getMyReports = () => API.get("/reports/my");

//send verify otp fr_02
export const sendOtp = (token) =>
  API.post("/users/send-otp", {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const verifyOtp = (otpCode, token) =>
  API.post(
    "/users/verify-otp",
    { otpCode },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// Public pet search for adopters
export const searchPets = (params) => API.get("/pets/search", { params });

// Pet profile photo upload
export const uploadPetProfilePhoto = (id, file) => {
  const formData = new FormData();
  formData.append("image", file);
  return API.post(`/pets/${id}/profile-photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Pet album photos upload
export const uploadPetAlbumPhotos = (id, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("images", file));
  return API.post(`/pets/${id}/photos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateShortlist = (data) => API.post("/features/shortlist", data);
export const getAllPets = () => API.get("/pets");


export const updateLifestyleAnswers = (answers) => API.post("/features/lifestyle", { answers });


// ✅ CORRECT - Uses the API instance with base URL and auth token
// Application API calls
// Application API calls - UPDATED
export const createApplication = (applicationData) => 
  API.post('/applications', applicationData);

export const updateAppStatus = (id, status) => 
  API.put(`/applications/${id}`, { status });

export const getApplications = () => 
  API.get("/applications");  // ✅ Remove /api prefix

export const removeFromShortlist = (petId) => 
  API.delete(`/shortlist/${petId}`);  // ✅ Remove /api prefix

// Observation updates
export const addObservationUpdate = (applicationId, updateData) =>
  API.post(`/applications/${applicationId}/observations`, updateData);

export const submitObservationResponse = (applicationId, updateId, responseData) =>
  API.put(`/applications/${applicationId}/observations/${updateId}`, responseData);

export const deleteObservationUpdate = (applicationId, updateId) =>
  API.delete(`/applications/${applicationId}/observations/${updateId}`);
export const addObservationTask = async (appId, taskData) => {
  return await API.post(`/applications/${appId}/tasks`, taskData);
};

export const replyToObservationTask = async (appId, taskId, replyData) => {
  return await API.put(`/applications/${appId}/tasks/${taskId}`, replyData);
};