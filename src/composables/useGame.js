import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useGame() {
  const temperature = ref(80)
  const heat = ref(50)
  const wood = ref(10)
  const food = ref(5)
  const hide = ref(0)
  const tools = ref(0)
  const isDay = ref(true)
  const dayCount = ref(1)
  const isBlizzard = ref(false)
  const gameOver = ref(false)
  const gameOverReason = ref('')
  const actionLog = ref([])
  const isDying = ref(false)
  const rescueCountdown = ref(15)

  const DAY_DURATION = 30000
  const NIGHT_DURATION = 20000
  const HEAT_CONSUMPTION_RATE = 2
  const BLIZZARD_CHANCE = 0.15
  const DYING_THRESHOLD = 25
  const RESCUE_SUCCESS_TEMP = 40
  const RESCUE_DURATION = 15

  let dayNightTimer = null
  let nightConsumptionTimer = null
  let autoSaveTimer = null
  let rescueTimer = null

  const isNight = computed(() => !isDay.value)
  const isDanger = computed(() => temperature.value < 30)
  const canMakeFire = computed(() => wood.value >= 3)
  const canHunt = computed(() => tools.value > 0)
  const huntSuccessRate = computed(() => 0.3 + tools.value * 0.15)

  function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    actionLog.value.unshift({ message, type, timestamp })
    if (actionLog.value.length > 20) {
      actionLog.value.pop()
    }
  }

  function checkGameOver() {
    if (gameOver.value) return

    if (temperature.value <= 0) {
      if (isDying.value) {
        endDyingPhase(false)
      } else {
        startDyingPhase()
      }
      return
    }

    if (temperature.value <= DYING_THRESHOLD && !isDying.value) {
      startDyingPhase()
    }

    if (temperature.value >= 100) {
      temperature.value = 100
    }
  }

  function startDyingPhase() {
    if (isDying.value || gameOver.value) return

    isDying.value = true
    rescueCountdown.value = RESCUE_DURATION

    stopTimers()

    addLog('⚠️ 你陷入了濒死状态！快用库存资源抢救自己！', 'danger')

    rescueTimer = setInterval(() => {
      if (!isDying.value) {
        clearInterval(rescueTimer)
        rescueTimer = null
        return
      }

      rescueCountdown.value--
      temperature.value = Math.max(0, temperature.value - 1)

      if (temperature.value <= 0) {
        endDyingPhase(false)
        return
      }

      if (rescueCountdown.value <= 0) {
        endDyingPhase(false)
      }
    }, 1000)
  }

  function endDyingPhase(success) {
    if (rescueTimer) {
      clearInterval(rescueTimer)
      rescueTimer = null
    }

    if (!isDying.value) return
    isDying.value = false

    if (success) {
      addLog('🎉 抢救成功！你从鬼门关回来了！', 'success')
      resumeGame()
    } else {
      gameOver.value = true
      gameOverReason.value = '抢救失败，你在严寒中永远闭上了眼睛...'
      addLog('游戏结束：抢救失败！', 'danger')
    }
  }

  function resumeGame() {
    startTimers()
    if (!isDay.value && !nightConsumptionTimer) {
      nightConsumptionTimer = setInterval(() => {
        consumeHeat()
      }, 1000)
    }
  }

  function rescueMakeFire() {
    if (!isDying.value || wood.value < 3) {
      addLog('木头不足，无法生火抢救！', 'warning')
      return false
    }
    wood.value -= 3
    const heatGained = Math.floor(Math.random() * 15) + 20
    heat.value = Math.min(100, heat.value + heatGained)
    const tempGained = Math.floor(Math.random() * 8) + 12
    temperature.value = Math.min(100, temperature.value + tempGained)
    addLog(`🔥 紧急生火：+${heatGained}热量，+${tempGained}体温`, 'success')
    checkRescueSuccess()
    return true
  }

  function rescueEatFood() {
    if (!isDying.value || food.value < 1) {
      addLog('没有食物可吃！', 'warning')
      return false
    }
    food.value -= 1
    const tempGained = Math.floor(Math.random() * 8) + 8
    temperature.value = Math.min(100, temperature.value + tempGained)
    addLog(`🍖 紧急进食：+${tempGained}体温`, 'success')
    checkRescueSuccess()
    return true
  }

  function rescueUseHide() {
    if (!isDying.value || hide.value < 1) {
      addLog('没有兽皮可用！', 'warning')
      return false
    }
    hide.value -= 1
    const tempGained = Math.floor(Math.random() * 6) + 6
    temperature.value = Math.min(100, temperature.value + tempGained)
    addLog(`🦊 用兽皮裹身：+${tempGained}体温`, 'success')
    checkRescueSuccess()
    return true
  }

  function rescueUseTools() {
    if (!isDying.value || tools.value < 1) {
      addLog('没有工具可用！', 'warning')
      return false
    }
    tools.value -= 1
    const heatGained = Math.floor(Math.random() * 10) + 10
    heat.value = Math.min(100, heat.value + heatGained)
    const tempGained = Math.floor(Math.random() * 10) + 10
    temperature.value = Math.min(100, temperature.value + tempGained)
    addLog(`🔧 工具急救：+${heatGained}热量，+${tempGained}体温`, 'success')
    checkRescueSuccess()
    return true
  }

  function checkRescueSuccess() {
    if (temperature.value >= RESCUE_SUCCESS_TEMP) {
      endDyingPhase(true)
    }
  }

  function consumeHeat() {
    if (gameOver.value || isDying.value) return
    
    const multiplier = isBlizzard.value ? 2 : 1
    const consumption = HEAT_CONSUMPTION_RATE * multiplier
    
    if (heat.value >= consumption) {
      heat.value -= consumption
      if (temperature.value < 80) {
        temperature.value = Math.min(80, temperature.value + 1)
      }
    } else {
      heat.value = 0
      temperature.value = Math.max(0, temperature.value - consumption)
      addLog('热量不足！体温正在下降...', 'warning')
    }
    
    checkGameOver()
  }

  function startNightCycle() {
    addLog(`夜幕降临，第 ${dayCount.value} 天结束`, 'info')
    nightConsumptionTimer = setInterval(() => {
      consumeHeat()
    }, 1000)
    
    if (Math.random() < BLIZZARD_CHANCE) {
      triggerBlizzard()
    }
  }

  function startDayCycle() {
    dayCount.value++
    addLog(`天亮了，第 ${dayCount.value} 天开始`, 'success')
    isBlizzard.value = false
    if (nightConsumptionTimer) {
      clearInterval(nightConsumptionTimer)
      nightConsumptionTimer = null
    }
  }

  function toggleDayNight() {
    isDay.value = !isDay.value
    if (isDay.value) {
      startDayCycle()
    } else {
      startNightCycle()
    }
  }

  function triggerBlizzard() {
    isBlizzard.value = true
    addLog('⚠️ 暴风雪来袭！所有消耗加倍！', 'danger')
  }

  function chopWood() {
    if (gameOver.value || isDying.value || isNight.value) return
    
    const multiplier = isBlizzard.value ? 2 : 1
    const tempCost = 5 * multiplier
    
    temperature.value = Math.max(0, temperature.value - tempCost)
    const woodGained = Math.floor(Math.random() * 3) + 2
    wood.value += woodGained
    
    addLog(`砍柴：获得 ${woodGained} 木头，消耗 ${tempCost} 体温`, 'action')
    
    if (Math.random() < BLIZZARD_CHANCE * 0.5) {
      triggerBlizzard()
    }
    
    checkGameOver()
  }

  function hunt() {
    if (gameOver.value || isDying.value || isNight.value) return
    
    const multiplier = isBlizzard.value ? 2 : 1
    const tempCost = 8 * multiplier
    
    temperature.value = Math.max(0, temperature.value - tempCost)
    
    if (Math.random() < huntSuccessRate.value) {
      const foodGained = Math.floor(Math.random() * 3) + 2
      const hideGained = Math.floor(Math.random() * 2) + 1
      food.value += foodGained
      hide.value += hideGained
      addLog(`狩猎成功：获得 ${foodGained} 食物，${hideGained} 兽皮，消耗 ${tempCost} 体温`, 'success')
    } else {
      addLog(`狩猎失败：消耗 ${tempCost} 体温，空手而归`, 'warning')
    }
    
    if (Math.random() < BLIZZARD_CHANCE * 0.5) {
      triggerBlizzard()
    }
    
    checkGameOver()
  }

  function makeTools() {
    if (gameOver.value || isDying.value || isNight.value) return
    if (wood.value < 2 || hide.value < 1) {
      addLog('材料不足：需要 2 木头和 1 兽皮', 'warning')
      return
    }
    
    const multiplier = isBlizzard.value ? 2 : 1
    const tempCost = 6 * multiplier
    
    wood.value -= 2
    hide.value -= 1
    tools.value += 1
    temperature.value = Math.max(0, temperature.value - tempCost)
    
    addLog(`制作工具：获得 1 工具，消耗 ${tempCost} 体温`, 'success')
    checkGameOver()
  }

  function makeFire() {
    if (gameOver.value || isDying.value || !canMakeFire.value) {
      addLog('木头不足：生火需要 3 木头', 'warning')
      return
    }
    
    wood.value -= 3
    const heatGained = Math.floor(Math.random() * 20) + 25
    heat.value = Math.min(100, heat.value + heatGained)
    temperature.value = Math.min(100, temperature.value + 10)
    
    addLog(`生火：获得 ${heatGained} 热量，体温上升 10`, 'success')
  }

  function eatFood() {
    if (gameOver.value || isDying.value || food.value < 1) {
      addLog('没有食物了！', 'warning')
      return
    }
    
    food.value -= 1
    const tempGained = Math.floor(Math.random() * 10) + 5
    temperature.value = Math.min(100, temperature.value + tempGained)
    
    addLog(`进食：体温恢复 ${tempGained}`, 'success')
  }

  function startTimers() {
    dayNightTimer = setInterval(() => {
      toggleDayNight()
    }, isDay.value ? DAY_DURATION : NIGHT_DURATION)
    
    autoSaveTimer = setInterval(() => {
      saveGame('auto')
    }, 10000)
  }

  function stopTimers() {
    if (dayNightTimer) {
      clearInterval(dayNightTimer)
      dayNightTimer = null
    }
    if (nightConsumptionTimer) {
      clearInterval(nightConsumptionTimer)
      nightConsumptionTimer = null
    }
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
    if (rescueTimer) {
      clearInterval(rescueTimer)
      rescueTimer = null
    }
  }

  function saveGame(slot = 'manual') {
    const gameState = {
      temperature: temperature.value,
      heat: heat.value,
      wood: wood.value,
      food: food.value,
      hide: hide.value,
      tools: tools.value,
      isDay: isDay.value,
      dayCount: dayCount.value,
      isBlizzard: isBlizzard.value,
      savedAt: Date.now()
    }
    localStorage.setItem(`snowSurvival_${slot}`, JSON.stringify(gameState))
    addLog(`游戏已保存到存档位：${slot === 'auto' ? '自动存档' : slot}`, 'info')
  }

  function loadGame(slot = 'auto') {
    const saved = localStorage.getItem(`snowSurvival_${slot}`)
    if (!saved) {
      addLog('没有找到存档', 'warning')
      return false
    }
    
    try {
      const gameState = JSON.parse(saved)
      temperature.value = gameState.temperature
      heat.value = gameState.heat
      wood.value = gameState.wood
      food.value = gameState.food
      hide.value = gameState.hide
      tools.value = gameState.tools
      isDay.value = gameState.isDay
      dayCount.value = gameState.dayCount
      isBlizzard.value = gameState.isBlizzard
      gameOver.value = false
      gameOverReason.value = ''
      isDying.value = false
      rescueCountdown.value = RESCUE_DURATION
      actionLog.value = []
      
      stopTimers()
      startTimers()
      
      if (!isDay.value) {
        startNightCycle()
      }
      
      addLog(`成功加载存档：${slot === 'auto' ? '自动存档' : slot}`, 'success')
      return true
    } catch (e) {
      addLog('存档损坏，无法加载', 'danger')
      return false
    }
  }

  function getSaveSlots() {
    const slots = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('snowSurvival_')) {
        const slotName = key.replace('snowSurvival_', '')
        try {
          const data = JSON.parse(localStorage.getItem(key))
          slots.push({
            name: slotName,
            dayCount: data.dayCount,
            savedAt: data.savedAt
          })
        } catch (e) {}
      }
    }
    return slots
  }

  function deleteSave(slot) {
    localStorage.removeItem(`snowSurvival_${slot}`)
    addLog(`已删除存档：${slot}`, 'info')
  }

  function restartGame() {
    temperature.value = 80
    heat.value = 50
    wood.value = 10
    food.value = 5
    hide.value = 0
    tools.value = 0
    isDay.value = true
    dayCount.value = 1
    isBlizzard.value = false
    gameOver.value = false
    gameOverReason.value = ''
    isDying.value = false
    rescueCountdown.value = RESCUE_DURATION
    actionLog.value = []
    
    stopTimers()
    startTimers()
    
    addLog('新游戏开始！祝你好运！', 'success')
  }

  onMounted(() => {
    startTimers()
    addLog('欢迎来到雪地生存！白天收集资源，夜晚保持温暖。', 'info')
  })

  onUnmounted(() => {
    stopTimers()
  })

  return {
    temperature,
    heat,
    wood,
    food,
    hide,
    tools,
    isDay,
    isNight,
    dayCount,
    isBlizzard,
    gameOver,
    gameOverReason,
    actionLog,
    isDanger,
    isDying,
    rescueCountdown,
    canMakeFire,
    canHunt,
    huntSuccessRate,
    chopWood,
    hunt,
    makeTools,
    makeFire,
    eatFood,
    rescueMakeFire,
    rescueEatFood,
    rescueUseHide,
    rescueUseTools,
    saveGame,
    loadGame,
    getSaveSlots,
    deleteSave,
    restartGame
  }
}
