<template>
  <div>
    <header>
      <h1>Лабораторная работа #4</h1>
      <div style="text-align: center">
        <p>Кузьмин Дмитрий Анатольевич | P3209 | Вариант 478</p>
      </div>
    </header>

    <main class="start-page-main">
      <div class="input_section" style="max-width: 400px; margin: 0 auto;">
        <h3>Вход в систему</h3>
        <div class="form-row">
          <input v-model="username" type="text" placeholder="Логин" class="y-text-input" style="width: 100%">
        </div>
        <div class="form-row">
          <input v-model="password" type="password" placeholder="Пароль" class="y-text-input" style="width: 100%">
        </div>

        <div class="form-row">
          <button @click="login" class="submit-button">Войти</button>
          <button @click="register" class="clear-button">Регистрация</button>
        </div>
        <p v-if="error" class="error-messages">{{ error }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const api = axios.create({ baseURL: 'http://localhost:8080/api/auth' });

const login = async () => {
  try {
    // Внимание: отправляем пароль как есть, бэк его проверит
    // Но для Basic Auth нам нужно сформировать токен
    const res = await api.post('/login', { username: username.value, password: password.value });

    // Сохраняем токен (base64) в localStorage
    // Примечание: сервер возвращает токен, который мы закодировали в контроллере
    // Но лучше сформировать Basic заголовок вручную на клиенте:
    const token = btoa(username.value + ":" + password.value);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('username', username.value);

    router.push('/main');
  } catch (e) {
    error.value = "Неверный логин или пароль";
  }
};

const register = async () => {
  try {
    await api.post('/register', { username: username.value, password: password.value });
    alert("Регистрация успешна! Теперь войдите.");
  } catch (e) {
    error.value = "Ошибка регистрации (возможно, логин занят)";
  }
};
</script>