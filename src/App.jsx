import { useState, useEffect, useRef } from 'react';

const App = () => {
  // Инициализация Telegram WebApp
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.expand();
    tg.ready();
  }

  // Состояние игры
  const [plantStage, setPlantStage] = useState('seed'); // seed, sprout, buds, bloom
  const [lastWatered, setLastWatered] = useState(Date.now());
  const [lastTrimmed, setLastTrimmed] = useState(Date.now());
  const [wilted, setWilted] = useState(false);
  const [potType, setPotType] = useState('ceramic'); // ceramic, wood, glass
  const [background, setBackground] = useState('window'); // window, balcony, forest
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const plantRef = useRef(null);

  // Загрузка сохранённого состояния
  useEffect(() => {
    const saved = localStorage.getItem('miniGardenSave');
    if (saved) {
      const data = JSON.parse(saved);
      setPlantStage(data.plantStage || 'seed');
      setLastWatered(data.lastWatered || Date.now());
      setLastTrimmed(data.lastTrimmed || Date.now());
      setPotType(data.potType || 'ceramic');
      setBackground(data.background || 'window');
      setIsMuted(data.isMuted || false);
      setPosition(data.position || { x: 0, y: 0 });
    }
  }, []);

  // Сохранение при изменении
  useEffect(() => {
    const data = {
      plantStage,
      lastWatered,
      lastTrimmed,
      potType,
      background,
      isMuted,
      position,
    };
    localStorage.setItem('miniGardenSave', JSON.stringify(data));
  }, [plantStage, lastWatered, lastTrimmed, potType, background, isMuted, position]);

  // Обновление состояния растения
  useEffect(() => {
    const now = Date.now();
    const timeSinceWatered = now - lastWatered;

    if (timeSinceWatered > 2 * 24 * 60 * 60 * 1000) {
      setWilted(true);
    } else {
      setWilted(false);
    }

    if (timeSinceWatered > 24 * 60 * 60 * 1000) {
      if (plantStage === 'seed') setPlantStage('sprout');
      if (plantStage === 'sprout') setPlantStage('buds');
      if (plantStage === 'buds') setPlantStage('bloom');
    }
  }, [lastWatered, plantStage]);

  // Действия
  const handleWater = () => {
    setLastWatered(Date.now());
    if (!isMuted) playWaterSound();
  };

  const handleTrim = () => {
    setLastTrimmed(Date.now());
    if (!isMuted) playTrimSound();
  };

  const playWaterSound = () => {
    // Визуальная анимация вместо звука
    const audio = new Audio();
    audio.src = '#';
    audio.play().catch(() => {});
  };

  const playTrimSound = () => {
    const audio = new Audio();
    audio.src = '#';
    audio.play().catch(() => {});
  };

  // Перетаскивание горшка
  const startDrag = (e) => {
    if (!plantRef.current) return;
    setIsDragging(true);
    const rect = plantRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  // Фон
  const bgClasses = {
    window: 'bg-gradient-to-b from-sky-100 to-blue-50',
    balcony: 'bg-gradient-to-b from-green-50 to-amber-50',
    forest: 'bg-gradient-to-b from-emerald-50 to-lime-50',
  };

  // Горшок
  const potClasses = {
    ceramic: 'bg-amber-700',
    wood: 'bg-amber-800',
    glass: 'bg-blue-100',
  };

  // Растение
  const renderPlant = () => {
    const wiltClass = wilted ? 'opacity-70' : '';
    const tiltClass = isDragging ? 'rotate-6' : '';

    switch (plantStage) {
      case 'seed':
        return <div className={`w-6 h-6 rounded-full bg-amber-600 ${wiltClass}`}></div>;
      case 'sprout':
        return (
          <div className={`flex flex-col items-center ${wiltClass} ${tiltClass}`}>
            <div className="w-1 h-12 bg-green-600 mb-1"></div>
            <div className="w-6 h-6 rounded-full bg-green-500"></div>
          </div>
        );
      case 'buds':
        return (
          <div className={`flex flex-col items-center ${wiltClass} ${tiltClass}`}>
            <div className="w-1 h-16 bg-green-600 mb-1"></div>
            <div className="flex space-x-1">
              <div className="w-4 h-4 rounded-full bg-pink-300"></div>
              <div className="w-4 h-4 rounded-full bg-pink-300"></div>
            </div>
          </div>
        );
      case 'bloom':
        return (
          <div className={`flex flex-col items-center ${wiltClass} ${tiltClass}`}>
            <div className="w-1 h-18 bg-green-600 mb-1"></div>
            <div className="flex space-x-1">
              <div className="w-5 h-5 rounded-full bg-pink-400"></div>
              <div className="w-5 h-5 rounded-full bg-pink-400"></div>
              <div className="w-5 h-5 rounded-full bg-pink-400"></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`h-screen w-full ${bgClasses[background]} flex flex-col overflow-hidden relative`}
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchMove={(e) => {
        if (isDragging) {
          const touch = e.touches[0];
          setPosition({
            x: touch.clientX - offset.x,
            y: touch.clientY - offset.y,
          });
        }
      }}
      onTouchEnd={stopDrag}
    >
      {/* Горшок с растением */}
      <div
        ref={plantRef}
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-move z-10"
        style={{ left: position.x, top: position.y }}
        onMouseDown={startDrag}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          startDrag({ clientX: touch.clientX, clientY: touch.clientY });
        }}
      >
        <div className={`w-24 h-24 rounded-b-full ${potClasses[potType]} flex justify-center items-end pb-4`}>
          {renderPlant()}
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-6 z-20">
        <button
          onClick={handleWater}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 px-6 rounded-full shadow-md transition-all"
        >
          💧 Полить
        </button>
        <button
          onClick={handleTrim}
          className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 px-6 rounded-full shadow-md transition-all"
        >
          ✂️ Обрезать
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-full shadow-md transition-all"
        >
          {isMuted ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Меню смены фона и горшка */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2 z-20">
        <select
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          className="bg-white/70 rounded-full px-3 py-1 text-sm"
        >
          <option value="window">Окно</option>
          <option value="balcony">Балкон</option>
          <option value="forest">Лес</option>
        </select>
        <select
          value={potType}
          onChange={(e) => setPotType(e.target.value)}
          className="bg-white/70 rounded-full px-3 py-1 text-sm"
        >
          <option value="ceramic">Керамика</option>
          <option value="wood">Дерево</option>
          <option value="glass">Стекло</option>
        </select>
      </div>
    </div>
  );
};

export default App;