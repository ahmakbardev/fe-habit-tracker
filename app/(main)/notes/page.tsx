import { Suspense } from "react";
import NotesClientWrapper from "./components/NotesClientWrapper";

export default function NotesPage() {
  return (
    <Suspense fallback={<div>Loading notes...</div>}>
      <NotesClientWrapper />
    </Suspense>
  );
}
