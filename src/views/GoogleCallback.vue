<template>
  <div style="text-align: center; margin-top: 50px;">
    <h2>Авторизация через Google...</h2>
    <p>Пожалуйста, подождите.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

onMounted(() => {
  const token = route.query.token;
  const username = route.query.username;

  if (token && username) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('username', username);

    router.push('/main');
  } else {
    alert("Ошибка авторизации через Google");
    router.push('/');
  }
});
</script>