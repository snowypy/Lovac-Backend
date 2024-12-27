var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Message } from "./Message";
import { Team } from "./Team";
let Ticket = class Ticket {
    id;
    assignee;
    assignedGroup;
    tags;
    status;
    messages;
    categories;
    dateOpened;
    dateClosed;
    threadId;
    ownerId;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], Ticket.prototype, "assignee", void 0);
__decorate([
    ManyToOne(() => Team, { nullable: true }),
    __metadata("design:type", Object)
], Ticket.prototype, "assignedGroup", void 0);
__decorate([
    Column("simple-array"),
    __metadata("design:type", Array)
], Ticket.prototype, "tags", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Ticket.prototype, "status", void 0);
__decorate([
    OneToMany(() => Message, (message) => message.ticket),
    __metadata("design:type", Array)
], Ticket.prototype, "messages", void 0);
__decorate([
    Column("simple-array"),
    __metadata("design:type", Array)
], Ticket.prototype, "categories", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Ticket.prototype, "dateOpened", void 0);
__decorate([
    Column({ type: "datetime", nullable: true }),
    __metadata("design:type", Object)
], Ticket.prototype, "dateClosed", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", Object)
], Ticket.prototype, "threadId", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], Ticket.prototype, "ownerId", void 0);
Ticket = __decorate([
    Entity()
], Ticket);
export { Ticket };
