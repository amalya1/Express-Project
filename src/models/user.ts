import {
  Table, Model, Column, DataType, HasMany,
} from 'sequelize-typescript';
import File from "./file";

@Table({
  timestamps: false,
  tableName: 'User',
})
export default class User extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,  })
    id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  userName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    allowNull: true,
  })
  timeStamp: number;

  @HasMany(() => File, {
    onDelete: "CASCADE",
  })
  File!: File[];

}

