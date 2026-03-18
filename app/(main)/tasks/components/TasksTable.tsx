"use client";

import { TaskItem, KanbanColumn } from "./task-types";
import { 
  Calendar, 
  Flag, 
  Tag, 
  CheckCircle2, 
  MoreHorizontal, 
  Eye,
  Trash2,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  List
} from "lucide-react";
import clsx from "clsx";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import React, { useState } from "react";

type TasksTableProps = {
  columns: KanbanColumn[];
  tasks: TaskItem[];
  onTaskClick?: (task: TaskItem) => void;
  onDeleteTask?: (id: string) => void;
  onAddTask?: (status: string) => void;
};

const priorityConfig = {
  low: { color: "text-blue-600", bg: "bg-blue-50" },
  medium: { color: "text-orange-600", bg: "bg-orange-50" },
  high: { color: "text-red-600", bg: "bg-red-50" },
};

export default function TasksTable({ 
  columns, 
  tasks, 
  onTaskClick, 
  onDeleteTask,
  onAddTask
}: TasksTableProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="w-full border-collapse text-left table-fixed">
        <thead className="sticky top-0 bg-white border-b border-slate-200 z-20">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-12 text-center">Done</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[300px]">Task Name</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32 text-center">Priority</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40">Due Date</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {columns.map((column) => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            const isCollapsed = collapsedGroups[column.id];

            return (
              <React.Fragment key={column.id}>
                {/* Group Header Row */}
                <tr className="bg-slate-50/50 group/header select-none">
                  <td colSpan={6} className="px-4 py-2">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition"
                        onClick={() => toggleGroup(column.id)}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                          {column.title}
                        </span>
                        <span className="bg-slate-200 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {columnTasks.length}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => onAddTask?.(column.id)}
                        className="opacity-0 group-hover/header:opacity-100 p-1 hover:bg-blue-50 text-blue-600 rounded transition flex items-center gap-1 text-[10px] font-bold uppercase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Task
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Task Rows */}
                {!isCollapsed && columnTasks.length > 0 && columnTasks.map((task) => {
                  const status = column.title;
                  const isCompleted = task.status.toLowerCase().includes("done") || task.status.toLowerCase().includes("complete");

                  return (
                    <tr 
                      key={task.id} 
                      className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onTaskClick?.(task)}
                    >
                      <td className="px-6 py-4 text-center">
                        <div className={clsx(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mx-auto",
                          isCompleted ? "bg-green-500 border-green-500 text-white" : "border-slate-300 group-hover:border-blue-400"
                        )}>
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={clsx(
                            "text-sm font-semibold text-slate-700 truncate",
                            isCompleted && "line-through text-slate-400"
                          )}>
                            {task.title}
                          </span>
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.tags.map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 truncate max-w-full">
                            {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold capitalize",
                          priorityConfig[task.priority].bg,
                          priorityConfig[task.priority].color
                        )}>
                          <Flag className="w-3 h-3" />
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {task.dueDate || "No date"}
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <Popover>
                            <PopoverTrigger asChild>
                              <button className="p-1.5 hover:bg-slate-200 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                                  <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-32 p-1" side="left" align="center">
                              <button 
                                onClick={() => onTaskClick?.(task)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-md transition"
                              >
                                  <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              <button 
                                onClick={() => onDeleteTask?.(task.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition"
                              >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Empty Message for Group */}
                {!isCollapsed && columnTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-[10px] font-medium italic">
                      No tasks in this stage.
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
           <List className="w-12 h-12 mb-4 opacity-20" />
           <p className="text-sm">No tasks found in this project.</p>
        </div>
      )}
    </div>
  );
}
