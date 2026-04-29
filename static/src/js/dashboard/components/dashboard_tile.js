/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class DashboardTile extends Component {
    static template = "shell_dashboard.DashboardTile"; // SATU template untuk semua varian

    setup() {
        super.setup();

        this.action = useService("action");
        this.dialog = useService("dialog");
        this.notification = useService("notification");
        this.orm = useService("orm");

        this.state = useState({
            TileTheme: "tile_icon_circle", // default key
        });

        onWillStart(async () => {
            await this._loadTileTheme();
        });
    }

    async _loadTileTheme() {
        try {
            const settings = await this.orm.call("res.config.settings", "get_values", []);
            let templateXml = settings.tile_template; // Misal "shell_dashboard.TileIconCircle"
            // Petakan ke key pendek untuk memudahkan t-if
            const themeMap = {
                "shell_dashboard.TileIconCircle": "tile_icon_circle",
                "shell_dashboard.TileStatsWithTrend": "tile_stats_with_trend",
                "shell_dashboard.TileCompactSubvalue": "tile_compact_subvalue",
            };
            this.state.TileTheme = themeMap[templateXml] || "tile_icon_circle";
        } catch (error) {
            console.error("Error loading tile theme:", error);
            this.state.TileTheme = "tile_icon_circle";
        }
    }

    // Helper untuk badge trend
    getTrendClass(trendDirection) {
        switch (trendDirection) {
            case "up": return "bg-success";
            case "down": return "bg-danger";
            default: return "bg-secondary";
        }
    }

    getTrendIcon(trendDirection) {
        switch (trendDirection) {
            case "up": return "fa fa-arrow-up me-1";
            case "down": return "fa fa-arrow-down me-1";
            default: return "fa fa-minus me-1";
        }
    }

    async configureBlock() {
        try {
            await this.action.doAction({
                type: "ir.actions.act_window",
                res_model: "dashboard.block",
                res_id: this.props.block.id,
                view_mode: "form",
                views: [[false, "form"]],
                target: "new",
            });
        } catch (error) {
            console.error("Error configuring block:", error);
            this.notification.add("Failed to configure block", { type: "danger" });
        }
    }

    async openRecords() {
        if (!this.props.block.model_name) return;
        try {
            await this.action.doAction({
                type: "ir.actions.act_window",
                res_model: this.props.block.model_name,
                view_mode: "list,form",
                views: [[false, "list"], [false, "form"]],
                domain: this.props.block.domain || [],
                context: {},
            });
        } catch (error) {
            console.error("Error opening records:", error);
            this.notification.add("Failed to open records", { type: "danger" });
        }
    }
}