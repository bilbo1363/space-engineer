import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { FlowNode, FlowEdge, ProgramGraph } from '../../types/flowGraph';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { ActionNode } from './nodes/ActionNode';
import { CustomActionNode } from './nodes/CustomActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { LoopNode } from './nodes/LoopNode';
import { SchemaManager, SavedSchema } from '../../utils/schemaManager';
import { SchemaManagerPanel } from './SchemaManagerPanel';

interface NodeBasedEditorProps {
  initialGraph?: ProgramGraph;
  onGraphChange?: (graph: ProgramGraph) => void;
}

export const NodeBasedEditor = ({ initialGraph, onGraphChange }: NodeBasedEditorProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialGraph?.nodes as Node[] || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialGraph?.edges as Edge[] || []);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // История для Undo/Redo
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Управление схемами
  const [showSchemaMenu, setShowSchemaMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Регистрация кастомных типов нод
  const nodeTypes = useMemo(
    () => ({
      start: StartNode,
      end: EndNode,
      action: ActionNode,
      customAction: CustomActionNode,
      condition: ConditionNode,
      loop: LoopNode,
    }),
    []
  );

  // Обработка создания новой связи
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: '#00FFFF', strokeWidth: 2 },
        className: 'react-flow__edge-path',
      };
      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        // Сохраняем в историю
        setTimeout(() => {
          setHistory((prev) => [...prev.slice(-19), { nodes, edges: updated }]);
          setHistoryIndex((prev) => prev + 1);
        }, 0);
        return updated;
      });
      
      if (onGraphChange) {
        onGraphChange({
          nodes: nodes as unknown as FlowNode[],
          edges: [...edges, newEdge] as unknown as FlowEdge[],
        });
      }
    },
    [nodes, edges, onGraphChange, setEdges]
  );

  // Обработка удаления нод/связей
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      console.log('Удалены ноды:', deleted);
      if (onGraphChange) {
        onGraphChange({
          nodes: nodes.filter(n => !deleted.find(d => d.id === n.id)) as unknown as FlowNode[],
          edges: edges as unknown as FlowEdge[],
        });
      }
    },
    [nodes, edges, onGraphChange]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      console.log('Удалены связи:', deleted);
      if (onGraphChange) {
        onGraphChange({
          nodes: nodes as unknown as FlowNode[],
          edges: edges.filter(e => !deleted.find(d => d.id === e.id)) as unknown as FlowEdge[],
        });
      }
    },
    [nodes, edges, onGraphChange]
  );

  // Обработка Drop из палитры
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');

      if (!data || !reactFlowBounds || !reactFlowInstance) return;

      const nodeData = JSON.parse(data);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: nodeData.type,
        position,
        data: {
          ...nodeData,  // Копируем все данные (включая loopType, count, condition)
        },
      };

      setNodes((nds) => nds.concat(newNode));
      
      if (onGraphChange) {
        onGraphChange({
          nodes: [...nodes, newNode] as unknown as FlowNode[],
          edges: edges as unknown as FlowEdge[],
        });
      }
    },
    [reactFlowInstance, nodes, edges, onGraphChange, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Обработка изменения связей (для вставки нод)
  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) => {
        const updatedEdges = els.filter((e) => e.id !== oldEdge.id);
        return addEdge(newConnection, updatedEdges);
      });
    },
    [setEdges]
  );

  // Сохранение в историю происходит автоматически в onConnect

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        event.preventDefault();
        redo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSaveSchema();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Загрузка сохранённых схем - теперь не нужно, SchemaManagerPanel сам загружает

  // КРИТИЧЕСКИ ВАЖНО: Отслеживаем изменения nodes/edges и вызываем onGraphChange
  useEffect(() => {
    if (onGraphChange && nodes.length > 0) {
      console.log('📊 Nodes/Edges изменились, вызываем onGraphChange:', { nodes, edges });
      onGraphChange({
        nodes: nodes as unknown as FlowNode[],
        edges: edges as unknown as FlowEdge[],
      });
    }
  }, [nodes, edges, onGraphChange]);

  // Сохранить схему
  const handleSaveSchema = () => {
    const name = prompt('Название схемы:');
    if (!name) return;
    
    const description = prompt('Описание (необязательно):');
    
    SchemaManager.saveSchema(name, { nodes: nodes as unknown as FlowNode[], edges: edges as unknown as FlowEdge[] }, description || undefined);
    alert('✅ Схема сохранена!');
  };

  // Загрузка схем теперь обрабатывается в SchemaManagerPanel

  // Загрузить шаблон
  const handleLoadTemplate = (template: SavedSchema) => {
    if (confirm(`Загрузить шаблон "${template.name}"? Текущая схема будет заменена.`)) {
      setNodes(template.graph.nodes as Node[]);
      setEdges(template.graph.edges as Edge[]);
      setShowTemplates(false);
      
      if (onGraphChange) {
        onGraphChange(template.graph);
      }
    }
  };

  // Экспорт в файл
  const handleExport = () => {
    const name = prompt('Название для экспорта:', 'my_schema');
    if (!name) return;
    
    const schema: SavedSchema = {
      id: `export_${Date.now()}`,
      name,
      graph: { nodes: nodes as unknown as FlowNode[], edges: edges as unknown as FlowEdge[] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    SchemaManager.exportToFile(schema);
  };

  // Очистить схему (сброс к начальному состоянию)
  const handleClear = () => {
    if (confirm('Очистить схему? Все несохранённые изменения будут потеряны.')) {
      const defaultGraph: ProgramGraph = {
        nodes: [
          {
            id: 'start',
            type: 'start',
            position: { x: 50, y: 250 },
            data: { label: 'Начало', icon: '▶️' },
          },
          {
            id: 'end',
            type: 'end',
            position: { x: 600, y: 250 },
            data: { label: 'Конец', icon: '⏹️' },
          },
        ],
        edges: [],
      };
      
      setNodes(defaultGraph.nodes as Node[]);
      setEdges(defaultGraph.edges as Edge[]);
      
      if (onGraphChange) {
        onGraphChange(defaultGraph);
      }
      
      console.log('🧹 Схема очищена, загружен дефолтный граф');
    }
  };

  // Импорт из файла
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const schema = await SchemaManager.importFromFile(file);
        setNodes(schema.graph.nodes as Node[]);
        setEdges(schema.graph.edges as Edge[]);
        alert('✅ Схема импортирована!');
        
        if (onGraphChange) {
          onGraphChange(schema.graph);
        }
      } catch (error) {
        alert('❌ Ошибка при импорте файла');
      }
    };
    input.click();
  };

  return (
    <div 
      ref={reactFlowWrapper}
      className="w-full h-full bg-deep-blue rounded border-2 border-bright-cyan/30"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onEdgeUpdate={onEdgeUpdate}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        deleteKeyCode="Delete"
        edgesUpdatable={true}
        edgesFocusable={true}
        elementsSelectable={true}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#00FFFF', strokeWidth: 2 },
          type: 'smoothstep',
        }}
        connectionLineStyle={{ stroke: '#FF8C00', strokeWidth: 3 }}
        reconnectRadius={20}
        style={{
          background: '#0A0E2E',
        }}
        // Стили для выделенных элементов
        className="node-based-editor"
      >
        <style>{`
          .node-based-editor .react-flow__node.selected {
            box-shadow: 0 0 20px 5px #00FFFF !important;
            border: 3px solid #00FFFF !important;
          }
          .node-based-editor .react-flow__edge.selected .react-flow__edge-path {
            stroke: #FF8C00 !important;
            stroke-width: 4px !important;
            filter: drop-shadow(0 0 10px #FF8C00);
          }
          .node-based-editor .react-flow__edge:hover .react-flow__edge-path {
            stroke: #FFD700 !important;
            stroke-width: 3px !important;
          }
        `}</style>
        {/* Сетка */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#00FFFF"
          style={{ opacity: 0.2 }}
        />

        {/* Контролы (zoom, pan) */}
        <Controls />
        
        {/* Кнопки управления схемами */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleSaveSchema}
            className="px-4 py-2 bg-bright-cyan text-deep-blue font-bold rounded hover:bg-bright-cyan/90 transition-colors shadow-lg"
            title="Сохранить схему (Ctrl+S)"
          >
            💾 Сохранить
          </button>
          
          <button
            onClick={() => setShowSchemaMenu(!showSchemaMenu)}
            className="px-4 py-2 bg-bright-orange text-deep-blue font-bold rounded hover:bg-bright-orange/90 transition-colors shadow-lg"
            title="Загрузить схему"
          >
            📂 Загрузить
          </button>
          
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-warning-yellow text-deep-blue font-bold rounded hover:bg-warning-yellow/90 transition-colors shadow-lg"
            title="Шаблоны"
          >
            📋 Шаблоны
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition-colors shadow-lg"
            title="Экспорт в файл"
          >
            ⬇️ Экспорт
          </button>
          
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition-colors shadow-lg"
            title="Импорт из файла"
          >
            ⬆️ Импорт
          </button>
          
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-500 transition-colors shadow-lg"
            title="Очистить схему"
          >
            🧹 Очистить
          </button>
        </div>

        {/* Панель управления схемами */}
        {showSchemaMenu && (
          <SchemaManagerPanel
            onLoadSchema={(schema) => {
              if (confirm(`Загрузить схему "${schema.name}"? Текущая схема будет заменена.`)) {
                setNodes(schema.graph.nodes as Node[]);
                setEdges(schema.graph.edges as Edge[]);
              }
            }}
            onClose={() => setShowSchemaMenu(false)}
          />
        )}

        {/* Меню шаблонов */}
        {showTemplates && (
          <div className="absolute top-4 right-56 bg-dark-purple border-2 border-warning-yellow rounded-lg p-4 shadow-xl z-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-warning-yellow font-bold">Быстрые шаблоны</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-white hover:text-warning-yellow"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {SchemaManager.getTemplates().map((template) => (
                <div
                  key={template.id}
                  className="p-3 bg-deep-blue rounded border border-warning-yellow/30 hover:border-warning-yellow cursor-pointer transition-colors"
                  onClick={() => handleLoadTemplate(template)}
                >
                  <div className="font-bold text-white">{template.name}</div>
                  {template.description && (
                    <div className="text-xs text-gray-400 mt-1">{template.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Мини-карта */}
        <MiniMap
          style={{
            backgroundColor: '#1A1A2E',
            border: '2px solid #00FFFF',
          }}
          nodeColor="#00FFFF"
          maskColor="rgba(10, 14, 46, 0.8)"
        />
      </ReactFlow>
    </div>
  );
};
