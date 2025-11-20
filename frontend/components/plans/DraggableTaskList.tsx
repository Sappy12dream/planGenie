'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types/plan';
import { TaskItem } from './TaskItem';
import { tasksApi } from '@/lib/api/tasks';

interface DraggableTaskListProps {
  tasks: Task[];
  planId: string;
}

export function DraggableTaskList({ tasks, planId }: DraggableTaskListProps) {
  const queryClient = useQueryClient();
  const [draggedTasks, setDraggedTasks] = useState<Task[] | null>(null);

  const reorderMutation = useMutation({
    mutationFn: (reorderedTasks: { task_id: string; new_order: number }[]) =>
      tasksApi.reorderTasks(reorderedTasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', planId] });
      setDraggedTasks(null);
    },
    onError: () => {
      // Revert to server data on error
      queryClient.invalidateQueries({ queryKey: ['plan', planId] });
      setDraggedTasks(null);
    },
  });

  // Use dragged tasks while dragging, otherwise use props
  const displayTasks = draggedTasks || tasks || [];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      setDraggedTasks(null);
      return;
    }

    const items = Array.from(tasks || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state for optimistic UI
    setDraggedTasks(items);

    // Prepare reorder data with new order values
    const reorderData = items.map((task, index) => ({
      task_id: task.id,
      new_order: index,
    }));

    // Send to backend
    reorderMutation.mutate(reorderData);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {displayTasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-shadow ${snapshot.isDragging ? 'shadow-lg dark:shadow-slate-900/50' : ''
                      }`}
                  >
                    <TaskItem
                      task={task}
                      planId={planId}
                      isDragging={snapshot.isDragging}
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
  );
}
