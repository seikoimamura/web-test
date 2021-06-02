import { Controller, Get, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Inventories as InventoriesModel} from '../models/Inventories'
import { Reservations as ReservationsModel} from '../models/Reservations'

@Controller('api/reservations')
export class Reservations {
  @Get(':inventoryID')
  private async get(req: Request, res: Response) {
    const reservations = await ReservationsModel.findAll({
      where: {inventoryID: req.params['inventoryID']}
    })
    return res.json({reservations: reservations})
  }
  @Post()
  private async add(req: Request, res: Response) {
    //return res.status(200).json({msg: 'Reserved!'})

    const reservation = await ReservationsModel.create(
      {
        name: req.body.name,
        email: req.body.email,
        partyOf: req.body.partyOf,
        //comment: req.body.comment,
        inventoryID: req.body.inventoryID,
        reservationTime: req.body.slot
      }
    )
    if (reservation === null) {
      return res.status(400).json({msg: 'error!'})
    }
    return res.send(reservation)

    //return res.send(req.body)
  }
}
