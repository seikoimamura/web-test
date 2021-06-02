<template>
  <div>
    <h1>Reservations</h1>
    <div class="form">
      <label for="name">Name : </label>
      <input class="input" type="text" v-model="name" @change="enableReserve()" placeholder="Please enter your name." maxlength="50" minlength="3">
      <p></p>
      <label for="email">Email : </label>
      <input class="input" type="email" v-model="email" @change="enableReserve()" placeholder="Please enter your email.">
      <p><span style="font-size: 12px; color: red;" v-if="msg.email">{{ msg.email }}</span></p>
      <p></p>
      <label for="partyOf">Party Size : </label>
      <!-- dropdown -->
      <select v-model="selectedPartyof" :disabled="isPartyofDisabled" @change="onPartySelected($event)">
        <option :value=null disabled>Please select number of guests.</option>
        <option v-for="party in partyof" v-bind:key="party" :value="party">{{ party }}</option>
      </select>
      <p></p>
      <label for="date">Date : </label>
      <!-- dropdown: display dates available for reservation -->
      <select v-model="inventoryID" :disabled="isDateDisabled" @change="onChangeSelect($event)">
        <option :value=null disabled>Please select date.</option>
        <option v-for="inventory in inventories" v-bind:value="inventory.id" v-bind:key="inventory.id">{{ inventory.reservationDate }}</option>
      </select>
      <p></p>
      <label for="slot">Time : </label>
      <!-- dropdown: every 15 minutes -->
      <select v-model="selectedSlot" :disabled="isSlotsDisabled" @change="onChangeSelect($event)">
        <option :value=null disabled>Please select time.</option>
        <option v-for="slot in slots" :disabled="slot.maxReservations==slot.numReservations" v-bind:key="slot.slot" v-bind:value="slot.slot">{{ slot.slot }}</option>
      </select>
      <p></p>
      <p>
        <button v-on:click="doReserve()" :disabled="isReserveDisabled">Reserve</button>
        <button v-on:click="doClear()">Clear</button>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Reservations',
  data () {
    return {
      msg: [],
      name: null,
      email: null,
      partyof: null,
      selectedPartyof: null,
      dates: null,
      inventories: null,
      inventoryID: null,
      selectedDate: null,
      slots: [],
      selectedSlot: null,
      isPartyofDisabled: false,
      isDateDisabled: true,
      isSlotsDisabled: true,
      isReserveDisabled: true
    }
  },
  watch: {
    email(value) {
      this.email = value
      this.validateEmail(value)
    }
  },
  created: async function () {
    this.partyof = await this.getPartyof()
  },
  methods: {
    validateEmail(value){
      if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        this.msg['email'] = '';
      } else {
        this.msg['email'] = 'Invalid Email Address';
      }
    },
    doReserve: async function() {
      const data = {
        name: this.name,
        email: this.email,
        partyOf: this.selectedPartyof,
        inventoryID: this.inventoryID,
        slot: this.selectedSlot
      }
      if (confirm("Are you sure to reserve?")) {
        this.doClear()
        await axios.post('http://localhost:9090/api/reservations', data)
          .then(function (response) {
            alert("Thank you!");
          })
          .catch(function (error) {
            console.log(error);
          })
      }
    },
    doClear() {
      console.log('clear')
      this.msg = []
      this.name = null
      this.email = null
      this.selectedPartyof = null
      this.dates = null
      this.inventories = null
      this.inventoryID = null
      this.selectedDate = null
      this.slots = []
      this.selectedSlot = null
      this.isPartyofDisabled = false
      this.isDateDisabled = true
      this.isSlotsDisabled = true
      this.isReserveDisabled = true
    },
    enableReserve() {
      if (this.name == null || this.email == null || this.selectedPartyof < 1 ||
          this.inventoryID == null || this.selectedSlot == null) {
        this.isReserveDisabled = true
      } else {
        this.isReserveDisabled = false
      }
    },
    onPartySelected: async function(e) {
      this.inventories = await this.getDates()
      this.isDateDisabled = false
    },
    onChangeSelect: async function(e) {
      if (this.selectedPartyof > 0 && this.inventoryID != null) {
        this.isSlotsDisabled = false
        this.slots = await this.getSlots(this.inventoryID, this.selectedPartyof)
      } else {
        this.isSlotsDisabled = true
      }
      this.enableReserve()
    },
    getPartyof: async function() {
      const res = await axios.get('http://localhost:9090/api/inventories/partyof')
      return res.data.partyof
    },
    getDates: async function() {
      const res = await axios.get('http://localhost:9090/api/inventories')
      return res.data.inventories
    },
    getSlots: async function(inventoryID, partyof) {
      const res = await axios.get('http://localhost:9090/api/inventories/slots/' + inventoryID + '/partyof/' + partyof)
      return res.data.inventory.slots
    }
  }
}
</script>
