<template>
  <div>
    <header>
      <h1>Лабораторная работа #4</h1>
      <table class="header-table">
        <tbody>
        <tr>
          <td class="left">
            <img :src="duck2" class="duck" alt="duck left"/>
          </td>

          <td>
            <p>Выполнил: Кузьмин Дмитрий Анатольевич</p>
            <p>Группа: P3209</p>
            <p>Номер варианта: 478</p>

            <div style="margin-top: 15px; border-top: 1px solid #d9a066; padding-top: 10px;">
              <span>Пользователь: <strong>{{ user }}</strong></span>
              <br>
              <button @click="logout" class="x-button" style="margin-top: 10px;">Выход</button>
            </div>
          </td>

          <td class="right">
            <img :src="duck1" class="duck" alt="duck right"/>
          </td>
        </tr>
        </tbody>
      </table>
    </header>

    <main>
      <table class="layout-table">
        <tbody>
        <tr>
          <td class="input-panel">
            <div class="input_section">
              <div class="form-row">
                <span class="form-label">X:</span>
                <input type="text" v-model="x" class="y-text-input" placeholder="-3 ... 5" @input="validateX">
                <span v-if="errors.x" class="error-messages" style="font-size: 12px; margin-left: 10px">{{ errors.x }}</span>
              </div>

              <div class="form-row">
                <span class="form-label">Y:</span>
                <input type="text" v-model="y" class="y-text-input" placeholder="-5 ... 3" @input="validateY">
                <span v-if="errors.y" class="error-messages" style="font-size: 12px; margin-left: 10px">{{ errors.y }}</span>
              </div>

              <div class="form-row">
                <span class="form-label">R:</span>
                <input type="text" v-model="r" class="y-text-input" placeholder="-3 ... 5" @input="validateR">
                <span v-if="errors.r" class="error-messages" style="font-size: 12px; margin-left: 10px">{{ errors.r }}</span>
              </div>

              <div class="form-row">
                <button @click="submitPoint" class="submit-button" :disabled="!isValid">Отправить</button>
              </div>
            </div>
          </td>

          <td class="graph-panel">
            <!-- Добавлен position: relative для позиционирования уведомления внутри -->
            <div class="canvas-container" @click="handleGraphClick" style="position: relative;">
              <canvas ref="graphCanvas" width="400" height="400" id="graph-canvas"></canvas>

              <!-- НОВОЕ: Всплывающее уведомление вместо alert -->
              <transition name="fade">
                <div v-if="toast.show" class="graph-toast">
                  {{ toast.message }}
                </div>
              </transition>
            </div>
          </td>
        </tr>
        </tbody>
      </table>

      <section class="results_section">
        <div class="table-container">
          <table class="results-table">
            <thead>
            <tr>
              <th>X</th>
              <th>Y</th>
              <th>R</th>
              <th>Результат</th>
              <th>Время</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="p in points" :key="p.externalId || p.id">
              <td>{{ p.x }}</td>
              <td>{{ p.y }}</td>
              <td>{{ p.r }}</td>
              <td :class="p.result ? 'hit-result' : 'miss-result'">{{ p.result ? 'Попадание' : 'Промах' }}</td>
              <td>{{ new Date(p.executedAt).toLocaleTimeString() }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';
import { savePointLocal, getAllPointsLocal, saveAllPointsLocal, incLamport, clearLocalDB } from '../services/db';

import duck1 from '../assets/img/duck_without_background_1.png';
import duck2 from '../assets/img/duck_without_background_2.png';

const router = useRouter();
const user = localStorage.getItem('username');
const nodeId = uuidv4();

const x = ref('');
const y = ref('');
const r = ref('');
const points = ref([]);
const errors = ref({ x: '', y: '', r: '' });
const graphCanvas = ref(null);

// НОВОЕ: Состояние для всплывающего уведомления
const toast = ref({
  show: false,
  message: ''
});

const isOffline = ref(!navigator.onLine);

const api = axios.create({
  baseURL: 'http://localhost:8080/api/points',
  headers: { 'Authorization': 'Basic ' + localStorage.getItem('auth_token') }
});

// НОВОЕ: Функция для показа уведомления
const showErrorToast = (message) => {
  toast.value = { show: true, message };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000); // Скрыть через 3 секунды
};

const validateNumber = (val, min, max) => {
  const num = parseFloat(val.replace(',', '.'));
  if (isNaN(num)) return "Не число";
  if (num < min || num > max) return `Диапазон: ${min} ... ${max}`;
  return "";
};

const validateX = () => errors.value.x = validateNumber(x.value, -3, 5);
const validateY = () => errors.value.y = validateNumber(y.value, -5, 3);
const validateR = () => {
  errors.value.r = validateNumber(r.value, -3, 5);
  drawGraph();
};

const isValid = computed(() => {
  return !errors.value.x && !errors.value.y && !errors.value.r && x.value && y.value && r.value;
});

const checkAreaClient = (x, y, r) => {
  if (r <= 0) return false;
  // 1. Прямоугольник (2 четверть)
  if (x <= 0 && x >= -r && y >= 0 && y <= r/2) return true;

  // 2. Треугольник (3 четверть)
  if (x <= 0 && y <= 0 && (x + y) >= -r) return true;

  // 3. Сектор (4 четверть)
  if (x >= 0 && y <= 0 && (x*x + y*y) <= (r/2)*(r/2)) return true;

  return false;
};

const syncData = async () => {
  if (!navigator.onLine) {
    isOffline.value = true;
    return;
  }
  isOffline.value = false;

  try {
    const localPoints = await getAllPointsLocal();

    const payload = localPoints.map(p => ({
      externalId: p.externalId,
      x: p.x,
      y: p.y,
      r: p.r,
      result: p.result,
      executionTime: p.executionTime || 0,
      lamportTimestamp: p.lamportTimestamp || 0,
      nodeId: p.nodeId
    }));

    const res = await api.post('/sync', payload);
    const mergedPoints = res.data;

    await saveAllPointsLocal(mergedPoints);
    points.value = mergedPoints;

    let maxRemote = 0;
    mergedPoints.forEach(p => {
      const t = p.crdtMeta ? p.crdtMeta.lamport : 0;
      if(t > maxRemote) maxRemote = t;
    });
    await incLamport(maxRemote);

    drawGraph();
  } catch (e) {
    console.error("Sync error:", e);
    if (e.response && e.response.status === 401) logout();
  }
};

const addPointInternal = async (xVal, yVal, rVal) => {
  const timestamp = await incLamport();
  const isHit = checkAreaClient(xVal, yVal, rVal);

  const newPoint = {
    externalId: uuidv4(),
    x: xVal,
    y: yVal,
    r: rVal,
    result: isHit,
    executedAt: new Date().toISOString(),
    executionTime: 0,
    lamportTimestamp: timestamp,
    nodeId: nodeId,
    crdtMeta: { lamport: timestamp, nodeId: nodeId }
  };

  await savePointLocal(newPoint);
  points.value.push(newPoint);
  drawGraph();

  await syncData();
};

const submitPoint = async () => {
  if (!isValid.value) return;
  const X_val = parseFloat(x.value.replace(',', '.'));
  const Y_val = parseFloat(y.value.replace(',', '.'));
  const R_val = parseFloat(r.value.replace(',', '.'));

  await addPointInternal(X_val, Y_val, R_val);
};

// ИЗМЕНЕНО: Обработка клика теперь использует showErrorToast вместо alert
const handleGraphClick = async (event) => {
  const R_val = parseFloat(r.value.replace(',', '.'));

  if (!R_val || R_val <= 0) {
    // ВМЕСТО ALERT
    showErrorToast("Пожалуйста, введите корректный радиус R > 0 для проверки точки!");
    // Опционально подсветим ошибку
    errors.value.r = "Введите R > 0";
    return;
  }

  const rect = graphCanvas.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const width = graphCanvas.value.width;
  const height = graphCanvas.value.height;
  const scale = (width / 2) / 6;

  let graphX = (clickX - width/2) / scale;
  let graphY = (height/2 - clickY) / scale;

  graphX = parseFloat(graphX.toFixed(2));
  graphY = parseFloat(graphY.toFixed(2));

  graphX = Math.min(5, Math.max(-3, graphX));
  graphY = Math.min(3, Math.max(-5, graphY));

  await addPointInternal(graphX, graphY, R_val);
};

const logout = async () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('username');

  try {
    await clearLocalDB();
  } catch(e) { console.error(e); }

  points.value = [];
  router.push('/');
};

const drawGraph = () => {
  const canvas = graphCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const R_val = parseFloat(r.value.replace(',', '.'));
  const validR = !isNaN(R_val) && R_val > 0;

  ctx.clearRect(0, 0, width, height);

  if (validR) {
    ctx.fillStyle = '#4169E1';
    ctx.globalAlpha = 0.5;

    const scale = (width / 2) / 6;
    const centerX = width / 2;
    const centerY = height / 2;
    const rPx = R_val * scale;
    const rHalfPx = (R_val / 2) * scale;

    // 2 четв: Прямоугольник
    ctx.fillRect(centerX - rPx, centerY - rHalfPx, rPx, rHalfPx);

    // 3 четв: Треугольник
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - rPx, centerY);
    ctx.lineTo(centerX, centerY + rPx);
    ctx.closePath();
    ctx.fill();

    // 4 четв: Сектор
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, rHalfPx, 0, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1.0;
  }

  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(0, height/2); ctx.lineTo(width, height/2);
  ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height);
  ctx.stroke();

  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("X", width - 10, height/2 - 5);
  ctx.fillText("Y", width/2 + 5, 10);

  points.value.forEach(p => {
    const scale = (width / 2) / 6;
    const pX = width/2 + p.x * scale;
    const pY = height/2 - p.y * scale;

    ctx.fillStyle = p.result ? '#28a745' : '#dc3545';
    ctx.beginPath();
    ctx.arc(pX, pY, 4, 0, 2*Math.PI);
    ctx.fill();
  });
};

onMounted(async () => {
  points.value = await getAllPointsLocal();
  drawGraph();

  await syncData();

  window.addEventListener('online', syncData);
  window.addEventListener('offline', () => isOffline.value = true);
});
</script>
