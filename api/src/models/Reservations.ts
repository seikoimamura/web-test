import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey, Table,
  UpdatedAt,
  ForeignKey, BelongsTo
} from 'sequelize-typescript'
import {Inventories} from './index'

@Table({ tableName: 'Reservations' })
export class Reservations extends Model<Reservations> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column
  name: string

  @Column
  email: string

  @Column
  partyOf: number

  @Column
  comment: string

  @ForeignKey(() => Inventories)
  @Column
  inventoryID: number

  @BelongsTo(() => Inventories)
  inventoreis: Inventories

  @Column
  reservationTime: string

  @DeletedAt
  deleted_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
}
