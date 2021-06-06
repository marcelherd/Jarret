<template>
  <input v-model="message" @keyup.enter="submit"/>
  <ul>
    <li v-for="(msg, index) in messages" :key="index">
      {{msg}}
    </li>
  </ul>
</template>

<script>
export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      message: '',
      messages: []
    }
  },
  methods: {
    submit() {
      this.messages.push(this.message);
      this.message = '';
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
