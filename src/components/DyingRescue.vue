<template>
  <div class="dying-overlay">
    <div class="dying-content">
      <div class="heart-icon">❤️‍🔥</div>
      <h2 class="dying-title">濒死抢救</h2>
      <p class="dying-desc">你的体温正在急剧下降！快用库存资源抢救自己！</p>
      
      <div class="countdown-section">
        <div class="countdown-label">剩余时间</div>
        <div class="countdown-value" :class="{ urgent: countdown <= 5 }">
          {{ countdown }} 秒
        </div>
      </div>

      <div class="current-temp">
        <span class="temp-label">当前体温</span>
        <span class="temp-value" :class="{ critical: temperature <= 10 }">
          {{ temperature }}°C
        </span>
        <span class="temp-target">目标: ≥40°C</span>
      </div>

      <div class="inventory-section">
        <h3 class="section-title">可用资源</h3>
        <div class="inventory-grid">
          <div class="inv-item">
            <span class="inv-icon">🪵</span>
            <span class="inv-count">{{ wood }}</span>
          </div>
          <div class="inv-item">
            <span class="inv-icon">🍖</span>
            <span class="inv-count">{{ food }}</span>
          </div>
          <div class="inv-item">
            <span class="inv-icon">🦊</span>
            <span class="inv-count">{{ hide }}</span>
          </div>
          <div class="inv-item">
            <span class="inv-icon">🔧</span>
            <span class="inv-count">{{ tools }}</span>
          </div>
        </div>
      </div>

      <div class="rescue-actions">
        <button 
          class="rescue-btn fire-btn" 
          :class="{ disabled: wood < 3 }"
          @click="$emit('fire')"
        >
          <span class="btn-icon">🔥</span>
          <span class="btn-text">紧急生火</span>
          <span class="btn-cost">-3 🪵</span>
          <span class="btn-effect">+20~35热量, +12~20体温</span>
        </button>
        <button 
          class="rescue-btn food-btn" 
          :class="{ disabled: food < 1 }"
          @click="$emit('eat')"
        >
          <span class="btn-icon">🍖</span>
          <span class="btn-text">紧急进食</span>
          <span class="btn-cost">-1 🍖</span>
          <span class="btn-effect">+8~16体温</span>
        </button>
        <button 
          class="rescue-btn hide-btn" 
          :class="{ disabled: hide < 1 }"
          @click="$emit('hide')"
        >
          <span class="btn-icon">🦊</span>
          <span class="btn-text">兽皮裹身</span>
          <span class="btn-cost">-1 🦊</span>
          <span class="btn-effect">+6~12体温</span>
        </button>
        <button 
          class="rescue-btn tools-btn" 
          :class="{ disabled: tools < 1 }"
          @click="$emit('tools')"
        >
          <span class="btn-icon">🔧</span>
          <span class="btn-text">工具急救</span>
          <span class="btn-cost">-1 🔧</span>
          <span class="btn-effect">+10~20热量, +10~20体温</span>
        </button>
      </div>

      <div class="tip-text">
        💡 提示：体温恢复到 40°C 以上即可抢救成功！
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  countdown: {
    type: Number,
    default: 15
  },
  temperature: {
    type: Number,
    default: 0
  },
  wood: {
    type: Number,
    default: 0
  },
  food: {
    type: Number,
    default: 0
  },
  hide: {
    type: Number,
    default: 0
  },
  tools: {
    type: Number,
    default: 0
  }
})

defineEmits(['fire', 'eat', 'hide', 'tools'])
</script>

<style scoped>
.dying-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(50, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dying-content {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #3d0000, #1a0000);
  border-radius: 20px;
  border: 3px solid rgba(255, 80, 80, 0.6);
  box-shadow: 0 0 60px rgba(255, 50, 50, 0.4);
  animation: shake 0.5s ease infinite;
  max-width: 500px;
  width: 90%;
  max-height: 95vh;
  overflow-y: auto;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.heart-icon {
  font-size: 70px;
  margin-bottom: 15px;
  animation: heartbeat 0.6s infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.dying-title {
  color: #ff4444;
  font-size: 32px;
  margin-bottom: 10px;
  text-shadow: 0 0 20px rgba(255, 50, 50, 0.6);
}

.dying-desc {
  color: rgba(255, 200, 200, 0.9);
  font-size: 15px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.countdown-section {
  margin-bottom: 20px;
}

.countdown-label {
  color: rgba(255, 200, 200, 0.7);
  font-size: 12px;
  margin-bottom: 5px;
}

.countdown-value {
  font-size: 42px;
  font-weight: bold;
  color: #ff6666;
  text-shadow: 0 0 15px rgba(255, 100, 100, 0.5);
}

.countdown-value.urgent {
  color: #ff0000;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.current-temp {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 12px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.temp-label {
  color: rgba(255, 200, 200, 0.7);
  font-size: 13px;
}

.temp-value {
  font-size: 24px;
  font-weight: bold;
  color: #ff8888;
}

.temp-value.critical {
  color: #ff0000;
  animation: pulse 0.4s infinite;
}

.temp-target {
  color: rgba(150, 255, 150, 0.8);
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(0, 100, 0, 0.3);
  border-radius: 6px;
}

.section-title {
  color: rgba(255, 200, 200, 0.8);
  font-size: 14px;
  margin-bottom: 10px;
}

.inventory-section {
  margin-bottom: 20px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.inv-item {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.inv-icon {
  font-size: 24px;
}

.inv-count {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.rescue-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.rescue-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 12px 8px;
  background: linear-gradient(135deg, rgba(255, 100, 100, 0.3), rgba(200, 50, 50, 0.2));
  border: 2px solid rgba(255, 100, 100, 0.5);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.rescue-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 80, 80, 0.4);
  background: linear-gradient(135deg, rgba(255, 120, 120, 0.4), rgba(220, 70, 70, 0.3));
}

.rescue-btn:active:not(.disabled) {
  transform: translateY(0);
}

.rescue-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.6);
}

.btn-icon {
  font-size: 24px;
}

.btn-text {
  font-size: 13px;
  font-weight: bold;
}

.btn-cost {
  font-size: 11px;
  color: rgba(255, 180, 180, 0.9);
}

.btn-effect {
  font-size: 9px;
  color: rgba(200, 255, 200, 0.7);
}

.fire-btn:not(.disabled) {
  border-color: rgba(255, 150, 50, 0.6);
  background: linear-gradient(135deg, rgba(255, 100, 30, 0.35), rgba(200, 50, 0, 0.2));
}

.food-btn:not(.disabled) {
  border-color: rgba(100, 200, 100, 0.6);
  background: linear-gradient(135deg, rgba(50, 180, 80, 0.35), rgba(30, 120, 50, 0.2));
}

.hide-btn:not(.disabled) {
  border-color: rgba(200, 150, 100, 0.6);
  background: linear-gradient(135deg, rgba(180, 130, 80, 0.35), rgba(130, 80, 40, 0.2));
}

.tools-btn:not(.disabled) {
  border-color: rgba(150, 150, 200, 0.6);
  background: linear-gradient(135deg, rgba(120, 120, 180, 0.35), rgba(80, 80, 140, 0.2));
}

.tip-text {
  color: rgba(255, 220, 150, 0.8);
  font-size: 12px;
  background: rgba(100, 70, 0, 0.3);
  padding: 10px 15px;
  border-radius: 8px;
  line-height: 1.5;
}
</style>
