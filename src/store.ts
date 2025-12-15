import { makeAutoObservable } from 'mobx';
import type { Link, GanttConfig, SerializedTask } from '@dhtmlx/trial-react-gantt';
import { seedTasks, seedLinks, defaultZoomLevels, type ZoomLevel } from './seed/Seed';

interface Snapshot {
  tasks: SerializedTask[];
  links: Link[];
  config: GanttConfig;
}

export class GanttStore {
  tasks: SerializedTask[] = seedTasks;
  links: Link[] = seedLinks;
  config: GanttConfig = {
    zoom: defaultZoomLevels,
  };
  past: Snapshot[] = [];
  future: Snapshot[] = [];
  maxHistory: number = 50;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  _snapshot(): Snapshot {
    return {
      tasks: JSON.parse(JSON.stringify(this.tasks)),
      links: JSON.parse(JSON.stringify(this.links)),
      config: JSON.parse(JSON.stringify(this.config)),
    };
  }

  _saveToHistory() {
    this.past.push(this._snapshot());
    if (this.past.length > this.maxHistory) this.past.shift();
    this.future = [];
  }

  undo() {
    if (this.past.length === 0) return;
    const previous = this.past.pop();
    if (previous) {
      this.future.unshift(this._snapshot());
      this.tasks = previous.tasks;
      this.links = previous.links;
      this.config = previous.config;
    }
  }

  redo() {
    if (this.future.length === 0) return;
    const next = this.future.shift();
    if (next) {
      this.past.push(this._snapshot());
      this.tasks = next.tasks;
      this.links = next.links;
      this.config = next.config;
    }
  }

  setZoom(level: ZoomLevel) {
    this._saveToHistory();
    this.config = { ...this.config, zoom: { ...this.config.zoom, current: level } };
  }

  addTask(task: SerializedTask) {
    this._saveToHistory();
    const newTask = { ...task, id: `DB_ID:${task.id}` };
    this.tasks.push(newTask);
    return newTask;
  }

  upsertTask(task: SerializedTask) {
    this._saveToHistory();
    const index = this.tasks.findIndex((t) => String(t.id) === String(task.id));
    if (index !== -1) this.tasks[index] = { ...this.tasks[index], ...task };
  }

  deleteTask(id: string | number) {
    this._saveToHistory();
    this.tasks = this.tasks.filter((task) => String(task.id) !== String(id));
  }

  addLink(link: Link) {
    this._saveToHistory();
    const newLink = { ...link, id: `DB_ID:${link.id}` };
    this.links.push(newLink);
    return newLink;
  }

  upsertLink(link: Link) {
    this._saveToHistory();
    const index = this.links.findIndex((link) => String(link.id) === String(link.id));
    if (index !== -1) this.links[index] = { ...this.links[index], ...link };
  }

  deleteLink(id: string | number) {
    this._saveToHistory();
    this.links = this.links.filter((link) => String(link.id) !== String(id));
  }
}

export const store = new GanttStore();
