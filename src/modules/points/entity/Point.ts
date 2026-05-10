import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PointType {
    Client = "client",
    Pole = "pole"
}


@Entity("points")
export class Point {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: "enum",
        enum: PointType,
    })
    type!: PointType;


    @Column({
        type:  "double precision"
    })
    latitude!: number;

    @Column({
        type: "double precision"
    })
    longitude!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
