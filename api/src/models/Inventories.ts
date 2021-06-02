import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  PrimaryKey, Table,
  UpdatedAt,
  HasMany,
  DataType
} from 'sequelize-typescript'
import {Reservations} from './index'

@Table({ tableName: 'Inventories' })
export class Inventories extends Model<Inventories> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column
  name: string

  @Column
  comment: string

  @Column({
    type: DataType.DATEONLY,
    unique: true,
    allowNull: false
  })
  reservationDate: string

  @Column(DataType.JSON)
  slots: object

  @HasMany(() => Reservations)
  Reservations: Reservations[]

  @Column
  openTime: string

  @Column
  closeTime: string

  @DeletedAt
  deleted_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
}
