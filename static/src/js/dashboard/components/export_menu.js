/** @odoo-module **/
import { Component } from "@odoo/owl";

export class ExportMenu extends Component {
    static template = "shell_dashboard.ExportMenu";
    static props = {
        onExportPDF: Function,
        onExportPNG: Function,
        onExportCSV: Function,
    };

    setup() {
        // Tidak perlu state internal
    }
}