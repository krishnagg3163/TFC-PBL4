"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finderRouter = void 0;
const express_1 = require("express");
exports.finderRouter = (0, express_1.Router)();
exports.finderRouter.post("/identify", (_req, res) => {
    res.json({
        items: [
            {
                name: "White T-Shirt",
                category: "tops",
                brand: "Unknown",
            },
        ],
    });
});
