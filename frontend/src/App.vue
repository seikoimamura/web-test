<template>
  <div id="app">
    <div id="nav">
      <router-link to="/reservations">Reservations</router-link> |
      <router-link to="/inventory">Inventory</router-link>
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

table {
  border: 2px solid gray;
  border-radius: 3px;
  background-color: #fff;
}

th {
  background-color: gray;
  color: rgba(255, 255, 255, 0.66);
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

td {
  background-color: #f9f9f9;
}

input:invalid:focus {
  background-image: linear-gradient(pink, red);
}
</style>
