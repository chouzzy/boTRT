// // src/components/layout/ConnectionsSphere.tsx (ou onde preferir)
// 'use client';

// import React, { useRef, useMemo } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import * as THREE from 'three';

// interface ConnectionsSphereProps {
//   pointCount?: number;
//   sphereRadius?: number;
//   lineThreshold?: number; // Distância máxima para desenhar uma linha
//   pointColor?: string;
//   lineColor?: string;
// }

// export function ConnectionsSphere({
//   pointCount = 100, // Número de pontos na esfera
//   sphereRadius = 2.5, // Raio da esfera invisível onde os pontos se distribuem
//   lineThreshold = 0.8, // Se a distância entre 2 pontos for menor que isso, desenha linha
//   pointColor = '#FF5F5E', // Sua cor de destaque
//   lineColor = '#FF5F5E', // Cor das linhas, pode ser diferente
// }: ConnectionsSphereProps) {
//   const groupRef = useRef<THREE.Group>(null!);

//   // Gera as posições dos pontos aleatoriamente na superfície de uma esfera
//   const points = useMemo(() => {
//     const tempPoints = [];
//     for (let i = 0; i < pointCount; i++) {
//       // Algoritmo para distribuir pontos mais ou menos uniformemente em uma esfera
//       const phi = Math.acos(-1 + (2 * i) / pointCount);
//       const theta = Math.sqrt(pointCount * Math.PI) * phi;

//       const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
//       const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
//       const z = sphereRadius * Math.cos(phi);
//       tempPoints.push(new THREE.Vector3(x, y, z));
//     }
//     return tempPoints;
//   }, [pointCount, sphereRadius]);

//   // Gera os segmentos de linha entre pontos próximos
//   const lineSegments = useMemo(() => {
//     const segments: [THREE.Vector3, THREE.Vector3][] = [];
//     for (let i = 0; i < points.length; i++) {
//       for (let j = i + 1; j < points.length; j++) {
//         const p1 = points[i];
//         const p2 = points[j];
//         const distance = p1.distanceTo(p2);
//         if (distance < lineThreshold) {
//           segments.push([p1, p2]);
//         }
//       }
//     }
//     return segments;
//   }, [points, lineThreshold]);

//   useFrame((state, delta) => {
//     if (groupRef.current) {
//       groupRef.current.rotation.x += delta * 0.05; // Rotação lenta no eixo X
//       groupRef.current.rotation.y += delta * 0.07; // Rotação lenta no eixo Y
//     }
//   });

//   return (
//     <group ref={groupRef}>
//       {/* Renderiza os Pontos */}
//       {points.map((point, i) => (
//         <mesh key={`point-${i}`} position={point}>
//           <sphereGeometry args={[0.03, 8, 8]} /> {/* Esfera pequena para cada ponto */}
//           <meshBasicMaterial color={pointColor} transparent opacity={0.8} />
//         </mesh>
//       ))}

//       {/* Renderiza as Linhas */}
//       {/* Para muitas linhas, LineSegments seria mais performático,
//           mas para um número gerenciável, mapear Line do drei é mais fácil de começar.
//           Se a performance for um problema com muitas linhas, otimize para LineSegments.
//       */}
//       {lineSegments.map((segment, i) => (
//         <line key={`line-${i}`}>
//           <bufferGeometry attach="geometry">
//             <BufferAttribute
//               attach="attributes-position"
//               count={2}
//               array={new Float32Array([...segment[0].toArray(), ...segment[1].toArray()])}
//               itemSize={3}
//             />
//           </bufferGeometry>
//           <lineBasicMaterial
//             color={lineColor}
//             transparent
//             opacity={0.3} // Linhas mais sutis
//             linewidth={1} // Pode não ter efeito em todas as GPUs
//           />
//         </line>
//       ))}
//     </group>
//   );
// }

// // Componente wrapper para o Canvas 3D, para colocar no layout
// export function AnimatedBackground3D() {
//   return (
//     <Canvas
//       camera={{ position: [0, 0, 5], fov: 50 }}
//       style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -10 }}
//       // Adicionar um dpr pode ajudar na performance em telas de alta resolução
//       // dpr={[1, 2]} // Device Pixel Ratio
//     >
//       {/* Luzes - Para meshBasicMaterial dos pontos/linhas, a luz não tem tanto efeito,
//           mas é bom manter se você mudar para materiais que reagem à luz no futuro. */}
//       <ambientLight intensity={0.5} />
//       <directionalLight position={[5, 5, 5]} intensity={0.8} />

//       {/* Esfera de Conexões */}
//       <ConnectionsSphere
//         pointCount={120}      // Ajuste para mais ou menos pontos
//         sphereRadius={2.8}    // Ajuste o tamanho da esfera de distribuição
//         lineThreshold={0.7}   // Ajuste para mais ou menos linhas
//         pointColor="#FF5F5E"  // Sua cor de destaque para os pontos
//         lineColor="#FF8C8B"   // Uma cor talvez um pouco mais sutil para as linhas
//       />


//       {/* <OrbitControls /> // Mantenha comentado para o fundo final */}
//     </Canvas>
//   );
// }
