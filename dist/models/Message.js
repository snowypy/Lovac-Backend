var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Ticket } from "./Ticket";
let Message = class Message {
    id;
    author;
    username;
    message;
    isStaff;
    isAdmin;
    date;
    authorAvatar;
    createdAt;
    ticket;
    staffRole;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Message.prototype, "author", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Message.prototype, "username", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Message.prototype, "message", void 0);
__decorate([
    Column(),
    __metadata("design:type", Boolean)
], Message.prototype, "isStaff", void 0);
__decorate([
    Column(),
    __metadata("design:type", Boolean)
], Message.prototype, "isAdmin", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Message.prototype, "date", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Message.prototype, "authorAvatar", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Message.prototype, "createdAt", void 0);
__decorate([
    ManyToOne(() => Ticket, (ticket) => ticket.messages, { nullable: true }),
    __metadata("design:type", Object)
], Message.prototype, "ticket", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Message.prototype, "staffRole", void 0);
Message = __decorate([
    Entity()
], Message);
export { Message };
