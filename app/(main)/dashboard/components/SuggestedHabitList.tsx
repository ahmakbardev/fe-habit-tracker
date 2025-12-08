"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import SuggestedHabitCard from "./SuggestedHabitCard";

type HabitItem = {
  id: string;
  icon: string;
  title: string;
  love: number;
};

export default function SuggestedHabitList() {
  const [selected, setSelected] = useState<HabitItem | null>(null);

  const [items, setItems] = useState<HabitItem[]>([
    { id: "1", icon: "💪", title: "We go jimm!!!", love: 4200 },
    { id: "2", icon: "⏰", title: "The 5am club", love: 5400 },
    { id: "3", icon: "📚", title: "Study 30 minutes", love: 3100 },
    { id: "4", icon: "🧘", title: "Meditate 10 minutes", love: 2900 },
  ]);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setItems(reordered);
  }

  return (
    <div className="mt-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800">Should Do!</h2>
        <button className="text-sm text-slate-500">View Details</button>
      </div>

      {/* DRAGGABLE LIST */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="habits">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-3"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? "scale-[1.02]" : ""}
                    >
                      <SuggestedHabitCard
                        item={item}
                        onClick={() => setSelected(item)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* POPUP MODAL */}
      {selected && (
        <div
          className="
          fixed inset-0 bg-black/40 backdrop-blur-sm
          flex items-center justify-center z-50
        "
          onClick={() => setSelected(null)}
        >
          <div
            className="
            bg-white rounded-2xl p-6 w-80 shadow-xl
            text-center
          "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">{selected.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{selected.title}</h3>
            <p className="text-sm text-slate-500 mb-5">
              {selected.love.toLocaleString()} people love this
            </p>

            <button
              onClick={() => setSelected(null)}
              className="
              w-full py-3 rounded-xl bg-orange-400 text-white 
              font-medium active:scale-95 transition
            "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
