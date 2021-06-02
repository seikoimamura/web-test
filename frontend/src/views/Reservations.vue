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
      <select v-model="selectedParties" :disabled="isPartiesDisabled" @change="onChangeSelect($event)">
        <option :value=null disabled>Please select number of party.</option>
        <option v-for="party in parties" v-bind:key="party" :value="party">{{ party }}</option>
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
      parties: null,
      selectedParties: null,
      dates: null,
      inventories: null,
      inventoryID: null,
      selectedDate: null,
      slots: [],
      selectedSlot: null,
      isPartiesDisabled: false,
      isDateDisabled: false,
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
    this.parties = await this.getParties()
    this.inventories = await this.getDates()
    this.msg['email'] = ''
  },
  methods: {
    validateEmail(value){
      if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        this.msg['email'] = '';
      } else {
        this.msg['email'] = 'Invalid Email Address';
      }
    },

    doReserve() {
      console.log('reserve |' + this.name)
      const data = {
        name: this.name,
        email: this.email,
        partyOf: this.selectedParties,
        inventoryID: this.inventoryID,
        slot: this.selectedSlot
      }
      if (confirm("Are you sure to reserve?")) {
        axios.post('http://localhost:9090/api/reservations', data)
          .then(function (response) {
            alert("Thank you!\n" + JSON.stringify(response));
            console.log(response)
          })
          .catch(function (error) {
            console.log(error);
          })
        this.doClear()
      }
    },
    doClear() {
      console.log('clear')
      this.name = null
      this.email = null
      this.selectedParties = null
      this.inventoryID = null
      this.selectedSlot = null
      this.isSlotsDisabled = true
      this.isReserveDisabled = true
      this.msg['email'] = ''
    },
    enableReserve() {
      console.log("name" +"|"+ this.name)
      console.log("email" +"|"+ this.email)
      if ((this.name == null || this.name.length < 3) ||
          (this.email == null || this.email.length < 8) ||
          this.selectedParties < 1 ||
          (this.inventoryID == null) ||
          (this.selectedSlot == null || this.selectedSlot.length < 1)) {
        this.isReserveDisabled = true
        console.log("reseve disabled!!!!")
      } else {
        this.isReserveDisabled = false
      }
    },
    onChangeSelect: async function(e) {
      console.log(this.selectedParties + " | " + this.inventoryID)
      if (this.selectedParties > 0) {
        console.log("Number of party is selected.")
      }
      if (this.inventoryID != null) {
        console.log("Date is selected.")
      }
      if (this.selectedParties > 0 && this.inventoryID != null) {
        this.isSlotsDisabled = false
        console.log("Slots Enabled.")
        this.slots = await this.getSlots(this.inventoryID, this.selectedParties)
        console.log("----onChangeSelect----")
        console.log(this.slots)
      } else {
        this.isSlotsDisabled = true
        console.log("Slots Disabled.")
      }
      this.enableReserve()
    },
    getParties: async function() {
      const res = await axios.get('http://localhost:9090/api/inventories/parties')
      return res.data.parties
    },
    getDates: async function() {
      const res = await axios.get('http://localhost:9090/api/inventories')
      console.log("== getDates() ====")
      console.log(res)
      return res.data.inventories
    },
    getSlots: async function(inventoryID, parties) {
      const res = await axios.get('http://localhost:9090/api/inventories/slots/' + inventoryID + '/parties/' + parties)
      console.log("=== getSlots ===")
      console.log(res.data.inventory)
      return res.data.inventory.slots
    }
    //setInitialValues: async function() {
    //  const res = await axios.get('http://localhost:9090/api/inventories')
    //  return res
    //}
  },
  async mounted() {
    try {
      await axios.get('http://localhost:9090/test')
        .then(function (response) {
          console.log("axios, await")
        })
    } catch (error) {
      console.error(error)
    }
  }
}
</script>
