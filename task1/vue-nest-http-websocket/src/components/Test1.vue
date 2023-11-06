<template>
  <div>
    <h1>Запросы к серверу</h1>
    <div>
      <input v-model="url" placeholder="URL">
      <button @click="sendRequest">Отправить запрос</button>
    </div>
    <div v-for="(response, index) in responses" :key="index">
      <h2>Ответ {{ index + 1 }}</h2>
      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestOne',
  data() {
    return {
      url: '',
      responses: [],
    };
  },
  methods: {
    sendRequest() {
      const ws = new WebSocket('ws://localhost:3000/keywords'); // Замените на соответствующий URL
      ws.onopen = () => {
        console.log('WebSocket соединение установлено.');
        ws.send(this.url);
      };

      ws.onmessage = (event) => {
        const response = event.data;
        console.log('Получено сообщение от сервера:', response);
        this.responses.push(response);
      };

      ws.onclose = () => {
        console.log('WebSocket соединение закрыто');
      };
    
    },
  },
};
</script>

<style>
/* Добавьте стили, если необходимо */
</style>
