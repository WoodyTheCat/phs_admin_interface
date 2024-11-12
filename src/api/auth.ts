import axios from "./axios";

async function logoutUser(id: number) {
  return axios.post(`/auth/logout-user?id=${id}`);
}

async function resetPassword({
  id,
  newPassword,
  confirmNewPassword,
}: {
  id: number;
  newPassword: string;
  confirmNewPassword: string;
}) {
  axios.post(`/auth/reset-password`, {
    user_id: id,
    new_password: newPassword,
    confirm_password: confirmNewPassword,
  });
}

export { logoutUser, resetPassword };
