import { Controller, Get, Post, Put } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Sequelize, Op } from 'sequelize'
import { Inventories as InventoriesModel} from '../models/Inventories'
import { Reservations as ReservationsModel} from '../models/Reservations'

@Controller('api/inventories')
export class Inventories {
  @Get()
  private async getInventories(req: Request, res: Response) {
    const inventories = await InventoriesModel.findAll({
      where: {reservationDate: {
        [Op.gte]: Sequelize.literal('now()::Date')
      }},
      order: Sequelize.col('reservationDate')
    }).catch((error: Error) => {
      return res.status(400).json({msg: 'error!'})
    })
    return res.json({inventories: inventories})
  }
  @Get('partyof')
  private async getPartyof(req: Request, res: Response) {
    const partyof = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    return res.json({partyof: partyof})
  }
  @Get('slots/:id/partyof/:num')
  private async getSlots(req: Request, res: Response) {
    const inventory = await InventoriesModel.findOne({
      where: {id: req.params['id']}
    })
    const reservations = await ReservationsModel.findAll({
      attributes: ['reservationTime', [Sequelize.fn('COUNT', Sequelize.col('reservationTime')), 'numReservations']],
      group: ['reservationTime'],
      raw: true,
      where: {inventoryID: req.params['id']}
    })
    const reserves = {}
    reservations.forEach((reservation, index) => {
      reserves[reservation.reservationTime] = reservation.numReservations
    })
    const slots = []
    inventory.slots.forEach((slot, index) => {
      let num = 0
      if (reserves[slot.slot]) {
        num = reserves[slot.slot]
      }
      slots.push({
        slot: slot.slot,
        maxReservations: slot.maxReservations,
        numReservations: num
      })
    })
    inventory.slots = slots
    return res.json({inventory: inventory})
  }
  @Get('dates/:days')
  private async getDates(req: Request, res: Response) {
    const currentDay = new Date()
    const dates = []
    dates.push(currentDay.toDateString())
    const days = parseInt(req.params['days'])
    for (let i = 1; i < days; i++) {
      currentDay.setDate(currentDay.getDate() + 1)
      dates.push(currentDay.toDateString())
    }
    return res.json({dates: dates})
  }
  @Get('date/:date')
  private async getInventory(req: Request, res: Response) {
    const inventory = await InventoriesModel.findOne({
      where: {reservationDate: req.params['date']}
    })
    if (inventory !== null) {
      const reservations = await ReservationsModel.findAll({
        attributes: ['reservationTime', [Sequelize.fn('COUNT', Sequelize.col('reservationTime')), 'numReservations']],
        group: ['reservationTime'],
        raw: true,
        where: {inventoryID: inventory.id}
      })
      return res.json({inventory: inventory, reservations: reservations})
    }
    return res.json({inventory: inventory})
  }
  @Post()
  private async addInventory(req: Request, res: Response) {
    const inventory = await InventoriesModel.create({
      reservationDate: req.body.reservationDate,
      openTime: req.body.openTime,
      closeTime: req.body.closeTime,
      slots: req.body.slots
    })
    if (inventory === null) {
      return res.status(400).json({msg: 'error!'})
    }
    return res.send(inventory)
  }
  @Put()
  private async updateInventory(req: Request, res: Response) {
    const inventory = await InventoriesModel.update({
      reservationDate: req.body.reservationDate,
      openTime: req.body.openTime,
      closeTime: req.body.closeTime,
      slots: req.body.slots
    }, {
      where: {id: req.body.id}
    })
    return res.send(inventory)
  }
}
