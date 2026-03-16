"use client";

import { TaskItem, KanbanColumn } from "./task-types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { Plus, MoreHorizontal, Settings2, Trash2, Edit2, Check } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type TasksKanbanBoardProps = {
  columns: KanbanColumn[];
  tasks: TaskItem[];
  onTasksChange: (newTasks: TaskItem[]) => void;
  onColumnsChange: (newColumns: KanbanColumn[]) => void;
  onTaskClick?: (task: TaskItem) => void;
  onAddTask?: (status: string) => void;
};

export default function TasksKanbanBoard({ 
  columns, 
  tasks, 
  onTasksChange, 
  onColumnsChange,
  onTaskClick,
  onAddTask
}: TasksKanbanBoardProps) {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Reorder Columns
    if (type === "column") {
      const newColumns = Array.from(columns);
      const [draggedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, draggedColumn);
      onColumnsChange(newColumns);
      return;
    }

    // Reorder Tasks
    const newTasks = Array.from(tasks);
    const draggedTaskIndex = newTasks.findIndex(t => t.id === draggableId);
    if (draggedTaskIndex === -1) return;

    const [draggedTask] = newTasks.splice(draggedTaskIndex, 1);
    
    // Update status if moved to a different column
    if (source.droppableId !== destination.droppableId) {
      draggedTask.status = destination.droppableId;
    }

    // This logic is simplified: we need to place it correctly in the main array 
    // relative to tasks in the TARGET column.
    const tasksInTargetColumn = newTasks.filter(t => t.status === destination.droppableId);
    const otherTasks = newTasks.filter(t => t.status !== destination.droppableId);
    
    const before = tasksInTargetColumn.slice(0, destination.index);
    const after = tasksInTargetColumn.slice(destination.index);
    
    const finalTasks = [
      ...otherTasks,
      ...before,
      draggedTask,
      ...after
    ];

    onTasksChange(finalTasks);
  };

  const handleAddColumn = () => {
    const newId = `col-${Date.now()}`;
    onColumnsChange([...columns, { id: newId, title: "New Column" }]);
    setEditingColumnId(newId);
    setTempTitle("New Column");
  };

  const handleRenameColumn = (id: string) => {
    if (!tempTitle.trim()) return;
    onColumnsChange(columns.map(col => col.id === id ? { ...col, title: tempTitle } : col));
    setEditingColumnId(null);
  };

  const handleDeleteColumn = (id: string) => {
    onColumnsChange(columns.filter(col => col.id !== id));
    // Optionally: delete or move tasks in this column
    onTasksChange(tasks.filter(t => t.status !== id));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-6 p-6 h-full overflow-x-auto min-w-full items-start"
            >
              {columns.map((column, index) => {
                const columnTasks = tasks.filter((t) => t.status === column.id);

                return (
                  <Draggable draggableId={column.id} index={index} key={column.id}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="flex flex-col w-80 min-w-[320px] max-h-full"
                      >
                        {/* Column Header */}
                        <div 
                          {...provided.dragHandleProps}
                          className="flex items-center justify-between mb-4 px-1 group/header"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {editingColumnId === column.id ? (
                              <div className="flex items-center gap-1 w-full">
                                <input
                                  autoFocus
                                  className="text-sm font-bold text-slate-800 bg-white border border-blue-500 rounded px-1.5 py-0.5 outline-none w-full"
                                  value={tempTitle}
                                  onChange={(e) => setTempTitle(e.target.value)}
                                  onBlur={() => handleRenameColumn(column.id)}
                                  onKeyDown={(e) => e.key === "Enter" && handleRenameColumn(column.id)}
                                />
                                <button onClick={() => handleRenameColumn(column.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                   <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <h3 
                                  className="font-bold text-slate-800 truncate cursor-text"
                                  onClick={() => {
                                    setEditingColumnId(column.id);
                                    setTempTitle(column.title);
                                  }}
                                >
                                  {column.title}
                                </h3>
                                <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  {columnTasks.length}
                                </span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-opacity ml-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-1" side="bottom" align="end">
                                <button 
                                  onClick={() => {
                                    setEditingColumnId(column.id);
                                    setTempTitle(column.title);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-md transition"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Rename
                                </button>
                                <button 
                                  onClick={() => handleDeleteColumn(column.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Droppable Area for Tasks */}
                        <Droppable droppableId={column.id} type="task">
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`flex-1 overflow-y-auto min-h-[150px] rounded-xl transition-colors pb-10 ${
                                snapshot.isDraggingOver ? "bg-slate-200/50" : ""
                              }`}
                            >
                              <div className="flex flex-col gap-3">
                                {columnTasks.map((task, index) => (
                                  <TaskCard 
                                    key={task.id} 
                                    task={task} 
                                    index={index} 
                                    onClick={() => onTaskClick?.(task)}
                                  />
                                ))}
                                {provided.placeholder}
                              </div>
                              
                              <button 
                                onClick={() => onAddTask?.(column.id)}
                                className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-sm text-slate-500 hover:bg-slate-200/50 rounded-lg border-2 border-dashed border-transparent hover:border-slate-300 transition-all group"
                              >
                                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Add Task</span>
                              </button>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              
              {/* Add Column Button */}
              <div className="w-80 min-w-[320px]">
                 <button 
                  onClick={handleAddColumn}
                  className="w-full h-12 flex items-center gap-2 px-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-100 transition-all font-medium"
                 >
                    <Plus className="w-4 h-4" />
                    Add Column
                 </button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
