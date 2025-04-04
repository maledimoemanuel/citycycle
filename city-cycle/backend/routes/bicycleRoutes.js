const express = require('express');
router = express.Router();
const Bicycle = require('../models/Bicycle');

router.get('/', async(req, res) => {
    try {
        const bicycles = await Bicycle.find({
            hubId: req.params.hubId,
            status: 'available'
        });
        res.json(bicycles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.get('/maintenance-due', async(req, res) => {
    try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const bicycles = await Bicycle.find({
            $or: [
                { lastMaintenanceDate: { $lt: thirtyDaysAgo } },
                { lastMaintenanceDate: { $exists: false}}
            ]
        });
        res.json(bicycles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

module.exports = router;