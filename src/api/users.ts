import { User } from "@/types/user";
import axios from "./axios";

async function getUsers({ pageParam }: { pageParam: number }): Promise<{
  nextCursor: number | null;
  previousCursor: number;
  data: User[];
}> {
  return axios
    .get(
      `/users?cursor=${Math.abs(pageParam)}&cursor[length]=20&cursor[previous]=${pageParam < 0}`,
    )
    .then((r) => r.data);
}

async function putUser({
  id,
  newUser,
}: {
  id: number;
  newUser: Omit<User, "id">;
}) {
  return axios.put(`/users/${id}`, newUser).then((r) => r.data);
}

async function deleteUser(userId: number) {
  return axios.delete(`/users/${userId}`).then((r) => r.data);
}

export { getUsers, putUser, deleteUser };
