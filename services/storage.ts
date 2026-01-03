import { User, ChatSession } from "../types";
import { INITIAL_CHATS, CURRENT_USER } from "./mockData";

const USER_KEY = 'sigmax_user_v1';
const CHATS_KEY = 'sigmax_chats_v1';

export const StorageService = {
  saveUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveChats: (chats: ChatSession[]) => {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  },

  getChats: (): ChatSession[] => {
    const data = localStorage.getItem(CHATS_KEY);
    if (data) return JSON.parse(data);
    return INITIAL_CHATS;
  },

  clear: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CHATS_KEY);
  }
};
