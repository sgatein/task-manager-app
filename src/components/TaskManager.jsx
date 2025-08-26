import React, { useState, useEffect } from 'react';
import { Plus, Clock, AlertCircle, CheckCircle2, Circle, Trash2, Edit3 } from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'personal',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    status: 'todo'
  });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');

  // Initialize tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskManager-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskManager-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      id: Date.now(),
      ...newTask,
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      category: activeTab,
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      status: 'todo'
    });
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    setEditingId(null);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleStatus = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'todo' ? 'completed' : 'todo';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const getTaskUrgency = (task) => {
    if (!task.dueDate) return 'none';
    
    const now = new Date();
    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime || '23:59'}`);
    const diffHours = (dueDateTime - now) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'overdue';
    if (diffHours < 24) return 'today';
    if (diffHours < 72) return 'soon';
    return 'future';
  };

  const formatDueDateTime = (task) => {
    if (!task.dueDate) return '';
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateStr = '';
    if (dueDate.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = dueDate.toLocaleDateString();
    }
    
    if (task.dueTime) {
      const timeStr = new Date(`2000-01-01T${task.dueTime}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `${dateStr} at ${timeStr}`;
    }
    
    return dateStr;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'today': return 'text-orange-600 bg-orange-50';
      case 'soon': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = task.category === activeTab;
    if (!categoryMatch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'pending') return task.status === 'todo';
    if (filter === 'overdue') return getTaskUrgency(task) === 'overdue';
    
    return true;
  }).sort((a, b) => {
    // Sort by urgency first, then by priority
    const urgencyOrder = { overdue: 0, today: 1, soon: 2, future: 3, none: 4 };
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    const urgencyDiff = urgencyOrder[getTaskUrgency(a)] - urgencyOrder[getTaskUrgency(b)];
    if (urgencyDiff !== 0) return urgencyDiff;
    
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const taskCounts = {
    all: tasks.filter(t => t.category === activeTab).length,
    pending: tasks.filter(t => t.category === activeTab && t.status === 'todo').length,
    completed: tasks.filter(t => t.category === activeTab && t.status === 'completed').length,
    overdue: tasks.filter(t => t.category === activeTab && getTaskUrgency(t) === 'overdue').length
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Manager</h1>
        <p className="text-gray-600">Keep track of your personal and business tasks</p>
      </div>

      {/* Quick Add Task */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Quick Add Task
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            className="col-span-1 md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          
          <select
            value={newTask.category}
            onChange={(e) => setNewTask({...newTask, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
          
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="time"
            value={newTask.dueTime}
            onChange={(e) => setNewTask({...newTask, dueTime: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={addTask}
            disabled={!newTask.title.trim()}
            className="md:col-span-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Plus size={18} className="mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'personal' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Personal ({tasks.filter(t => t.category === 'personal').length})
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'business' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Business ({tasks.filter(t => t.category === 'business').length})
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All ({taskCounts.all})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Pending ({taskCounts.pending})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Completed ({taskCounts.completed})
            </button>
            {taskCounts.overdue > 0 && (
              <button
                onClick={() => setFilter('overdue')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-600'
                }`}
              >
                Overdue ({taskCounts.overdue})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Circle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No tasks found</p>
            <p className="text-sm">Add your first task above to get started!</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const urgency = getTaskUrgency(task);
            const isEditing = editingId === task.id;
            
            return (
              <div
                key={task.id}
                className={`bg-white border-l-4 ${getPriorityColor(task.priority)} rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 ${
                  task.status === 'completed' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleStatus(task.id)}
                      className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 size={20} className="text-green-600" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            defaultValue={task.title}
                            onBlur={(e) => updateTask(task.id, { title: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateTask(task.id, { title: e.target.value });
                              }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <h3 className={`font-medium ${
                          task.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-800'
                        }`}>
                          {task.title}
                        </h3>
                      )}
                      
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority} priority
                        </span>
                        
                        {formatDueDateTime(task) && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getUrgencyColor(urgency)}`}>
                            <Clock size={12} className="mr-1" />
                            {formatDueDateTime(task)}
                          </span>
                        )}
                        
                        {urgency === 'overdue' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingId(isEditing ? null : task.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskManager;