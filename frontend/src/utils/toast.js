import { toast } from "react-toastify";

export const toastSuccess = (message) =>
  toast.success(message, { autoClose: 2500, closeOnClick: true });

export const toastError = (message) =>
  toast.error(message, { autoClose: 3500, closeOnClick: true });

export const toastInfo = (message) =>
  toast.info(message, { autoClose: 2500, closeOnClick: true });

