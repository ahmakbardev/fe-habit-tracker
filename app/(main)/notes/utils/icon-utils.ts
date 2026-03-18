// app/(main)/notes/utils/icon-utils.ts
import * as Icons from "lucide-react";
import { LucideIcon, HelpCircle } from "lucide-react";

export const getIconByName = (name: string): LucideIcon => {
  // @ts-expect-error: Accessing icon by string name from the lucide-react module
  const Icon = Icons[name as keyof typeof Icons];
  if (Icon) return Icon as LucideIcon;
  
  // Case sensitive check or common mapping
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
  // @ts-expect-error: Accessing icon by string name from the lucide-react module
  const PascalIcon = Icons[pascalName as keyof typeof Icons];
  if (PascalIcon) return PascalIcon;

  return HelpCircle; // Default fallback
};

export const getIconName = (Icon: LucideIcon): string => {
  return Icon.displayName || "HelpCircle";
};
