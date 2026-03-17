"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../../.env' });
async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI not defined');
    }
    try {
        await mongoose_1.default.connect(uri);
        console.log('MongoDB connected successfully!');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
