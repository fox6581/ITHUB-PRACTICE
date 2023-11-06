<template>
  <div>
    <input v-model="keyword" placeholder="Введите ключ (например, 1)">
    <button :disabled="!keyword" @click="sendMessage">Отправить</button>
    <div>
      <ul>
        <p v-if="contentList.length === 0">нет контента</p>
        <li v-for="(item, index) in contentList" :key="index">
          <div>
            <div v-if="!item.isDownloading">
              <a target="_blank" :href="item">{{ item }}</a>
              <button @click="downloadFile(index);">Скачать</button>
              <br>
            </div>

            <div v-if="item.isDownloading">
              Размер: {{ item.status.size }} bytes<br>
              Кол-во запущенных потоков: {{ item.status.currentThreads }}<br>
              Количечество памяти на поток: {{ this.byteLimitPerSecond }} <br>
              Прогресс загрузки: {{ item.status.progress }}%
              <a :href="item.downloadLink" download>Скачать файл</a>
              <img :src="item.downloadLink" alt="" width="300" height="300" />
              <br>
              <br>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!-- Элемент для отображения прогресса -->
    <div v-if="item && item.isDownloading">
      Прогресс загрузки: {{ downloadProgress }}%
    </div>
    <div v-if="selectedContent">
      <h2>Выбранный контент:</h2>
      <ul>
        <li v-for="(url, index) in selectedContent" :key="index">
          <a target="_blank" :href="url">{{ url }}</a>
        </li>
      </ul>
    </div>

    <!-- Обработка ошибок -->
    <div v-if="errorMessages.length > 0" class="error-messages">
      <h3>Сообщения об ошибках:</h3>
      <ul>
        <li v-for="(errorMessage, index) in errorMessages" :key="index">{{ errorMessage }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyword: "",
      status: {
        size: 0,
        currentThreads: 0,
        progress: 0,
        selectedContent: [],

      },
      showDownloadLink: true,
      contentList: [],
      vizit: true,
      downloadLimit: null,
      byteLimitPerSecond: null,
      downloadProgress: 0,
      errorMessages: [],
      error:'',
    };
  },
  created() {
    // Запрос для получения downloadLimit
    fetch('http://localhost:3000/config/download-limit')
      .then(response => response.json())
      .then(data => {
        this.downloadLimit = data.downloadLimit;
        // Теперь вы можете использовать this.downloadLimit в вашем компоненте
      });

    // Запрос для получения byteLimitPerSecond
    fetch('http://localhost:3000/config/byte-limit-per-second')
      .then(response => response.json())
      .then(data => {
        this.byteLimitPerSecond = data.byteLimitPerSecond;
        // Теперь вы можете использовать this.byteLimitPerSecond в вашем компоненте
      });

    // Проверяем наличие данных в LocalStorage
    const storedContentList = localStorage.getItem('contentList');
    if (storedContentList) {
      this.contentList = JSON.parse(storedContentList);
      // Если данные в LocalStorage есть, устанавливаем vizit в false
      this.vizit = false;
    }
  },
  methods: {
    async downloadFile(index) {

      try {
        this.showDownloadLink = false;
        this.downloadProgress = 0;
        this.startDownloadProgress();
        const url = this.contentList[index]; // Получаем URL из contentList по индексу
        console.log(url)
        const response = await fetch(`http://localhost:3000/download/${encodeURIComponent(url)}`, {
          method: 'GET',
        });

        if (response.status === 200) {
          const blob = await response.blob();
          const fileURL = window.URL.createObjectURL(blob);
          this.vizit = false;

          const status = {
            size: blob.size,
            currentThreads: this.downloadLimit,
            progress: 100, // Считаем, что загрузка завершена
          };

          // Обновляем свойства элемента в contentList
          this.contentList[index] = {
            ...this.contentList[index],
            status,
            isDownloading: true,
            downloadLink: fileURL,
          };
          localStorage.setItem('contentList', JSON.stringify(this.contentList));
          console.log('Данные сохранены в LocalStorage:', this.contentList);
        } else {
          console.error('Ошибка скачивания файла');
          this.errorMessages.push('Ошибка скачивания файла');
        }
      } catch (error) {
        
        console.error(`Произошла ошибка: ${error}`); 
        
        this.errorMessages.push(`Произошла ошибка: ${error}`);
      }
    },
    hideDownloadLink() {
      this.showDownloadLink = false; // При нажатии на кнопку скрываем элемент
    },
    startDownloadProgress() {
      // Запускаем обновление прогресса каждые 100 миллисекунд
      this.downloadProgressInterval = setInterval(() => {
        // Обновляем прогресс с каким-то шагом
        this.downloadProgress += 1; // Здесь вы можете настроить, какой шаг использовать
        if (this.downloadProgress >= 100) {
          clearInterval(this.downloadProgressInterval); // Завершаем интервал после достижения 100%
        }
      }, 100);
    },
    sendMessage() {
      if (this.keyword) {
        const socket = new WebSocket("ws://localhost:3000/keywords");
        socket.addEventListener("open", () => {
          socket.send(this.keyword);
          this.contentList = [];
        });

        socket.addEventListener("message", (event) => {
          try {

            const data = JSON.parse(event.data);
            console.log("Получены данные от сервера:", data);

            if (Array.isArray(data) && data.length > 0) {
              this.status = {
                size: data[0].size,
                currentThreads: data[0].currentThreads,
                progress: data[0].progress,
              };
              this.contentList = data;
            } else {
              this.status = {
                size: 0,
                currentThreads: 0,
                progress: 0,
              };
              this.contentList = [];
            }

          } catch(error) {

            console.error("Ошибка при разборе данных: ", error);
    
            this.errorMessages.push("Ошибка при разборе данных: " + error);

          }

        });

        socket.addEventListener("error", () => {
          console.log("Ошибка соединения");


        });
      }
    },
  },
};
</script>
