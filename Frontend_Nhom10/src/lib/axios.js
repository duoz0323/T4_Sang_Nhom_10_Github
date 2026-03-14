import axios from "axios";

const api = axios.create({
  baseURL: "https://t4-sang-nhom-10-backend.onrender.com/",
});
export default api;