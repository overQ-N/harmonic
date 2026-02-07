import HttpClient from "@/lib/http";
import { initializeHttp } from "@/lib/kwHttp";
import { create } from "zustand";

export interface GlobalState {
  // kwHttp: HttpClient;
}

export const useGlobalStore = create<GlobalState>(() => ({
  // kwHttp: initializeHttp(),
}));
