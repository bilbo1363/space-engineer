import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { useGameFlowStore } from '../../store/useGameFlowStore';
import { Direction } from '../../types/nodes';

export const GameScene = () => {
  const { robotState } = useGameStore();
  const { mission } = useGameFlowStore();
  const [updateCounter, setUpdateCounter] = useState(0);
  
  // Обновляем счётчик при изменении robotState для форсирования ре-рендера
  useEffect(() => {
    console.log('🔄 GameScene: robotState изменился, обновляем счётчик', robotState);
    setUpdateCounter(prev => prev + 1);
  }, [robotState]);

  if (!mission) return null;

  const gridSize = mission.grid;
  
  // Создаем ключ для обновления объектов при изменении состояния
  const stateKey = `${robotState.position.join('-')}-${robotState.direction}-${updateCounter}`;

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        {/* Камера */}
        <PerspectiveCamera makeDefault position={[gridSize.width * 0.8, gridSize.height * 1.2, gridSize.width * 0.8]} fov={60} />
        
        {/* Освещение */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} />

        {/* Сетка игрового поля */}
        <Grid
          args={[gridSize.width, gridSize.height]}
          cellSize={1}
          cellThickness={1}
          cellColor="#00FFFF"
          sectionSize={Math.max(gridSize.width, gridSize.height)}
          sectionThickness={1.5}
          sectionColor="#FF8C00"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
          position={[(gridSize.width - 1) / 2, 0, (gridSize.height - 1) / 2]}
        />

        {/* Пол */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[(gridSize.width - 1) / 2, -0.01, (gridSize.height - 1) / 2]}>
          <planeGeometry args={[gridSize.width, gridSize.height]} />
          <meshStandardMaterial color="#0A0E2E" />
        </mesh>

        {/* Визуальные границы поля (стены) */}
        {/* Северная стена (y = -0.5) */}
        <mesh position={[(gridSize.width - 1) / 2, 0.5, -0.5]} castShadow>
          <boxGeometry args={[gridSize.width, 1, 0.1]} />
          <meshStandardMaterial color="#FF0000" transparent opacity={0.3} />
        </mesh>
        
        {/* Южная стена (y = height - 0.5) */}
        <mesh position={[(gridSize.width - 1) / 2, 0.5, gridSize.height - 0.5]} castShadow>
          <boxGeometry args={[gridSize.width, 1, 0.1]} />
          <meshStandardMaterial color="#FF0000" transparent opacity={0.3} />
        </mesh>
        
        {/* Западная стена (x = -0.5) */}
        <mesh position={[-0.5, 0.5, (gridSize.height - 1) / 2]} castShadow>
          <boxGeometry args={[0.1, 1, gridSize.height]} />
          <meshStandardMaterial color="#FF0000" transparent opacity={0.3} />
        </mesh>
        
        {/* Восточная стена (x = width - 0.5) */}
        <mesh position={[gridSize.width - 0.5, 0.5, (gridSize.height - 1) / 2]} castShadow>
          <boxGeometry args={[0.1, 1, gridSize.height]} />
          <meshStandardMaterial color="#FF0000" transparent opacity={0.3} />
        </mesh>

        {/* Робот */}
        <Robot
          position={robotState.position}
          direction={robotState.direction}
        />

        {/* Препятствия и объекты миссии */}
        {mission.objects.map((obj, index) => (
          <GameObject key={`${index}-${stateKey}`} object={obj} />
        ))}

        {/* Управление камерой */}
        <OrbitControls
          target={[(gridSize.width - 1) / 2, 0, (gridSize.height - 1) / 2]}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
};

// Компонент для отображения объектов миссии
const GameObject = ({ object }: { object: any }) => {
  const [x, z] = object.position;
  
  // Центрируем объекты на клетках
  const position: [number, number, number] = [x + 0.5, 0.5, z + 0.5];

  switch (object.type) {
    case 'obstacle':
      // Если это дверь, показываем её состояние
      if (object.properties?.isDoor) {
        const isOpen = object.properties.isOpen;
        console.log('🚪 GameObject рендерит дверь:', { 
          position: object.position, 
          isOpen, 
          properties: object.properties 
        });
        return (
          <mesh position={position} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[0.8, 1.5, 0.2]} />
            <meshStandardMaterial 
              color={isOpen ? "#00FF00" : "#FF0000"}
              transparent={isOpen}
              opacity={isOpen ? 0.3 : 1}
              emissive={isOpen ? "#00FF00" : "#FF0000"}
              emissiveIntensity={isOpen ? 0.5 : 0.2}
            />
          </mesh>
        );
      }
      
      // Обычное препятствие
      return (
        <mesh position={position} castShadow>
          <boxGeometry args={[0.8, 1, 0.8]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      );
    
    case 'goal':
      return (
        <mesh position={position}>
          <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
          <meshStandardMaterial color="#4CAF50" emissive="#4CAF50" emissiveIntensity={0.5} />
        </mesh>
      );
    
    case 'container':
      return (
        <mesh position={position} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#FF8C00" />
        </mesh>
      );
    
    case 'base':
      return (
        <mesh position={position}>
          <cylinderGeometry args={[0.7, 0.7, 0.3, 6]} />
          <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.3} />
        </mesh>
      );
    
    case 'resource':
      return (
        <mesh position={position}>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      );
    
    case 'station':
      // Маяк/станция - светящийся кристалл на подставке
      const isActivated = object.properties?.activated;
      return (
        <group position={position}>
          {/* Подставка */}
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 0.2, 8]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
          {/* Кристалл */}
          <mesh position={[0, 0.2, 0]}>
            <octahedronGeometry args={[0.4]} />
            <meshStandardMaterial 
              color={isActivated ? "#00FF00" : "#FF8C00"}
              emissive={isActivated ? "#00FF00" : "#FF8C00"}
              emissiveIntensity={isActivated ? 1 : 0.5}
            />
          </mesh>
          {/* Световой луч если активирован */}
          {isActivated && (
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.1, 0.05, 2, 8]} />
              <meshStandardMaterial 
                color="#00FF00"
                transparent
                opacity={0.5}
                emissive="#00FF00"
                emissiveIntensity={0.8}
              />
            </mesh>
          )}
        </group>
      );
    
    default:
      return null;
  }
};

// Компонент робота с анимацией
interface RobotProps {
  position: [number, number];
  direction: Direction;
}

const Robot = ({ position, direction }: RobotProps) => {
  const groupRef = useRef<Group>(null);
  const targetPosition = useRef(new Vector3());
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  // Конвертация направления в угол поворота
  const directionToRotation = (dir: Direction): number => {
    switch (dir) {
      case 'north': return 0;
      case 'east': return -Math.PI / 2;
      case 'south': return Math.PI;
      case 'west': return Math.PI / 2;
    }
  };

  // Обновление целевой позиции и поворота при изменении props
  useEffect(() => {
    const [x, z] = position;
    targetPosition.current.set(x + 0.5, 0.5, z + 0.5);
    targetRotation.current = directionToRotation(direction);
  }, [position, direction]);

  // Плавная анимация движения и поворота
  useFrame(() => {
    if (!groupRef.current) return;

    // Плавное движение к целевой позиции
    groupRef.current.position.lerp(targetPosition.current, 0.1);

    // Плавный поворот к целевому углу
    const rotationDiff = targetRotation.current - currentRotation.current;
    
    // Нормализация разницы углов
    let normalizedDiff = rotationDiff;
    if (Math.abs(rotationDiff) > Math.PI) {
      normalizedDiff = rotationDiff > 0 
        ? rotationDiff - 2 * Math.PI 
        : rotationDiff + 2 * Math.PI;
    }

    currentRotation.current += normalizedDiff * 0.1;
    groupRef.current.rotation.y = currentRotation.current;
  });

  return (
    <group ref={groupRef}>
      {/* Тело робота */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#2196F3" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Голова/антенна */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.5} />
      </mesh>

      {/* Индикатор направления (конус спереди) */}
      <mesh castShadow position={[0, 0, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>

      {/* Колеса */}
      <mesh castShadow position={[-0.25, -0.2, 0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[0.25, -0.2, 0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[-0.25, -0.2, -0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[0.25, -0.2, -0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Световые индикаторы (глаза) - перемещены к конусу */}
      <mesh position={[0.15, 0.1, -0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-0.15, 0.1, -0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};
