import { useContext } from "react";
import { ProfileContext } from "./ProfileContextValue";

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile() must be used inside a <ProfileProvider>");
  return ctx;
}
