/** @odoo-module **/
import { Component, useState, onWillStart, useRef, onMounted, onPatched } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class DashboardKPI extends Component {
    static template = "shell_dashboard.DashboardKPI"; // SATU template untuk semua varian

    setup() {
        super.setup();

        this.action = useService("action");
        this.dialog = useService("dialog");
        this.notification = useService("notification");
        this.orm = useService("orm");

        // Ref untuk ring progress (hanya digunakan jika varian ring)
        this.ringRef = useRef("ring");

        this.state = useState({
            KPITheme: "kpi_ring_progress", // default key
        });

        onWillStart(async () => {
            await this._loadKPITheme();
        });

        // Untuk ring progress, update progress saat mount atau patch
        onMounted(() => this.initProgress());
        onPatched(() => this.initProgress());
    }

    async _loadKPITheme() {
        try {
            const settings = await this.orm.call("res.config.settings", "get_values", []);
            let templateXml = settings.kpi_template; // Misal "shell_dashboard.KPIRingProgress"
            // Petakan ke key pendek untuk memudahkan t-if
            const themeMap = {
                "shell_dashboard.KPIRingProgress": "kpi_ring_progress",
                "shell_dashboard.KPITrendBadgeIcon": "kpi_trend_badge_icon",
                "shell_dashboard.KPILinearProgress": "kpi_linear_progress",
            };
            this.state.KPITheme = themeMap[templateXml] || "kpi_ring_progress";
            console.log("KPI theme loaded:", this.state.KPITheme);
        } catch (error) {
            console.error("Error loading KPI theme:", error);
            this.state.KPITheme = "kpi_ring_progress";
        }
    }

    // Inisialisasi ring progress (hanya dipanggil jika elemen ring ada)
    initProgress() {
        const ring = this.ringRef?.el;
        if (!ring) return;

        const percent = parseFloat(ring.dataset.progress || 0);
        const circle = ring.querySelector('.progress-bar');
        if (!circle) return;

        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;

        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;

        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    getTrendClass(trendDirection) {
        switch (trendDirection) {
            case 'up': return 'bg-success';
            case 'down': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }

    getTrendIcon(trendDirection) {
        switch (trendDirection) {
            case 'up': return 'fa fa-arrow-up me-1';
            case 'down': return 'fa fa-arrow-down me-1';
            default: return 'fa fa-minus me-1';
        }
    }

    async configureBlock() {
        try {
            await this.action.doAction({
                type: 'ir.actions.act_window',
                res_model: 'dashboard.block',
                res_id: this.props.block.id,
                view_mode: 'form',
                views: [[false, 'form']],
                target: 'new'
            });
        } catch (error) {
            console.error("Error configuring block:", error);
            this.notification.add("Failed to configure block", { type: "danger" });
        }
    }

    async deleteBlock() {
        try {
            const confirmed = await this.dialog.confirm("Are you sure you want to delete this KPI?", {
                title: "Confirm Deletion"
            });

            if (confirmed) {
                await this.orm.unlink("dashboard.block", [this.props.block.id]);
                this.notification.add("KPI deleted successfully", { type: "success" });
                this.env.bus.trigger('dashboard:refresh');
            }
        } catch (error) {
            console.error("Error deleting KPI:", error);
            this.notification.add("Failed to delete KPI", { type: "danger" });
        }
    }

    async openRecords() {
        if (!this.props.block.model_name) return;

        try {
            await this.action.doAction({
                type: 'ir.actions.act_window',
                res_model: this.props.block.model_name,
                view_mode: 'list',
                views: [[false, 'list'], [false, 'form']],
                domain: this.props.block.domain || [],
                context: {}
            });
        } catch (error) {
            console.error("Error opening records:", error);
            this.notification.add("Failed to open records", { type: "danger" });
        }
    }
}