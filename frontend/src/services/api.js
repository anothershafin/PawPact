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