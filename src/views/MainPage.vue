<template>
  <div>
    <header>
      <h1>Лабораторная работа #4</h1>
      <div style="text-align:center">
        <span>Пользователь: {{ user }}</span>
        <button @click="logout" class="x-button" style="float: right">Выход</button>
      </div>
    </header>

    <main>
      <table class="layout-table">
        <tr>
          <!-- Панель ввода -->
          <td class="input-panel">
            <div class="input_section">
              <!-- X Input (Text) -->
              <div class="form-row">
                <span class="form-label">X:</span>
                <input type="text" v-model="x" class="y-text-input" placeholder="-3 ... 5" @input="validateX">
                <span v-if="errors.x" class="error-messages" style="font-size: 12px; margin-left: 10px">{{ errors.x }}</span>
              </div>

              <!-- Y Input (Text) -->
              <div class="form-row">
                <span class="form-label">Y:</span>
                <input type="text" v-model="y" class="y-text-input" placeholder="-5 ... 3" @input="validateY">
                <span v-if="errors.y" class="error-messages" style="font-size: 12px; margin-left: 10px">{{ errors.y }}</span>
              </div>

              <!-- R Input (Text) -->
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

          <!-- График -->
          <td class="graph-panel">
            <div class="canvas-container" @click="handleGraphClick">
              <canvas ref="graphCanvas" width="400" height="400" id="graph-canvas"></canvas>
            </div>
          </td>
        </tr>
      </table>

      <!-- Таблица результатов -->
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
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

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

// Валидация
const validateNumber = (val, min, max) => {
  const num = parseFloat(val.replace(',', '.'));
  if (isNaN(num)) return "Не число";
  if (num < min || num > max) return `Диапазон: ${min} ... ${max}`;
  return "";
};

const validateX = () => errors.value.x = validateNumber(x.value, -3, 5);
const validateY = () => errors.value.y = validateNumber(y.value, -5, 3);
// Для R: несмотря на диапазон -3...5, радиус для отрисовки должен быть > 0
const validateR = () => {
  errors.value.r = validateNumber(r.value, -3, 5);
  if (!errors.value.r && parseFloat(r.value) <= 0) errors.value.r = "R должен быть > 0";
  drawGraph(); // Перерисовка при изменении R
};

const isValid = computed(() => {
  return !errors.value.x && !errors.value.y && !errors.value.r && x.value && y.value && r.value;
});

// Загрузка данных
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

// --- Логика Графика ---
const drawGraph = () => {
  const canvas = graphCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const R = parseFloat(r.value.replace(',', '.'));

  // Очистка
  ctx.clearRect(0, 0, width, height);

  // Отрисовка фигуры (если R задан корректно)
  if (R > 0) {
    ctx.fillStyle = '#4169E1'; // Цвет области (примерно синий)
    ctx.globalAlpha = 0.5;

    // ВНИМАНИЕ: Здесь рисуем фигуры для Варианта 478
    // Это ЗАГЛУШКА, нужно подставить правильные фигуры!
    const scale = (width / 2) / 6; // Масштаб (чтобы R=5 влезало)
    const rPx = R * scale;

    ctx.beginPath();
    // Пример: Прямоугольник в 1 четверти
    ctx.fillRect(width/2, height/2 - rPx/2, rPx, rPx/2);

    // Пример: Треугольник во 2 четверти
    ctx.moveTo(width/2, height/2);
    ctx.lineTo(width/2 - rPx, height/2);
    ctx.lineTo(width/2, height/2 - rPx);
    ctx.fill();

    // Пример: Сектор в 4 четверти
    ctx.beginPath();
    ctx.moveTo(width/2, height/2);
    ctx.arc(width/2, height/2, rPx/2, 0, Math.PI/2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
  }

  // Оси
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(0, height/2); ctx.lineTo(width, height/2); // X
  ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height); // Y
  ctx.stroke();

  // Точки
  points.value.forEach(p => {
    // Чтобы отобразить старые точки, нам нужен ТЕКУЩИЙ R для масштаба?
    // Обычно в лабах просят рисовать точки относительно текущего R или в абсолютных координатах.
    // Если R не задан, используем масштаб по умолчанию (например R=5)
    const curR = R > 0 ? R : 5;
    const scale = (width / 2) / 6; // Фиксированный масштаб координатной плоскости (до 6 единиц)

    const pX = width/2 + p.x * scale;
    const pY = height/2 - p.y * scale;

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

  // Перевод из пикселей в координаты
  let graphX = (clickX - width/2) / scale;
  let graphY = (height/2 - clickY) / scale;

  // Округление для красоты
  graphX = graphX.toFixed(2);
  graphY = graphY.toFixed(2);

  // Отправка
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