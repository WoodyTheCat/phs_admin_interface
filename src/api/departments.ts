import { Department } from "@/types/misc";
import axios from "./axios";

const getDepartments = async (): Promise<Department[]> => {
  return axios.get("/departments").then((d) => d.data);
};

export { getDepartments };
