import { Controller, Get, Post, Put } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Sequelize, Op } from 'sequelize'
import { Inventories as InventoriesModel} from '../models/Inventories'
import { Reservations as ReservationsModel} from '../models/Reservations'
/*
SELECT "Inventories"."id", "Inventories".*, COUNT('Reservations.id') AS "numReservations"
FROM "Inventories" AS "Inventories"
LEFT OUTER JOIN "Reservations" AS "reservedInventries" ON "Inventories"."id" = "reservedInventries"."inventoryID" AND ("reservedInventries"."deleted_at" IS NULL)
WHERE ("Inventories"."deleted_at" IS NULL AND "Inventories"."reservationDate" >= now()::Date)
GROUP BY "InventoriesModel"."id";


SELECT "Inventories"."id", "Inventories".*, COUNT('Reservations.id') AS "numReservations"
FROM "Inventories" AS "Inventories"
LEFT OUTER JOIN "Reservations" AS "reservedInventries" ON "Inventories"."id" = "reservedInventries"."inventoryID"
AND ("reservedInventries"."deleted_at" IS NULL)
WHERE ("Inventories"."deleted_at" IS NULL AND "Inventories"."reservationDate" >= now()::Date)
GROUP BY "Inventories"."id";


SELECT "Inventories"."id", "Inventories".*, COUNT('Reservations.id') AS "numReservations"
FROM "Inventories" AS "Inventories"
LEFT OUTER JOIN "Reservations" AS "Reservations" ON "Inventories"."id" = "Reservations"."inventoryID"
AND ("Reservations"."deleted_at" IS NULL)
WHERE ("Inventories"."deleted_at" IS NULL AND "Inventories"."reservationDate" >= now()::Date)
GROUP BY "Inventories"."id";

*/

@Controller('api/inventories')
export class Inventories {
  @Get()
  private async getInventories(req: Request, res: Response) {
    const inventories = await InventoriesModel.findAll({
      /**
      attributes: ['Inventories.*', [Sequelize.fn('COUNT', Sequelize.col('Reservations.inventoryID')), 'numReservations']],
      include: [
        {
          model: ReservationsModel,
          attributes: []
        }
      ],
      group: ['"Reservations.inventoryID"', '"Inventories.id"'],
      **/
      /**
      attributes: ['id', 'slots', 'openTime', 'closeTime', 'reservationDate',
                   [Sequelize.literal('(SELECT COUNT(*) FROM "Reservations" WHERE "inventoryID" = "Inventories"."id")'),
                    'numReservations']
                  ],
      **/
      where: {reservationDate: {
        [Op.gte]: Sequelize.literal('now()::Date')
      }}
    }).catch((error: Error) => {
      return res.status(400).json({msg: 'error!'})
    })
    return res.json({inventories: inventories})
  }
  @Get('parties')
  private async parties(req: Request, res: Response) {
    const parties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    return res.json({parties: parties})
  }
  @Get('slots/:id/parties/:num')
  private async get(req: Request, res: Response) {
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
    return res.json(
      {
        inventory: inventory,
        parties: req.params['num']
      }
    )
  }
  //@Get('dates/:days')
  @Get('dates')
  private async dates(req: Request, res: Response) {
    const currentDay = new Date()
    const dates = []
    dates.push(currentDay.toDateString())
    //const days = parseInt(req.params['days'])
    const days = 7
    for (let i = 1; i < days; i++) {
      currentDay.setDate(currentDay.getDate() + 1)
      dates.push(currentDay.toDateString())
    }
    return res.json({dates: dates})
  }
  @Get('date/:date')
  private async getInventory(req: Request, res: Response) {
    /**
    const inventory = await InventoriesModel.findAll({
      raw: true,
      where: {reservationDate: req.params['date']},
      include: [{
        model: ReservationsModel
      }]
    })
    **/
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

      inventory.slots.forEach((slot, index) => {
      });

      return res.json({inventory: inventory, reservations: reservations})
    }

    return res.json({inventory: inventory})
  }
  @Post()
  private async addInventory(req: Request, res: Response) {
    const inventory = await InventoriesModel.create(
      {
        reservationDate: req.body.reservationDate,
        openTime: req.body.openTime,
        closeTime: req.body.closeTime,
        slots: req.body.slots
      }
    )
    if (inventory === null) {
      return res.status(400).json({msg: 'error!'})
    }
    return res.send(inventory)
    //return res.send(req.body.closeTime)
    //return res.status(200).json({msg: 'Reserved!'})
  }
  @Put()
  private async updateInventory(req: Request, res: Response) {
    const inventory = await InventoriesModel.update(
      {
        reservationDate: req.body.reservationDate,
        openTime: req.body.openTime,
        closeTime: req.body.closeTime,
        slots: req.body.slots
      },
      {
        where: {
          id: req.body.id
        }
      })

    //if (inventory === null) {
    //  return res.status(400).json({msg: 'error!'})
    //}
    return res.send(inventory)
    //return res.status(200).json({msg: 'test!'})
  }
}
