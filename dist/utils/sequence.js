"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextSequenceValue = getNextSequenceValue;
const data_source_1 = require("../data-source");
const Counter_1 = require("../models/Counter");
function getNextSequenceValue(sequenceName) {
    return __awaiter(this, void 0, void 0, function* () {
        const counterRepository = data_source_1.AppDataSource.getRepository(Counter_1.Counter);
        let counter = yield counterRepository.findOne({ where: { name: sequenceName } });
        if (!counter) {
            counter = new Counter_1.Counter();
            counter.name = sequenceName;
            counter.value = 0;
        }
        counter.value += 1;
        yield counterRepository.save(counter);
        return counter.value;
    });
}
