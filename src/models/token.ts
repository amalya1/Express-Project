import {
  Table, Model, Column, DataType,
} from 'sequelize-typescript';

@Table({
  timestamps: false,
  tableName: 'Token',
})
export default class Token extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id',
    }
  })
  userId!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  token!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  expirationDate!: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  createdAt!: string;
}

