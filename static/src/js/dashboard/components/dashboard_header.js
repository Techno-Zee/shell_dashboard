/** @odoo-module **/
import { Component } from "@odoo/owl";
import { DateFilter } from "./date_filter";
import { ExportMenu } from "./export_menu";

export class DashboardHeader extends Component {
    static template = "shell_dashboard.DashboardHeader";
    static components = { DateFilter, ExportMenu };
    static props = {
        isAdmin: Boolean,
        onAddItem: Function,
        onExportPDF: Function,
        onExportPNG: Function,
        onExportCSV: Function,
        // Props untuk DateFilter
        dateRangeText: String,
        showDatePicker: Boolean,
        startDate: { type: String, optional: true },   // ✅ ubah dari Object
        endDate: { type: String, optional: true },
        toggleDatePicker: Function,
        applyDateFilter: Function,
        resetDateFilter: Function,
        // Tombol auto refresh & refresh
        autoRefresh: Boolean,
        refreshCountdown: Number,
        onToggleAutoRefresh: Function,
        onRefresh: Function,
    };

    // Daftar tipe block untuk menu dropdown
    blockTypes = [
        { id: "tile", name: "tile", label: "Tile", icon: "fa fa-square me-2" },
        { id: "kpi", name: "kpi", label: "KPI", icon: "fa fa-arrow-up me-2" },
        { id: "graph_bar", name: "graph", subtype: "bar", label: "Bar Chart", icon: "fa fa-bar-chart me-2" },
        { id: "graph_line", name: "graph", subtype: "line", label: "Line Chart", icon: "fa fa-line-chart me-2" },
        { id: "graph_pie", name: "graph", subtype: "pie", label: "Pie Chart", icon: "fa fa-pie-chart me-2" },
        { id: "graph_doughnut", name: "graph", subtype: "doughnut", label: "Donut Chart", icon: "fa fa-circle me-2" },
        { id: "graph_radar", name: "graph", subtype: "radar", label: "Radar Chart", icon: "fa fa-bullseye me-2" },
        { id: "list", name: "list", label: "Table", icon: "fa fa-table me-2" },
    ];
}