import React, { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import ReactGantt, { type ReactGanttProps, type SerializedTask, type Link } from '@dhtmlx/trial-react-gantt';
import '@dhtmlx/trial-react-gantt/dist/react-gantt.css';

import Toolbar from './Toolbar';
import { store } from '../store';

const DemoMobXBasic: React.FC = observer(() => {
  const {
    tasks,
    links,
    config,
    setZoom,
    addTask,
    upsertTask,
    deleteTask,
    addLink,
    upsertLink,
    deleteLink,
    undo,
    redo,
  } = store;

  useEffect(() => {
    document.title = 'DHTMLX React Gantt | MobX';
  }, []);

  const templates: ReactGanttProps['templates'] = useMemo(
    () => ({
      format_date: (d) => d.toISOString(),
      parse_date: (s) => new Date(s),
    }),
    []
  );

  const data: ReactGanttProps['data'] = useMemo(
    () => ({
      save: (entity, action, payload, id) => {
        if (entity === 'task') {
          const task = payload as SerializedTask;
          if (action === 'create') return addTask(task);
          if (action === 'update') return upsertTask(task);
          if (action === 'delete') return deleteTask(id);
        }
        if (entity === 'link') {
          const link = payload as Link;
          if (action === 'create') return addLink(link);
          if (action === 'update') return upsertLink(link);
          if (action === 'delete') return deleteLink(id);
        }
      },
    }),
    [addTask, upsertTask, deleteTask, addLink, upsertLink, deleteLink]
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar onUndo={undo} onRedo={redo} currentZoom={config.zoom.current} onZoom={setZoom} />
      <ReactGantt tasks={tasks} links={links} config={config} templates={templates} data={data} />
    </div>
  );
});

export default DemoMobXBasic;
