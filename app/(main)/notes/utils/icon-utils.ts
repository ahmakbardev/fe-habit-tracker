// app/(main)/notes/utils/icon-utils.ts
import * as Icons from "lucide-react";
import { LucideIcon, HelpCircle } from "lucide-react";

export const getIconByName = (name: string): LucideIcon => {
  const IconsMap = Icons as unknown as Record<string, LucideIcon>;
  
  const Icon = IconsMap[name];
  if (Icon) return Icon;
  
  // Case sensitive check or common mapping
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const PascalIcon = IconsMap[pascalName];
  if (PascalIcon) return PascalIcon;

  return HelpCircle; // Default fallback
};

export const getIconName = (Icon: LucideIcon): string => {
  return Icon.displayName || "HelpCircle";
};
