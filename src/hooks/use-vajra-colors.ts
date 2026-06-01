import { useColorScheme } from "react-native";
import { getVajraColors } from "@/theme/vajra-colors";

export function useVajraColors() {
  const colorScheme = useColorScheme();
  return getVajraColors(colorScheme);
}
