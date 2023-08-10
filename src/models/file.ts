import {
  Table, Model, Column, DataType, BelongsTo, ForeignKey, PrimaryKey,
} from 'sequelize-typescript';
import User from "./user";

@Table({
  timestamps: false,
  tableName: 'File',
})
export default class File extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  userId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  originName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mimeType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  size!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  path!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  timeStamp!: number;

@BelongsTo(() => User, {
  onDelete: "CASCADE",
})
User!: User;

}

