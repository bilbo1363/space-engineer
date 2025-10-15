import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { Direction } from '../../types/nodes';

interface RobotProps {
  position: [number, number];
  direction: Direction;
}

export const Robot = ({ position, direction }: RobotProps) => {
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
    // Центрируем робота на клетке
    targetPosition.current.set(x, 0.5, z);
    targetRotation.current = directionToRotation(direction);
    console.log(`🤖 3D Robot: позиция [${x}, ${z}], направление: ${direction}, угол: ${targetRotation.current}`);
  }, [position, direction]);

  // Плавная анимация движения и поворота
  useFrame(() => {
    if (!groupRef.current) return;

    // Плавное движение к целевой позиции
    groupRef.current.position.lerp(targetPosition.current, 0.1);

    // Плавный поворот к целевому углу
    const rotationDiff = targetRotation.current - currentRotation.current;
    
    // Нормализация разницы углов (выбираем кратчайший путь)
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
      <mesh castShadow position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>

      {/* Колеса/гусеницы */}
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

      {/* Световой индикатор (глаза) */}
      <mesh position={[0.15, 0.1, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-0.15, 0.1, 0.35]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};
