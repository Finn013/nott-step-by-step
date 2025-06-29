
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StepGroup as StepGroupType, Step } from '../types/Step';
import StepEditor from './StepEditor';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'sonner';

interface StepGroupProps {
  group: StepGroupType;
  onUpdateGroup: (groupId: string, updates: Partial<StepGroupType>) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateStep: (step: Step) => void;
  onDeleteStep: (stepId: string) => void;
  onCopyStep: (step: Step) => void;
  onEditImage?: (stepId: string) => void;
  onAddStepToGroup?: (groupId: string, type: 'text' | 'image' | 'code' | 'html' | 'file') => void;
}

const StepGroupComponent: React.FC<StepGroupProps> = ({
  group,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateStep,
  onDeleteStep,
  onCopyStep,
  onEditImage,
  onAddStepToGroup
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(group.title);

  const handleSaveTitle = () => {
    onUpdateGroup(group.id, { title: editTitle });
    setIsEditing(false);
  };

  const handleToggleCollapse = () => {
    onUpdateGroup(group.id, { isCollapsed: !group.isCollapsed });
  };

  const handleAddStep = (type: 'text' | 'image' | 'code' | 'html' | 'file') => {
    if (onAddStepToGroup) {
      onAddStepToGroup(group.id, type);
      toast.success(`Шаг "${type}" добавлен в группу`);
    }
  };

  const getGroupClasses = () => {
    const baseClasses = 'rounded-lg p-4 mb-4 border-2 shadow-lg';
    
    if (!group.style?.type || group.style.type === 'default') {
      return `${baseClasses} bg-slate-700/50 border-purple-600/30`;
    }
    
    switch (group.style.type) {
      case 'info':
        return `${baseClasses} bg-blue-900/40 border-blue-600/50`;
      case 'warning':
        return `${baseClasses} bg-yellow-900/40 border-yellow-600/50`;
      case 'success':
        return `${baseClasses} bg-green-900/40 border-green-600/50`;
      case 'error':
        return `${baseClasses} bg-red-900/40 border-red-600/50`;
      default:
        return `${baseClasses} bg-slate-700/50 border-purple-600/30`;
    }
  };

  return (
    <div className={getGroupClasses()}>
      <Collapsible open={!group.isCollapsed}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger onClick={handleToggleCollapse}>
              {group.isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-purple-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-purple-400" />
              )}
            </CollapsibleTrigger>
            
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                />
                <Button size="sm" onClick={handleSaveTitle} className="bg-green-600 hover:bg-green-700">
                  Сохранить
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg">📁</span>
                <h3 className="text-lg font-semibold text-purple-200">{group.title}</h3>
                <span className="text-xs text-purple-300 bg-purple-800/30 px-2 py-1 rounded">
                  {group.steps.length} шагов
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-1">
            {onAddStepToGroup && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить шаг
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-700 border-slate-600 z-50">
                  <DropdownMenuItem 
                    onClick={() => handleAddStep('text')}
                    className="text-white hover:bg-slate-600 cursor-pointer"
                  >
                    📝 Текст
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAddStep('code')}
                    className="text-white hover:bg-slate-600 cursor-pointer"
                  >
                    💻 Код
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAddStep('html')}
                    className="text-white hover:bg-slate-600 cursor-pointer"
                  >
                    🌐 HTML
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAddStep('image')}
                    className="text-white hover:bg-slate-600 cursor-pointer"
                  >
                    🖼️ Изображение
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleAddStep('file')}
                    className="text-white hover:bg-slate-600 cursor-pointer"
                  >
                    📎 Файл
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-400 hover:text-blue-300"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteGroup(group.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CollapsibleContent>
          <Droppable droppableId={`group-${group.id}`} type="step">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-4 transition-colors rounded-lg p-2 ${
                  snapshot.isDraggingOver ? 'bg-purple-900/20 border-2 border-dashed border-purple-500' : ''
                }`}
              >
                {group.steps.map((step, index) => (
                  <Draggable key={step.id} draggableId={step.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition-transform ${
                          snapshot.isDragging ? 'rotate-2 scale-105 z-50' : ''
                        }`}
                      >
                        <StepEditor
                          step={step}
                          onUpdate={onUpdateStep}
                          onDelete={onDeleteStep}
                          onCopy={onCopyStep}
                          onEditImage={onEditImage}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {group.steps.length === 0 && (
                  <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-600 rounded-lg">
                    <div className="text-2xl mb-2">📋</div>
                    <p>Перетащите шаги сюда или используйте кнопку "Добавить шаг"</p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default StepGroupComponent;
