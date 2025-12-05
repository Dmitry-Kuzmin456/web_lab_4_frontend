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
          </td>

          <td class="right">
            <img :src="duck1" class="duck" alt="duck right"/>
          </td>
        </tr>
        </tbody>
      </table>
    </header>

    <main class="start-page-main">
      <div class="input_section" style="max-width: 400px; margin: 0 auto;">
        <h3>Вход в систему</h3>

        <div class="form-row">
          <input
              v-model="username"
              @input="clearError"
              @keyup.enter="login"
              type="text"
              placeholder="Логин"
              class="y-text-input"
              style="width: 100%"
          >
        </div>

        <div class="form-row">
          <input
              v-model="password"
              @input="clearError"
              @keyup.enter="login"
              type="password"
              placeholder="Пароль"
              class="y-text-input"
              style="width: 100%"
          >
        </div>

        <div class="form-row">
          <button @click="login" class="submit-button">Войти</button>
          <button @click="register" class="clear-button">Регистрация</button>
        </div>

        <div class="form-row" style="margin-top: 20px; border-top: 1px solid #d9a066; padding-top: 15px;">
          <a href="http://localhost:8080/oauth2/authorization/google" class="google-btn">
            Войти через Google
          </a>
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

import duck1 from '../assets/img/duck_without_background_1.png';
import duck2 from '../assets/img/duck_without_background_2.png';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const api = axios.create({ baseURL: 'http://localhost:8080/api/auth' });

const clearError = () => {
  error.value = '';
};

const login = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = "Логин и пароль не могут быть пустыми";
    return;
  }

  try {
    await api.post('/login', { username: username.value, password: password.value });

    const credentials = username.value + ":" + password.value;
    const token = btoa(unescape(encodeURIComponent(credentials)));

    localStorage.setItem('auth_token', token);
    localStorage.setItem('username', username.value);

    router.push('/main');
  } catch (e) {
    if (e.response && e.response.status === 401) {
      error.value = "Неверный логин или пароль";
    } else if (e.response && e.response.status === 400) {
      error.value = "Некорректные данные (пустые поля)";
    } else {
      error.value = "Ошибка сервера. Попробуйте позже.";
    }
  }
};

const register = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = "Заполните все поля для регистрации";
    return;
  }

  if (username.value.length < 4 || username.value.length > 20) {
    error.value = "Логин должен быть от 4 до 20 символов";
    return;
  }

  if (password.value.length < 4) {
    error.value = "Пароль слишком короткий (минимум 4 символа)";
    return;
  }

  try {
    await api.post('/register', { username: username.value, password: password.value });

    alert("Регистрация успешна! Теперь вы можете войти.");
    error.value = "";
  } catch (e) {
    if (e.response && e.response.status === 400) {
      error.value = e.response.data || "Ошибка регистрации (возможно, логин занят)";
    } else {
      error.value = "Ошибка соединения с сервером";
    }
  }
};
</script>