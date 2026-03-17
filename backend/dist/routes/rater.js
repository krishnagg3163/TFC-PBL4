"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raterRouter = void 0;
const express_1 = require("express");
exports.raterRouter = (0, express_1.Router)();
exports.raterRouter.post("/rate", (_req, res) => {
    res.json({
        overall: 4.2,
        scores: {
            style: 4,
            color: 4,
            texture: 4.5,
            fit: 4.3,
        },
        feedback: "Great outfit!",
    });
});
