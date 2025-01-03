import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Message } from "./Message";
import { Team } from "./Team";

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", nullable: true })
    assignee!: string | null;

    @ManyToOne(() => Team, { nullable: true })
    assignedGroup!: Team | null;

    @Column("simple-array")
    tags!: string[];

    @Column()
    status!: string;

    @OneToMany(() => Message, (message) => message.ticket)
    messages!: Message[];

    @Column("simple-array")
    categories!: string[];

    @Column()
    dateOpened!: Date;

    @Column({ type: "datetime", nullable: true })
    dateClosed!: Date | null;

    @Column({ type: "varchar", nullable: true })
    threadId!: string | null;

    @Column({ type: "varchar" })
    ownerId!: string;
}
