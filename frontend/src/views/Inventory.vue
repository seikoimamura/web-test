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
            <tr v-for="(item, index) in items" :key="index">
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
      selectedOpenTime: null,
      selectedCloseTime: null,
      isOpenTimeDisabled: true,
      isCloseTimeDisabled: true,
      items: [],
      parties: null,
      dates: null,
      selectedDate: null,
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
    //console.log(this.parties)
  },
  //watch: {
  //  '$route': 'setInitialValues'
  //},
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
      console.log('====== doAdd =======')
      const data = {
        reservationDate: this.selectedDate,
        openTime: this.selectedOpenTime,
        closeTime: this.selectedCloseTime,
        slots: this.items
      }
      //for (const item of this.items) {
      //  console.log(item.slot + " | " + item.maxReservations)
      //}

      axios.post('http://localhost:9090/api/inventories', data)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        })

    },
    doUpdate() {
      console.log('====== doUpdate =======')
      console.log(this.items)
      const data = {
        id: this.inventoryID,
        reservationDate: this.selectedDate,
        openTime: this.selectedOpenTime,
        closeTime: this.selectedCloseTime,
        slots: this.items
      }
      axios.put('http://localhost:9090/api/inventories', data)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        })

    },
    doView: async function() {
      console.log('====== doView =======')
      console.log(this.inventoryID)
      const res = await axios.get('http://localhost:9090/api/reservations/' + this.inventoryID)
      this.reservations = res.data.reservations
      this.viewReservations = true
    },
    doClear() {
      console.log('clear')
      this.selectedOpenTime = null
      this.selectedCloseTime = null
      this.isOpenTimeDisabled = true
      this.isCloseTimeDisabled = true
      this.items = []
      this.parties = null
      //this.dates = null
      this.selectedDate = null
      this.slots = []
      this.selectedDate = null
      this.isSlotsDisabled = true
      this.isAddDisabled = true
      this.isUpdateDisabled = true
      this.isViewDisabled = true
      this.viewInventories = false
      this.viewReservations = false
    },
    onChangeMaxReservations(e) {
      const row = e.target.dataset.row
      this.items[row].maxReservations = e.target.value
    },
    onChangeOpenTime(e) {
      this.isCloseTimeDisabled = false
      this.selectedCloseTime = null
      this.viewInventories = false
      this.items = []
      for (let i = 0; i < this.closeTimes.length; i++) {
        this.closeTimes[i].id = 0
        if (this.closeTimes[i].value === this.selectedOpenTime) {
          break;
        }
      }
    },
    onChangeCloseTime(e) {
      console.log("== onChangeCloseTime ==")
      const d1 = new Date(this.selectedDate + " " + this.selectedOpenTime)
      const d2 = new Date(this.selectedDate + " " + this.selectedCloseTime)
      const items = []
      const options = {hour12: false, hour: '2-digit', minute: '2-digit'}
      while (d1.getTime() < d2.getTime()) {
        const slot = new Intl.DateTimeFormat('default', options).format(d1)
        //console.log(d1.toTimeString() + " | " + slot)
        items.push({slot: slot,  maxReservations: 0})
        d1.setMinutes(d1.getMinutes() + 15)
      }
      this.viewInventories = true
      this.items = items
      this.isAddDisabled = false
    },
    onChangeDate: async function(e) {
      //const times = this.getTimes()
      //console.log(times)
      this.viewReservations = false
      this.reservations = []

      const res = await axios.get('http://localhost:9090/api/inventories/date/' + this.selectedDate)
      //console.log("=== onChangeDate ===")
      //console.log(res.data)
      if (res.data.inventory !== null) {
        const items = []
        console.log(res.data.inventory)
        this.inventoryID = res.data.inventory.id
        this.selectedOpenTime = res.data.inventory.openTime
        this.selectedCloseTime = res.data.inventory.closeTime

        //console.log(res.data.inventory.slots)
        //console.log("***************")
        for (const item of res.data.inventory.slots.entries()) {
          //console.log(item)
          let num = 0
          if (res.data.reservations !== null) {
            //console.log(res.data.reservations)
            for (const reservation of res.data.reservations.entries()) {
              //console.log(reservation[1].reservationTime +" | " + item[1].slot)
              if (item[1].slot == reservation[1].reservationTime) {
                num = reservation[1].numReservations
                this.isViewDisabled = false
                break
              }
            }
          }
          //console.log("============ here ==============")
          //console.log(item[1].slot + "|" + num)
          items.push({
            slot:item[1].slot,
            maxReservations: item[1].maxReservations,
            numReservations: num
          })
        }
        this.items = items
        //console.log(this.items)

        this.isCloseTimeDisabled = false
        if (this.isViewDisabled) {
          this.isUpdateDisabled = false
        }
        this.isOpenTimeDisabled = false
        this.viewInventories = true
      } else {
        this.isOpenTimeDisabled = false
      }
      //console.log(res.data.date)
    },
    getDates: async function() {
      const days = 14
      //const res = await axios.get('http://localhost:9090/api/inventories/dates/' + days)
      const res = await axios.get('http://localhost:9090/api/inventories/dates')
      //console.log(res.data.dates)
      return res.data.dates
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
