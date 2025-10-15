import { create } from 'zustand';
import { Mission } from '../types/missions';

interface MissionState {
  currentMission: Mission | null;
  availableMissions: Mission[];
  
  setCurrentMission: (mission: Mission | null) => void;
  setAvailableMissions: (missions: Mission[]) => void;
  loadMission: (missionId: string) => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  currentMission: null,
  availableMissions: [],

  setCurrentMission: (mission) => set({ currentMission: mission }),
  
  setAvailableMissions: (missions) => set({ availableMissions: missions }),
  
  loadMission: (missionId) => {
    const mission = get().availableMissions.find((m) => m.id === missionId);
    if (mission) {
      set({ currentMission: mission });
    }
  },
}));
