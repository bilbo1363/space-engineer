import { ProgramGraph } from '../types/flowGraph';

export interface SavedSchema {
  id: string;
  name: string;
  description?: string;
  graph: ProgramGraph;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  tags?: string[];
  missionId?: string;
}

const STORAGE_KEY = 'saved_schemas';

/**
 * Менеджер сохранённых схем
 */
export class SchemaManager {
  /**
   * Получить все сохранённые схемы
   */
  static getAllSchemas(): SavedSchema[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Сохранить схему
   */
  static saveSchema(name: string, graph: ProgramGraph, description?: string): SavedSchema {
    const schemas = this.getAllSchemas();
    
    const schema: SavedSchema = {
      id: `schema_${Date.now()}`,
      name,
      description,
      graph,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    schemas.push(schema);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
    
    return schema;
  }

  /**
   * Загрузить схему по ID
   */
  static loadSchema(id: string): SavedSchema | null {
    const schemas = this.getAllSchemas();
    return schemas.find(s => s.id === id) || null;
  }

  /**
   * Удалить схему
   */
  static deleteSchema(id: string): void {
    const schemas = this.getAllSchemas();
    const filtered = schemas.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Обновить схему
   */
  static updateSchema(id: string, name: string, graph: ProgramGraph, description?: string): void {
    const schemas = this.getAllSchemas();
    const index = schemas.findIndex(s => s.id === id);
    
    if (index !== -1) {
      schemas[index] = {
        ...schemas[index],
        name,
        description,
        graph,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
    }
  }

  /**
   * Экспорт схемы в JSON файл
   */
  static exportToFile(schema: SavedSchema): void {
    const dataStr = JSON.stringify(schema, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schema.name.replace(/\s+/g, '_')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Импорт схемы из JSON файла
   */
  static importFromFile(file: File): Promise<SavedSchema> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const schema = JSON.parse(e.target?.result as string) as SavedSchema;
          // Обновляем ID и даты
          schema.id = `schema_${Date.now()}`;
          schema.createdAt = new Date().toISOString();
          schema.updatedAt = new Date().toISOString();
          
          const schemas = this.getAllSchemas();
          schemas.push(schema);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
          
          resolve(schema);
        } catch (error) {
          reject(new Error('Ошибка при чтении файла'));
        }
      };
      
      reader.onerror = () => reject(new Error('Ошибка при чтении файла'));
      reader.readAsText(file);
    });
  }

  /**
   * Дублировать схему
   */
  static duplicateSchema(id: string, newName?: string): SavedSchema | null {
    const schema = this.loadSchema(id);
    if (!schema) return null;

    const duplicate: SavedSchema = {
      ...schema,
      id: `schema_${Date.now()}`,
      name: newName || `${schema.name} (копия)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false, // Копия не избранная
    };

    const schemas = this.getAllSchemas();
    schemas.push(duplicate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));

    return duplicate;
  }

  /**
   * Переключить избранное
   */
  static toggleFavorite(id: string): void {
    const schemas = this.getAllSchemas();
    const index = schemas.findIndex(s => s.id === id);
    
    if (index !== -1) {
      schemas[index].isFavorite = !schemas[index].isFavorite;
      schemas[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
    }
  }

  /**
   * Переименовать схему
   */
  static renameSchema(id: string, newName: string): void {
    const schemas = this.getAllSchemas();
    const index = schemas.findIndex(s => s.id === id);
    
    if (index !== -1) {
      schemas[index].name = newName;
      schemas[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
    }
  }

  /**
   * Поиск схем по названию
   */
  static searchSchemas(query: string): SavedSchema[] {
    const schemas = this.getAllSchemas();
    const lowerQuery = query.toLowerCase();
    return schemas.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Сортировка схем
   */
  static sortSchemas(
    schemas: SavedSchema[], 
    sortBy: 'name' | 'date' | 'updated' | 'size',
    order: 'asc' | 'desc' = 'desc'
  ): SavedSchema[] {
    const sorted = [...schemas].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'size':
          comparison = a.graph.nodes.length - b.graph.nodes.length;
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });

    // Избранные всегда сверху
    return sorted.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  }

  /**
   * Фильтр по тегам
   */
  static filterByTags(tags: string[]): SavedSchema[] {
    const schemas = this.getAllSchemas();
    return schemas.filter(s => 
      s.tags?.some(tag => tags.includes(tag))
    );
  }

  /**
   * Получить быстрые шаблоны
   */
  static getTemplates(): SavedSchema[] {
    return [
      {
        id: 'template_simple',
        name: 'Простое движение',
        description: 'Базовый шаблон: вперёд → поворот → вперёд',
        graph: {
          nodes: [
            { id: 'start', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Начало', icon: '▶️' } },
            { id: 'move1', type: 'action', position: { x: 250, y: 150 }, data: { nodeType: 'moveForward', label: 'Вперед', icon: '↑' } },
            { id: 'turn', type: 'action', position: { x: 250, y: 250 }, data: { nodeType: 'turnRight', label: 'Направо', icon: '↱' } },
            { id: 'move2', type: 'action', position: { x: 250, y: 350 }, data: { nodeType: 'moveForward', label: 'Вперед', icon: '↑' } },
            { id: 'end', type: 'end', position: { x: 250, y: 450 }, data: { label: 'Конец', icon: '⏹️' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'move1' },
            { id: 'e2', source: 'move1', target: 'turn' },
            { id: 'e3', source: 'turn', target: 'move2' },
            { id: 'e4', source: 'move2', target: 'end' },
          ],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'template_loop',
        name: 'Цикл 5 раз',
        description: 'Шаблон с циклом: повторить 5 раз',
        graph: {
          nodes: [
            { id: 'start', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Начало', icon: '▶️' } },
            { id: 'loop', type: 'loop', position: { x: 250, y: 150 }, data: { loopType: 'repeat', count: 5, label: 'Повторить 5', icon: '🔁' } },
            { id: 'move', type: 'action', position: { x: 250, y: 300 }, data: { nodeType: 'moveForward', label: 'Вперед', icon: '↑' } },
            { id: 'end', type: 'end', position: { x: 250, y: 450 }, data: { label: 'Конец', icon: '⏹️' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'loop' },
            { id: 'e2', source: 'loop', target: 'move', sourceHandle: 'body' },
            { id: 'e3', source: 'loop', target: 'end', sourceHandle: 'next' },
          ],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
