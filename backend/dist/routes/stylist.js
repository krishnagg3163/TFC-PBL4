"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylistRouter = void 0;
const express_1 = require("express");
exports.stylistRouter = (0, express_1.Router)();
exports.stylistRouter.post("/chat", (_req, res) => {
    res.json({
        message: "Here is your outfit suggestion!",
        outfit: [],
    });
});
