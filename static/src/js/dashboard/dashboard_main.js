/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { session } from "@web/session";
import { DashboardHeader } from "./components/dashboard_header";
import { DashboardTile } from "./components/dashboard_tile";
import { DashboardChart } from "./components/dashboard_chart";
import { DashboardTable } from "./components/dashboard_table";
import { DashboardKPI } from "./components/dashboard_kpi";

export class ShellDashboard extends Component {
    static template = "shell_dashboard.Dashboard";
    static components = {
        DashboardHeader,
        DashboardTile,
        DashboardChart,
        DashboardTable,
        DashboardKPI,
    };

    setup() {
        super.setup();

        // Use service
        this.action = useService("action");
        this.orm = useService("orm");
        this.dialog = useService("dialog");
        this.notification = useService("notification");

        this.state = useState({
            loading: false,
            autoRefresh: false,
            refreshCountdown: 30,
            showDatePicker: false,
            startDate: '',
            endDate: '',
            name: session.partner_display_name,
            isAdmin: false,
            isManager: false,
            isUser: false,
            blocks: [],
        });

        this.countdownInterval = null;

        // ========== BIND ALL METHODS ==========
        this.loadRoles = this.loadRoles.bind(this);
        this.initializeDashboard = this.initializeDashboard.bind(this);
        this.toggleDatePicker = this.toggleDatePicker.bind(this);
        this.getDateRangeText = this.getDateRangeText.bind(this);
        this.toggleAutoRefresh = this.toggleAutoRefresh.bind(this);
        this.startAutoRefresh = this.startAutoRefresh.bind(this);
        this.stopAutoRefresh = this.stopAutoRefresh.bind(this);
        this.refreshDashboard = this.refreshDashboard.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.resolveComponent = this.resolveComponent.bind(this);

        this.loadRoles();
        onMounted(async () => {
            await this.initializeDashboard();
            this.setupEventListeners();
        });
        onWillUnmount(() => {
            this.stopAutoRefresh();
        });
    }

    async loadRoles() {
        const res = await this.orm.call("res.users", "get_shell_dashboard_roles", []);
        Object.assign(this.state, {
            isAdmin: res.is_admin,
            isManager: res.is_manager,
            isUser: res.is_user,
        });
    }

    async initializeDashboard() {
        this.state.loading = true;
        try {
            const actionId = this.props.action.id;
            const blocks = await this.orm.call("dashboard.block", "get_dashboard_vals", [actionId]);
            // grid_position tidak lagi digunakan, tetapi tetap disimpan untuk keperluan lain
            this.state.blocks = blocks;
        } catch (error) {
            console.error("Error initializing dashboard:", error);
            this.notification.add("Failed to load dashboard", { type: "danger" });
        } finally {
            this.state.loading = false;
        }
    }

    onClickAddItem = (type, chartType = null) => {
        const context = {
            default_type: type,
            default_name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            default_client_action_id: parseInt(this.props.action.id),
        };
        // Sesuaikan default height/width/icon sesuai tipe
        if (type === 'tile') {
            context.default_fa_icon = 'fa fa-cube';
        } else if (type === 'kpi') {
            context.default_fa_icon = 'fa fa-chart-line';
        } else if (type === 'graph') {
            context.default_graph_type = chartType || 'bar';
            context.default_fa_icon = `fa fa-${chartType || 'bar'}-chart`;
        } else if (type === 'list') {
            context.default_fa_icon = 'fa fa-table';
        }
        this.action.doAction({
            type: 'ir.actions.act_window',
            res_model: 'dashboard.block',
            views: [[false, 'form']],
            target: 'new',
            context,
        });
    };

    toggleDatePicker() {
        // console.log(this.state.showDatePicker)
        this.state.showDatePicker = !this.state.showDatePicker;
    }

    getDateRangeText() {
        if (!this.state.startDate && !this.state.endDate) return "Select Date Range";
        const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
        return `${formatDate(this.state.startDate)} ${this.state.startDate && this.state.endDate ? ' - ' : ''}${formatDate(this.state.endDate)}`;
    }

    applyDateFilter = async (start, end) => {
        this.state.showDatePicker = false;
        this.state.loading = true;
        try {
            const blocks = await this.orm.call("dashboard.block", "get_dashboard_vals", [this.props.action.id, start, end]);
            this.state.blocks = blocks;
            this.notification.add("Date filter applied", { type: "success" });
        } catch (error) {
            this.notification.add("Failed to apply date filter", { type: "danger" });
        } finally {
            this.state.loading = false;
        }
    };

    resetDateFilter = () => {
        this.state.startDate = '';
        this.state.endDate = '';
        this.state.showDatePicker = false;
        this.initializeDashboard();
    };

    toggleAutoRefresh() {
        this.state.autoRefresh = !this.state.autoRefresh;
        if (this.state.autoRefresh) this.startAutoRefresh();
        else this.stopAutoRefresh();
    }

    startAutoRefresh() {
        this.state.refreshCountdown = 30;
        this.countdownInterval = setInterval(() => {
            this.state.refreshCountdown--;
            if (this.state.refreshCountdown <= 0) {
                this.refreshDashboard();
                this.state.refreshCountdown = 30;
            }
        }, 1000);
    }

    stopAutoRefresh() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    async refreshDashboard() {
        this.state.loading = true;
        try {
            await this.initializeDashboard();
            this.notification.add("Dashboard refreshed", { type: "success" });
        } catch (error) {
            console.error("Error refreshing dashboard:", error);
        } finally {
            this.state.loading = false;
        }
    }

    exportAsPDF = () => console.log("Export PDF");
    exportAsPNG = () => console.log("Export PNG");
    exportAsCSV = () => console.log("Export CSV");

    setupEventListeners() {
        document.addEventListener('click', (event) => {
            if (this.state.showDatePicker && !event.target.closest('.date-filter-container')) {
                this.state.showDatePicker = false;
            }
        });
        // Refresh dashboard ketika ada block yang di-delete (trigger dari komponen anak)
        this.env.bus.addEventListener('dashboard:refresh', () => {
            this.initializeDashboard();
        });
    }

    resolveComponent(type) {
        switch (type) {
            case "tile": return DashboardTile;
            case "graph": return DashboardChart;
            case "list": return DashboardTable;
            case "kpi": return DashboardKPI;
            default: return null;
        }
    }
}

registry.category("actions").add("shell_dashboard.action", ShellDashboard);