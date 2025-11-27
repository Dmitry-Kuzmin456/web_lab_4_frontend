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
          </td>

          <td class="right">
            <img :src="duck1" class="duck" alt="duck right"/>
          </td>
        </tr>
      </table>
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

import duck1 from '../assets/img/duck_without_background_1.png';
import duck2 from '../assets/img/duck_without_background_2.png';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const api = axios.create({ baseURL: 'http://localhost:8080/api/auth' });

const login = async () => {
  try {
    await api.post('/login', { username: username.value, password: password.value });

    const credentials = username.value + ":" + password.value;
    const token = btoa(unescape(encodeURIComponent(credentials)));

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
    if (e.response && e.response.status === 400) {
      error.value = "Пользователь с таким именем уже существует";
    } else {
      error.value = "Ошибка регистрации";
    }
  }
};
</script>