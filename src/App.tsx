import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import './index.css';

function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;
  
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a4d6b');
  gradient.addColorStop(0.5, '#0a3d5c');
  gradient.addColorStop(1, '#1a4d6b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#2d5a3d';
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 150 + 80;
    const vertices = Math.floor(Math.random() * 5) + 5;
    
    ctx.beginPath();
    for (let j = 0; j <= vertices; j++) {
      const angle = (j / vertices) * Math.PI * 2;
      const r = size * (0.7 + Math.random() * 0.6);
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.fillStyle = '#3a7a4f';
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 100 + 50;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return new THREE.CanvasTexture(canvas);
}

function createNightTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const citySizes = [15, 8, 5, 3, 1];
  const cityColors = ['#ffff99', '#ffaa00', '#ff8800'];
  
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const sizeIndex = Math.floor(Math.pow(Math.random(), 2) * citySizes.length);
    const size = citySizes[sizeIndex];
    const color = cityColors[Math.floor(Math.random() * cityColors.length)];
    
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8 + Math.random() * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(255, 200, 0, 0)');
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return new THREE.CanvasTexture(canvas);
}

function createNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 50 + 20;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, '#a0a0ff');
    gradient.addColorStop(1, '#808080');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return new THREE.CanvasTexture(canvas);
}

function createCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 50 + 30;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return new THREE.CanvasTexture(canvas);
}

function Earth({ timeOfDay, onEarthClick }: { timeOfDay: number; onEarthClick: () => void }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const nightRef = useRef<THREE.Mesh>(null);
  
  const earthTexture = useMemo(() => createEarthTexture(), []);
  const nightTexture = useMemo(() => createNightTexture(), []);
  const normalMap = useMemo(() => createNormalMap(), []);
  const cloudTexture = useMemo(() => createCloudTexture(), []);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0003 * timeOfDay;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0004 * timeOfDay;
    }
    if (nightRef.current) {
      nightRef.current.rotation.y = earthRef.current?.rotation.y || 0;
    }
  });
  
  return (
    <group onClick={onEarthClick}>
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 256, 256]} />
        <meshStandardMaterial
          map={earthTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      <mesh ref={nightRef}>
        <sphereGeometry args={[2.001, 256, 256]} />
        <meshBasicMaterial
          map={nightTexture}
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
      
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.01, 128, 128]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Moon({ earthPosition }: { earthPosition: THREE.Vector3 }) {
  const moonRef = useRef<THREE.Mesh>(null);
  
  const moonTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#666666';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 30 + 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = '#444444';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 15 + 5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  useFrame((state) => {
    if (moonRef.current) {
      const time = state.clock.elapsedTime * 0.1;
      moonRef.current.position.x = earthPosition.x + Math.cos(time) * 8;
      moonRef.current.position.z = earthPosition.z + Math.sin(time) * 8;
      moonRef.current.position.y = Math.sin(time * 0.5) * 1;
      moonRef.current.rotation.y += 0.001;
    }
  });
  
  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[0.5, 64, 64]} />
      <meshStandardMaterial
        map={moonTexture}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function StarField() {
  const starsRef = useRef<THREE.Points>(null);
  
  const { positions, colors, sizes } = useMemo(() => {
    const count = 15000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const colorChoice = Math.random();
      if (colorChoice > 0.95) {
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      } else if (colorChoice > 0.9) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.6;
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      }
      
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    return { positions, colors, sizes };
  }, []);
  
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00005;
    }
  });
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SurroundingGalaxies() {
  return (
    <>
      <Galaxy position={[15, 8, -25]} scale={0.5} />
      <Galaxy position={[-20, -5, -30]} scale={0.6} />
      <Galaxy position={[10, -10, -35]} scale={0.4} />
      <Galaxy position={[-15, 12, -28]} scale={0.7} />
      <Galaxy position={[25, 0, -40]} scale={0.5} />
      <Galaxy position={[-10, 15, -32]} scale={0.45} />
      <Galaxy position={[5, -15, -38]} scale={0.55} />
      <Galaxy position={[-25, 8, -42]} scale={0.6} />
    </>
  );
}

function ProceduralGalaxies({ zoomLevel }: { zoomLevel: number }) {
  const galaxies = useMemo(() => {
    const count = Math.floor(Math.abs(zoomLevel) / 20) + 8;
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const distance = -50 - (i * 30) - Math.random() * 20;
      const angle = (i * 137.5) * Math.PI / 180;
      const radius = 20 + Math.random() * 30;
      
      result.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 40,
          distance
        ] as [number, number, number],
        scale: 0.4 + Math.random() * 0.8
      });
    }
    
    return result;
  }, [Math.floor(Math.abs(zoomLevel) / 20)]);
  
  return (
    <>
      {galaxies.map((galaxy, i) => (
        <Galaxy key={i} position={galaxy.position} scale={galaxy.scale} />
      ))}
    </>
  );
}

function ProceduralNebulae({ zoomLevel }: { zoomLevel: number }) {
  const nebulae = useMemo(() => {
    const count = Math.floor(Math.abs(zoomLevel) / 30) + 5;
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const distance = -60 - (i * 40) - Math.random() * 25;
      const angle = (i * 222.5) * Math.PI / 180;
      const radius = 15 + Math.random() * 25;
      
      result.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 30,
          distance
        ] as [number, number, number]
      });
    }
    
    return result;
  }, [Math.floor(Math.abs(zoomLevel) / 30)]);
  
  return (
    <>
      {nebulae.map((nebula, i) => (
        <Nebula key={i} position={nebula.position} />
      ))}
    </>
  );
}

function ProceduralPlanets({ zoomLevel }: { zoomLevel: number }) {
  const planets = useMemo(() => {
    const count = Math.floor(Math.abs(zoomLevel) / 25) + 5;
    const result = [];
    const planetColors = ['#ff6600', '#6666ff', '#ff0066', '#00ff66', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < count; i++) {
      const distance = -30 - (i * 20) - Math.random() * 15;
      const angle = (i * 180) * Math.PI / 180;
      const radius = 10 + Math.random() * 15;
      
      result.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 20,
          distance
        ] as [number, number, number],
        size: 0.5 + Math.random() * 1.5,
        color: planetColors[Math.floor(Math.random() * planetColors.length)],
        rotationSpeed: 0.001 + Math.random() * 0.003
      });
    }
    
    return result;
  }, [Math.floor(Math.abs(zoomLevel) / 25)]);
  
  return (
    <>
      {planets.map((planet, i) => (
        <Planet 
          key={i} 
          position={planet.position} 
          size={planet.size} 
          color={planet.color} 
          rotationSpeed={planet.rotationSpeed} 
        />
      ))}
    </>
  );
}

function Planet({ position, size, color, rotationSpeed }: { position: [number, number, number]; size: number; color: string; rotationSpeed: number }) {
  const planetRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
  });
  
  return (
    <mesh ref={planetRef} position={position}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        roughness={0.8}
      />
    </mesh>
  );
}

function ProceduralBlackHoles({ zoomLevel }: { zoomLevel: number }) {
  const blackHoles = useMemo(() => {
    const count = Math.floor(Math.abs(zoomLevel) / 40) + 2;
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const distance = -60 - (i * 35) - Math.random() * 20;
      const angle = (i * 137.5) * Math.PI / 180; // Golden angle for distribution
      const radius = 15 + Math.random() * 25;
      
      result.push({
        position: [
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 15,
          distance
        ] as [number, number, number],
        size: 1 + Math.random() * 2,
        accretionColor: Math.random() > 0.5 ? '#ff6600' : '#6600ff'
      });
    }
    
    return result;
  }, [Math.floor(Math.abs(zoomLevel) / 40)]);
  
  return (
    <>
      {blackHoles.map((bh, i) => (
        <InfiniteBlackHole 
          key={i} 
          position={bh.position} 
          size={bh.size}
          accretionColor={bh.accretionColor}
        />
      ))}
    </>
  );
}

function InfiniteBlackHole({ position, size, accretionColor }: { position: [number, number, number]; size: number; accretionColor: string }) {
  const blackHoleRef = useRef<THREE.Mesh>(null);
  const accretionRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (accretionRef.current) {
      accretionRef.current.rotation.z += 0.015;
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={blackHoleRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      <mesh ref={accretionRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 3, size * 0.5, 16, 100]} />
        <meshStandardMaterial
          color={accretionColor}
          emissive={accretionColor}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <pointLight position={[0, 0, 0]} intensity={8} color={accretionColor} distance={size * 15} />
    </group>
  );
}

function Galaxy({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const galaxyRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 3 * scale;
      const spinAngle = radius * 5;
      const branchAngle = ((i % 3) / 3) * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
      
      positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      
      const mixedColor = new THREE.Color();
      const innerColor = new THREE.Color('#ff00ff');
      const outerColor = new THREE.Color('#00ffff');
      mixedColor.lerpColors(innerColor, outerColor, radius / (3 * scale));
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    
    return { positions, colors };
  }, [scale]);
  
  useFrame(() => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.0005;
    }
  });
  
  return (
    <points ref={galaxyRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Nebula({ position }: { position: [number, number, number] }) {
  const nebulaRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += 0.0001;
      nebulaRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });
  
  return (
    <mesh ref={nebulaRef} position={position}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshBasicMaterial
        color="#ff00aa"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function BlackHole() {
  const blackHoleRef = useRef<THREE.Mesh>(null);
  const accretionRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (accretionRef.current) {
      accretionRef.current.rotation.z += 0.01;
    }
  });
  
  return (
    <group position={[0, 0, -200]}>
      <mesh ref={blackHoleRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      <mesh ref={accretionRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.5, 16, 100]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff6600"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <pointLight position={[0, 0, 0]} intensity={5} color="#ff6600" distance={20} />
    </group>
  );
}

function WormholeEffect({ active }: { active: boolean }) {
  const wormholeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (wormholeRef.current && active) {
      wormholeRef.current.rotation.z += 0.05;
      wormholeRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.2);
    }
  });
  
  if (!active) return null;
  
  return (
    <mesh ref={wormholeRef}>
      <torusGeometry args={[15, 3, 16, 100]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.3}
        wireframe
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function CameraController({ onZoomChange, autoZoom }: { onZoomChange: (level: number) => void; autoZoom: boolean }) {
  const controlsRef = useRef<any>(null);
  const zoomLevelRef = useRef(0);
  const [deepSpace, setDeepSpace] = useState(false);
  const { camera, gl } = useThree();
  const autoZoomRef = useRef(autoZoom);
  
  useEffect(() => {
    autoZoomRef.current = autoZoom;
  }, [autoZoom]);
  
  useFrame(() => {
    if (autoZoomRef.current) {
      zoomLevelRef.current += 0.3;
      onZoomChange(zoomLevelRef.current);
      
      if (zoomLevelRef.current > 50) {
        setDeepSpace(true);
        if (controlsRef.current) controlsRef.current.enabled = false;
      }
      
      const targetZ = 8 - (zoomLevelRef.current * 2);
      const targetFov = 75 + Math.min((zoomLevelRef.current / 50) * 45, 90);
      
      camera.position.z += (targetZ - camera.position.z) * 0.02;
      camera.position.x += (0 - camera.position.x) * 0.02;
      camera.position.y += (0 - camera.position.y) * 0.02;
      if ('fov' in camera) {
        camera.fov += (targetFov - camera.fov) * 0.02;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(0, 0, targetZ - 50);
    }
  });
  
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || autoZoomRef.current) return;
      
      const delta = event.deltaY * 0.003;
      zoomLevelRef.current = zoomLevelRef.current + delta;
      onZoomChange(zoomLevelRef.current);
      
      if (zoomLevelRef.current > 50) {
        setDeepSpace(true);
        if (controlsRef.current) controlsRef.current.enabled = false;
        
        const targetZ = 8 - (zoomLevelRef.current * 2);
        const targetFov = 75 + Math.min((zoomLevelRef.current / 50) * 45, 90);
        
        gsap.to(camera.position, {
          x: 0,
          y: 0,
          z: targetZ,
          duration: 2,
          ease: 'power2.inOut'
        });
        
        if ('fov' in camera) {
          gsap.to(camera, {
            fov: targetFov,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => camera.updateProjectionMatrix()
          });
        }
      } else if (zoomLevelRef.current < 50 && deepSpace) {
        setDeepSpace(false);
        if (controlsRef.current) controlsRef.current.enabled = true;
        
        gsap.to(camera, {
          fov: 75,
          duration: 1,
          ease: 'power2.out',
          onUpdate: () => camera.updateProjectionMatrix()
        });
      }
    };
    
    gl.domElement.addEventListener('wheel', handleWheel, { passive: true });
    return () => gl.domElement.removeEventListener('wheel', handleWheel);
  }, [camera, gl, onZoomChange, deepSpace]);
  
  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        zoomSpeed={0.8}
        rotateSpeed={0.5}
        enabled={!autoZoom}
      />
      {deepSpace && (
        <>
          <ProceduralGalaxies zoomLevel={zoomLevelRef.current} />
          <ProceduralNebulae zoomLevel={zoomLevelRef.current} />
          <ProceduralPlanets zoomLevel={zoomLevelRef.current} />
          <ProceduralBlackHoles zoomLevel={zoomLevelRef.current} />
          <BlackHole />
          <WormholeEffect active={true} />
        </>
      )}
    </>
  );
}

function Controls({ timeOfDay, onTimeChange, onFullscreen }: { 
  timeOfDay: number; 
  onTimeChange: (val: number) => void;
  onFullscreen: () => void;
}) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '15px 30px',
      borderRadius: '10px',
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 255, 255, 0.3)',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '12px', color: '#00ffff' }}>Rotation Speed</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={timeOfDay}
          onChange={(e) => onTimeChange(parseFloat(e.target.value))}
          style={{ width: '150px', accentColor: '#00ffff' }}
        />
      </div>
      
      <button
        onClick={onFullscreen}
        onMouseEnter={() => playUISound('hover')}
        style={{
          background: 'rgba(0, 255, 255, 0.2)',
          border: '1px solid #00ffff',
          color: '#00ffff',
          padding: '8px 16px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
        }}
      >
        ⛶ Fullscreen
      </button>
    </div>
  );
}

function SoundManager({ autoZoom, zoomLevel }: { autoZoom: boolean; zoomLevel: number }) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sounds, setSounds] = useState<{ [key: string]: { oscillator?: OscillatorNode; gain?: GainNode } }>({});
  
  useEffect(() => {
    // Initialize Web Audio API
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    
    return () => {
      ctx.close();
    };
  }, []);
  
  useEffect(() => {
    if (!audioContext) return;
    
    // Ambient space sound
    const ambientOsc = audioContext.createOscillator();
    const ambientGain = audioContext.createGain();
    ambientOsc.type = 'sine';
    ambientOsc.frequency.setValueAtTime(60, audioContext.currentTime);
    ambientGain.gain.setValueAtTime(0.03, audioContext.currentTime);
    ambientOsc.connect(ambientGain);
    ambientGain.connect(audioContext.destination);
    ambientOsc.start();
    
    // Deep space drone
    const droneOsc = audioContext.createOscillator();
    const droneGain = audioContext.createGain();
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(40, audioContext.currentTime);
    droneGain.gain.setValueAtTime(0.02, audioContext.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(audioContext.destination);
    droneOsc.start();
    
    setSounds({ ambient: { oscillator: ambientOsc, gain: ambientGain }, drone: { oscillator: droneOsc, gain: droneGain } });
    
    return () => {
      ambientOsc.stop();
      droneOsc.stop();
    };
  }, [audioContext]);
  
  useEffect(() => {
    if (!audioContext || !sounds.ambient || !sounds.drone) return;
    
    // Adjust sound based on zoom level
    const intensity = Math.min(Math.abs(zoomLevel) / 100, 1);
    
    if (sounds.ambient.gain) {
      sounds.ambient.gain.gain.setValueAtTime(0.03 + intensity * 0.05, audioContext.currentTime);
    }
    
    if (sounds.drone.gain) {
      sounds.drone.gain.gain.setValueAtTime(0.02 + intensity * 0.08, audioContext.currentTime);
    }
    
    // Change frequency during infinite zoom
    if (autoZoom && sounds.ambient.oscillator) {
      const freq = 60 + Math.sin(zoomLevel * 0.1) * 20;
      sounds.ambient.oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    }
  }, [zoomLevel, autoZoom, audioContext, sounds]);
  
  // Create zoom whoosh sound
  useEffect(() => {
    if (!audioContext || !autoZoom) return;
    
    const whooshOsc = audioContext.createOscillator();
    const whooshGain = audioContext.createGain();
    whooshOsc.type = 'sine';
    whooshOsc.frequency.setValueAtTime(200, audioContext.currentTime);
    whooshOsc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 2);
    whooshGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    whooshOsc.connect(whooshGain);
    whooshGain.connect(audioContext.destination);
    whooshOsc.start();
    whooshOsc.stop(audioContext.currentTime + 2);
    
  }, [autoZoom, audioContext]);
  
  // Black hole proximity sound effect
  useEffect(() => {
    if (!audioContext || zoomLevel < 40) return;
    
    // Create pulsing low frequency for black hole presence
    const pulseOsc = audioContext.createOscillator();
    const pulseGain = audioContext.createGain();
    const pulseLFO = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    pulseOsc.type = 'triangle';
    pulseOsc.frequency.setValueAtTime(30, audioContext.currentTime);
    
    pulseLFO.type = 'sine';
    pulseLFO.frequency.setValueAtTime(0.5, audioContext.currentTime);
    lfoGain.gain.setValueAtTime(0.03, audioContext.currentTime);
    
    pulseLFO.connect(lfoGain);
    lfoGain.connect(pulseGain.gain);
    pulseOsc.connect(pulseGain);
    pulseGain.connect(audioContext.destination);
    
    pulseGain.gain.setValueAtTime(0.04, audioContext.currentTime);
    
    pulseOsc.start();
    pulseLFO.start();
    
    return () => {
      pulseOsc.stop();
      pulseLFO.stop();
    };
  }, [Math.floor(zoomLevel / 40), audioContext]);
  
  return null;
}

function Scene({ timeOfDay, onEarthClick }: { timeOfDay: number; onEarthClick: () => void }) {
  const earthPosition = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 30, 120]} />
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 0, 5]} intensity={2} color="#ffffff" castShadow />
      <pointLight position={[10, 0, 10]} intensity={0.5} color="#00ffff" />
      
      <Earth timeOfDay={timeOfDay} onEarthClick={onEarthClick} />
      <Moon earthPosition={earthPosition} />
      <StarField />
      <SurroundingGalaxies />
      
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// Helper function to play UI sounds
const playUISound = (type: 'click' | 'hover' | 'start') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  if (type === 'click') {
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  } else if (type === 'hover') {
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  } else if (type === 'start') {
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  }
  
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
  
  setTimeout(() => ctx.close(), 500);
};

export default function App() {
  const [timeOfDay, setTimeOfDay] = useState(1);
  const [autoZoom, setAutoZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  
  const handleFullscreen = () => {
    playUISound('click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  
  const handleEarthClick = () => {
    playUISound('start');
    setAutoZoom(true);
  };
  
  const handleStopZoom = () => {
    playUISound('click');
    setAutoZoom(false);
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <Scene timeOfDay={timeOfDay} onEarthClick={handleEarthClick} />
        <CameraController onZoomChange={setZoomLevel} autoZoom={autoZoom} />
        <SoundManager autoZoom={autoZoom} zoomLevel={zoomLevel} />
      </Canvas>
      
      <Controls 
        timeOfDay={timeOfDay} 
        onTimeChange={setTimeOfDay}
        onFullscreen={handleFullscreen}
      />
      
      {autoZoom && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px 30px',
          borderRadius: '10px',
          border: '1px solid rgba(0, 255, 255, 0.5)',
          zIndex: 1000
        }}>
          <div style={{ color: '#00ffff', marginBottom: '10px', fontSize: '14px' }}>
            🚀 Infinite Journey Active - Zoom Level: {Math.floor(zoomLevel)}
          </div>
          <button
            onClick={handleStopZoom}
            onMouseEnter={() => playUISound('hover')}
            style={{
              background: 'rgba(255, 0, 100, 0.3)',
              border: '1px solid #ff0066',
              color: '#ff0066',
              padding: '8px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              width: '100%',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 100, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 100, 0.3)';
            }}
          >
            Stop Journey
          </button>
        </div>
      )}
    </div>
  );
}
