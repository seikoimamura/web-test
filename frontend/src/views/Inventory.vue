<template>
  <div>
    <h1>Inventory</h1>
    <div>
      <h2>Manage Inventories</h2>
      <span style="margin: 10px">Date :</span>
      <!-- dropdown: display next 1 week -->
      <select v-model="selectedDate" @change="onChangeDate($event)">
        <option :value=null disabled>Please select date.</option>
        <option v-for="date in dates" v-bind:key="date">{{ date }}</option>
      </select>
      <span style="margin: 10px">Open :</span>
      <select v-model="selectedOpenTime" :disabled="isOpenTimeDisabled" @change="onChangeOpenTime($event)">
        <option :value=null disabled>Please select opening time.</option>
        <option v-for="(time, index) in openTimes" :disabled="!time.id" v-bind:key="index">{{ time.value }}</option>
      </select>
      <span style="margin: 10px">Close :</span>
      <select v-model="selectedCloseTime" :disabled="isCloseTimeDisabled" @change="onChangeCloseTime($event)">
        <option :value=null disabled>Please select closing time.</option>
        <option v-for="(time, index) in closeTimes" :disabled="!time.id" v-bind:key="index" >{{ time.value }}</option>
      </select>
      <p></p>
      <div v-show="viewInventories">
        <table style="margin-left: auto; margin-right:auto">
          <thead>
            <tr>
              <th>Slot</th><th>Max Number of Reservations</th><th>Current Reservations</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in slots" :key="index">
              <td>{{ item.slot }}</td>
              <td><input type="number" min="1" :value="item.maxReservations" :data-row="index" @change="onChangeMaxReservations"/></td>
              <td>{{item.numReservations}}</td>
            </tr>
          </tbody>
        </table>
        <p>
          <button v-on:click="doAdd()" :disabled="isAddDisabled">Add Inventory</button>
          <button v-on:click="doUpdate()" :disabled="isUpdateDisabled">Update Inventory</button>
          <button v-on:click="doView()" :disabled="isViewDisabled">View Reservations</button>
          <button v-on:click="doClear()">Clear</button>
        </p>
      </div>
    </div>
    <div v-show="viewReservations">
      <h2>Current Reservations</h2>
      <table style="margin-left: auto; margin-right:auto">
        <thead>
          <tr>
            <th>Reservation Time</th><th>Name</th><th>Email</th><th>A paty of</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(reservation, index) in reservations" v-bind:key="index">
            <td>{{ reservation.reservationTime }}</td>
            <td>{{ reservation.name }}</td>
            <td>{{ reservation.email }}</td>
            <td>{{ reservation.partyOf }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Inventories',
  data () {
    return {
      openTimes: this.getTimes(),
      closeTimes: this.getTimes(),
      selectedDate: null,
      selectedOpenTime: null,
      selectedCloseTime: null,
      isOpenTimeDisabled: true,
      isCloseTimeDisabled: true,
      dates: null,
      slots: [],
      isSlotsDisabled: true,
      isAddDisabled: true,
      isUpdateDisabled: true,
      isViewDisabled: true,
      viewInventories: false,
      viewReservations: false,
      inventoryID: null,
      reservations: []
    }
  },
  created: async function () {
    this.dates = await this.getDates()
  },
  methods: {
    getTimes() {
      const times = []
      for (let i=1; i <= 24; i++) {
        const digits = i.toLocaleString('en-US', {minimumIntegerDigits: 2})
        times.push({id: i,  value: `${digits}:00`})
      }
      return times
    },
    doAdd() {
      const data = {
        reservationDate: this.selectedDate,
        openTime: this.selectedOpenTime,
        closeTime: this.selectedCloseTime,
        slots: this.slots
      }
      axios.post('http://localhost:9090/api/inventories', data)
        .then(function (response) {
          alert("Inventory for " + data.reservationDate + " is saved");
        })
        .catch(function (error) {
          console.log(error);
        })
    },
    doUpdate() {
      const data = {
        id: this.inventoryID,
        reservationDate: this.selectedDate,
        openTime: this.selectedOpenTime,
        closeTime: this.selectedCloseTime,
        slots: this.slots
      }
      axios.put('http://localhost:9090/api/inventories', data)
        .then(function (response) {
          console.log(response);
          alert("Inventory for " + data.reservationDate + " is updated.");
        })
        .catch(function (error) {
          console.log(error);
        })
    },
    doView: async function() {
      const res = await axios.get('http://localhost:9090/api/reservations/' + this.inventoryID)
      this.reservations = res.data.reservations
      this.viewReservations = true
    },
    doClear() {
      this.selectedDate = null
      this.selectedOpenTime = null
      this.selectedCloseTime = null
      this.isOpenTimeDisabled = true
      this.isCloseTimeDisabled = true
      this.slots = []
      this.isSlotsDisabled = true
      this.isAddDisabled = true
      this.isUpdateDisabled = true
      this.isViewDisabled = true
      this.viewInventories = false
      this.viewReservations = false
      this.inventoryID = null
      this.reservations = []
    },
    onChangeMaxReservations(e) {
      const row = e.target.dataset.row
      this.slots[row].maxReservations = e.target.value
    },
    onChangeOpenTime(e) {
      this.isCloseTimeDisabled = false
      this.selectedCloseTime = null
      this.viewInventories = false
      for (let i = 0; i < this.closeTimes.length; i++) {
        this.closeTimes[i].id = 0
        if (this.closeTimes[i].value === this.selectedOpenTime) {
          break;
        }
      }
    },
    onChangeCloseTime(e) {
      const slots = {}
      if (this.inventoryID) {
        this.slots.forEach((item, index) => {
          slots[item.slot] = item.maxReservations
        })
      }
      const d1 = new Date(this.selectedDate + " " + this.selectedOpenTime)
      const d2 = new Date(this.selectedDate + " " + this.selectedCloseTime)
      const items = []
      const options = {hour12: false, hour: '2-digit', minute: '2-digit'}
      while (d1.getTime() < d2.getTime()) {
        const slot = new Intl.DateTimeFormat('default', options).format(d1)
        const max = slots[slot] ? slots[slot] : 0
        items.push({slot: slot,  maxReservations: max})
        d1.setMinutes(d1.getMinutes() + 15)
      }
      this.viewInventories = true
      this.slots = items
      this.isAddDisabled = false
      if (this.inventoryID) {
        this.isAddDisabled = true
      }
    },
    onChangeDate: async function(e) {
      this.selectedOpenTime = null
      this.selectedCloseTime = null
      this.isOpenTimeDisabled = true
      this.isCloseTimeDisabled = true
      this.slots = []
      this.isSlotsDisabled = true
      this.isAddDisabled = true
      this.isUpdateDisabled = true
      this.isViewDisabled = true
      this.viewInventories = false
      this.viewReservations = false
      this.inventoryID = null
      this.reservations = []
      const res = await axios.get('http://localhost:9090/api/inventories/date/' + this.selectedDate)
      if (res.data.inventory !== null) {
        // Inventory exists
        const items = []
        this.inventoryID = res.data.inventory.id
        this.selectedOpenTime = res.data.inventory.openTime
        this.selectedCloseTime = res.data.inventory.closeTime
        for (const item of res.data.inventory.slots.entries()) {
          let num = 0
          if (res.data.reservations !== null) {
            // there is a reservation
            for (const reservation of res.data.reservations.entries()) {
              if (item[1].slot == reservation[1].reservationTime) {
                num = reservation[1].numReservations
                this.isViewDisabled = false
                break
              }
            }
          }
          items.push({
            slot:item[1].slot,
            maxReservations: item[1].maxReservations,
            numReservations: num
          })
        }
        this.slots = items
        if (this.isViewDisabled) {
          // has inventory but no reservations.
          this.isAddDisabled = true
          this.isUpdateDisabled = false
          this.isCloseTimeDisabled = false
          this.isOpenTimeDisabled = false
        } else {
          // has inventory and reservations.
          this.isAddDisabled = true
          this.isUpdateDisabled = true
          this.isCloseTimeDisabled = true
          this.isOpenTimeDisabled = true
        }
        this.viewInventories = true
      } else {
        // No inventory exists - create a new one
        this.isOpenTimeDisabled = false
      }
    },
    getDates: async function() {
      const days = '14'
      const res = await axios.get('http://localhost:9090/api/inventories/dates/' + days)
      return res.data.dates
    }
  }
}
</script>
