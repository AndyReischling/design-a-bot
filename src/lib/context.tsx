"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type {
  CharacterSheet,
  AuditionResponse,
  CoherenceScore,
  TaskType,
} from "./types";

interface AppState {
  character: Partial<CharacterSheet> | null;
  responses: Partial<Record<TaskType, AuditionResponse>>;
  currentTask: number;
  score: CoherenceScore | null;
  isLoading: boolean;
}

type Action =
  | { type: "SET_CHARACTER"; payload: Partial<CharacterSheet> }
  | { type: "UPDATE_CHARACTER"; payload: Partial<CharacterSheet> }
  | { type: "SET_RESPONSE"; payload: AuditionResponse }
  | { type: "SET_SCORE"; payload: CoherenceScore }
  | { type: "NEXT_TASK" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

const initialState: AppState = {
  character: null,
  responses: {},
  currentTask: 0,
  score: null,
  isLoading: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_CHARACTER":
      return { ...state, character: action.payload };
    case "UPDATE_CHARACTER":
      return {
        ...state,
        character: { ...state.character, ...action.payload },
      };
    case "SET_RESPONSE":
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.taskId]: action.payload,
        },
      };
    case "SET_SCORE":
      return { ...state, score: action.payload };
    case "NEXT_TASK":
      return { ...state, currentTask: state.currentTask + 1 };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<AppState>(initialState);
const DispatchContext = createContext<Dispatch<Action>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppContext);
}

export function useAppDispatch() {
  return useContext(DispatchContext);
}
