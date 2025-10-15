import { useState, useMemo } from 'react';
import { SchemaManager, SavedSchema } from '../../utils/schemaManager';

interface SchemaManagerPanelProps {
  onLoadSchema: (schema: SavedSchema) => void;
  onClose: () => void;
}

type SortOption = 'name' | 'date' | 'updated' | 'size';
type SortOrder = 'asc' | 'desc';

export const SchemaManagerPanel = ({ onLoadSchema, onClose }: SchemaManagerPanelProps) => {
  const [schemas, setSchemas] = useState<SavedSchema[]>(SchemaManager.getAllSchemas());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Фильтрация и сортировка
  const filteredAndSortedSchemas = useMemo(() => {
    let result = schemas;

    // Поиск
    if (searchQuery) {
      result = SchemaManager.searchSchemas(searchQuery);
    }

    // Сортировка
    result = SchemaManager.sortSchemas(result, sortBy, sortOrder);

    return result;
  }, [schemas, searchQuery, sortBy, sortOrder]);

  const refreshSchemas = () => {
    setSchemas(SchemaManager.getAllSchemas());
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Удалить схему "${name}"?`)) {
      SchemaManager.deleteSchema(id);
      refreshSchemas();
    }
  };

  const handleDuplicate = (id: string) => {
    SchemaManager.duplicateSchema(id);
    refreshSchemas();
  };

  const handleToggleFavorite = (id: string) => {
    SchemaManager.toggleFavorite(id);
    refreshSchemas();
  };

  const handleStartRename = (schema: SavedSchema) => {
    setEditingId(schema.id);
    setEditingName(schema.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      SchemaManager.renameSchema(id, editingName.trim());
      refreshSchemas();
    }
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = (schema: SavedSchema) => {
    SchemaManager.exportToFile(schema);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-deep-blue border-2 border-warning-yellow rounded-lg w-[800px] max-h-[80vh] flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-warning-yellow/30">
          <h2 className="text-xl font-bold text-warning-yellow">📁 Управление схемами</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Панель поиска и сортировки */}
        <div className="p-4 border-b border-warning-yellow/30 space-y-3">
          {/* Поиск */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Поиск схем..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-space-black border border-warning-yellow/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-warning-yellow"
            />
          </div>

          {/* Сортировка */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-400">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1 bg-space-black border border-warning-yellow/30 rounded text-white text-sm focus:outline-none focus:border-warning-yellow"
            >
              <option value="updated">По изменению</option>
              <option value="date">По созданию</option>
              <option value="name">По названию</option>
              <option value="size">По размеру</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 bg-space-black border border-warning-yellow/30 rounded text-white text-sm hover:bg-warning-yellow/10 transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Возр.' : '↓ Убыв.'}
            </button>
            <div className="ml-auto text-sm text-gray-400">
              Найдено: {filteredAndSortedSchemas.length}
            </div>
          </div>
        </div>

        {/* Список схем */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredAndSortedSchemas.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchQuery ? 'Схемы не найдены' : 'Нет сохранённых схем'}
            </div>
          ) : (
            filteredAndSortedSchemas.map((schema) => (
              <div
                key={schema.id}
                className="bg-space-black border border-warning-yellow/30 rounded p-3 hover:border-warning-yellow/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Избранное */}
                  <button
                    onClick={() => handleToggleFavorite(schema.id)}
                    className="text-2xl hover:scale-110 transition-transform"
                    title={schema.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                  >
                    {schema.isFavorite ? '⭐' : '☆'}
                  </button>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    {/* Название */}
                    {editingId === schema.id ? (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(schema.id);
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                          className="flex-1 px-2 py-1 bg-deep-blue border border-warning-yellow rounded text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(schema.id)}
                          className="px-3 py-1 bg-success-green text-white rounded hover:bg-success-green/80"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="px-3 py-1 bg-error-red text-white rounded hover:bg-error-red/80"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-bold text-white mb-1 truncate">
                        {schema.name}
                      </h3>
                    )}

                    {/* Описание */}
                    {schema.description && (
                      <p className="text-sm text-gray-400 mb-2 truncate">
                        {schema.description}
                      </p>
                    )}

                    {/* Метаданные */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>📊 {schema.graph.nodes.length} нодов</span>
                      <span>📅 {formatDate(schema.createdAt)}</span>
                      {schema.updatedAt !== schema.createdAt && (
                        <span>✏️ {formatDate(schema.updatedAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        onLoadSchema(schema);
                        onClose();
                      }}
                      className="px-3 py-1 bg-success-green text-white rounded text-sm hover:bg-success-green/80 transition-colors"
                      title="Загрузить"
                    >
                      📂 Загрузить
                    </button>
                    <button
                      onClick={() => handleStartRename(schema)}
                      className="px-3 py-1 bg-info-blue text-white rounded text-sm hover:bg-info-blue/80 transition-colors"
                      title="Переименовать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDuplicate(schema.id)}
                      className="px-3 py-1 bg-warning-yellow text-space-black rounded text-sm hover:bg-warning-yellow/80 transition-colors"
                      title="Дублировать"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleExport(schema)}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                      title="Экспортировать"
                    >
                      💾
                    </button>
                    <button
                      onClick={() => handleDelete(schema.id, schema.name)}
                      className="px-3 py-1 bg-error-red text-white rounded text-sm hover:bg-error-red/80 transition-colors"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Футер */}
        <div className="p-4 border-t border-warning-yellow/30 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Всего схем: {schemas.length}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-warning-yellow text-space-black rounded font-bold hover:bg-warning-yellow/80 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
