import React, { useState, useEffect } from 'react';
import { Project, Conversation } from '../types';
import { FolderGit2, Plus, Trash2, Edit3, MessageSquare, Sparkles, Check, X, ShieldCheck } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  conversations: Conversation[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (proj: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
  initialCreateMode?: boolean;
}

const PROJECT_COLORS = ['#06b6d4', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  conversations,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  initialCreateMode = false,
}) => {
  const [isCreating, setIsCreating] = useState(initialCreateMode);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [context, setContext] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  useEffect(() => {
    if (initialCreateMode) {
      resetForm();
      setIsCreating(true);
    }
  }, [initialCreateMode]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setInstructions('');
    setContext('');
    setColor(PROJECT_COLORS[0]);
    setIsCreating(false);
    setEditingProjectId(null);
  };

  const startEditProject = (proj: Project) => {
    setEditingProjectId(proj.id);
    setName(proj.name);
    setDescription(proj.description || '');
    setInstructions(proj.instructions || '');
    setContext(proj.context || '');
    setColor(proj.color || PROJECT_COLORS[0]);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProjectId) {
      if (onUpdateProject) {
        onUpdateProject(editingProjectId, {
          name: name.trim(),
          description: description.trim(),
          instructions: instructions.trim(),
          context: context.trim(),
          color,
        });
      }
    } else {
      onCreateProject({
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        context: context.trim(),
        color,
      });
    }

    resetForm();
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-[#090d16] text-slate-100">
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                Projects Workspace
              </h1>
              <span className="text-xs font-mono text-cyan-400">
                Organize Conversations with Dedicated Context & Custom AI Directives
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {(isCreating || editingProjectId) && (
        <form
          onSubmit={handleSave}
          className="my-6 p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl flex flex-col gap-4 max-w-2xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{editingProjectId ? 'Edit Project Directive' : 'Create Project'}</span>
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cyber Security Pentest Suite, Mobile App Architecture..."
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Brief Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Goal of this project..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Custom AI Instructions for this Project
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              placeholder="How AI 1 should behave in this project (e.g. strict TypeScript types, zero-trust security checks)..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Project Context / Reference Notes
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              placeholder="Key facts, architecture rules, URLs, or background context for AI 1..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Project Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {color === c && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            >
              {editingProjectId ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-2xl p-6 text-slate-500">
            <FolderGit2 className="w-12 h-12 text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No projects yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a project to bundle custom system instructions, files, and chats.
            </p>
          </div>
        ) : (
          projects.map((proj) => {
            const projectChats = conversations.filter((c) => c.projectId === proj.id);
            return (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: proj.color }} />
                      <h3 className="text-base font-bold text-white truncate max-w-[180px]">{proj.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditProject(proj)}
                        className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                        title="Edit project instructions & settings"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">{proj.description || 'No description'}</p>

                  {proj.instructions && (
                    <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-cyan-300 font-mono line-clamp-2">
                      {proj.instructions}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{projectChats.length} Chats</span>
                  </span>
                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                  >
                    Open Project
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
