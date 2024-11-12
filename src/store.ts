import { devtools } from "zustand/middleware";
import { AuthUser } from "./types/auth";
import { createStore } from "zustand";

type State = {
  user: AuthUser | null;
};

type Actions = {};

const store = createStore<State & Actions>()(
  devtools((_set) => ({ user: null })),
);

export default store;
