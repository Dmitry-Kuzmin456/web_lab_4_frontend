<template>
  <div>
    <header>
      <h1>Лабораторная работа #4</h1>
      <table class="header-table">
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
      </table>
    </header>

    <main>
      <table class="layout-table">
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
            <div class="canvas-container" @click="handleGraphClick">
              <canvas ref="graphCanvas" width="400" height="400" id="graph-canvas"></canvas>
            </div>
          </td>
        </tr>
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
            <tr v-for="p in points" :key="p.id">
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

import duck1 from '../assets/img/duck_without_background_1.png';
import duck2 from '../assets/img/duck_without_background_2.png';

const router = useRouter();
const user = localStorage.getItem('username');

const x = ref('');
const y = ref('');
const r = ref('');
const points = ref([]);
const errors = ref({ x: '', y: '', r: '' });
const graphCanvas = ref(null);

const api = axios.create({
  baseURL: 'http://localhost:8080/api/points',
  headers: { 'Authorization': 'Basic ' + localStorage.getItem('auth_token') }
});

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
  if (!errors.value.r && parseFloat(r.value) <= 0) {
  }
  drawGraph();
};

const isValid = computed(() => {
  return !errors.value.x && !errors.value.y && !errors.value.r && x.value && y.value && r.value;
});

const loadPoints = async () => {
  try {
    const res = await api.get('');
    points.value = res.data;
    drawGraph();
  } catch (e) {
    if (e.response && e.response.status === 401) logout();
  }
};

const submitPoint = async () => {
  if (!isValid.value) return;
  try {
    const res = await api.post('', {
      x: parseFloat(x.value.replace(',', '.')),
      y: parseFloat(y.value.replace(',', '.')),
      r: parseFloat(r.value.replace(',', '.'))
    });
    points.value.push(res.data);
    drawGraph();
  } catch (e) {
    alert("Ошибка сервера");
  }
};

const logout = () => {
  localStorage.removeItem('auth_token');
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

    ctx.fillRect(centerX - rPx, centerY - rHalfPx, rPx, rHalfPx);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - rPx, centerY);
    ctx.lineTo(centerX, centerY + rPx);
    ctx.closePath();
    ctx.fill();


    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, rHalfPx, 0, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1.0;
  }

  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(0, height/2); ctx.lineTo(width, height/2); // X
  ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height); // Y
  ctx.stroke();

  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("X", width - 10, height/2 - 5);
  ctx.fillText("Y", width/2 + 5, 10);

  points.value.forEach(p => {
    const scale = (width / 2) / 6;

    const clampedX = Math.min(5, Math.max(-3, p.x));
    const clampedY = Math.min(3, Math.max(-5, p.y));
    const pX = width/2 + clampedX * scale;
    const pY = height/2 - clampedY * scale;

    ctx.fillStyle = p.result ? '#28a745' : '#dc3545';
    ctx.beginPath();
    ctx.arc(pX, pY, 4, 0, 2*Math.PI);
    ctx.fill();
  });
};

const handleGraphClick = async (event) => {
  const R = parseFloat(r.value.replace(',', '.'));
  if (!R || R <= 0) {
    alert("Введите корректный радиус R > 0 перед кликом!");
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

  graphX = Math.min(5, Math.max(-3, graphX));
  graphY = Math.min(3, Math.max(-5, graphY));

  graphX = graphX.toFixed(2);
  graphY = graphY.toFixed(2);

  try {
    const res = await api.post('', {
      x: parseFloat(graphX),
      y: parseFloat(graphY),
      r: R
    });
    points.value.push(res.data);
    drawGraph();
  } catch (e) {
    alert("Ошибка при проверке клика");
  }
};

onMounted(() => {
  loadPoints();
  drawGraph();
});
</script>