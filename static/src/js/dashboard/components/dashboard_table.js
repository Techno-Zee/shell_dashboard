/** @odoo-module **/
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class DashboardTable extends Component {
  static template = "shell_dashboard.Table";

  setup() {
    super.setup();
    this.action = useService("action");
    this.dialog = useService("dialog");
    this.notification = useService("notification");
    this.orm = useService("orm");
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

  openRecord = async (row) => {
    if (!this.props.block.model_name || !row.id) return;

    try {
      await this.action.doAction({
        type: "ir.actions.act_window",
        res_model: this.props.block.model_name,
        res_id: row.id,
        view_mode: "form",
        views: [[false, "form"]],
        target: "current",
      });
    } catch (error) {
      console.error("Error opening record:", error);
    }
  };

  formatCellValue(row, colName) {
    const value = row[colName];

    // Jika value undefined/null
    if (value === undefined || value === null) {
      return "";
    }

    // Jika value adalah Many2one (array [id, name])
    if (Array.isArray(value) && value.length === 2) {
      return value[1]; // kembalikan display name
    }

    // Jika value adalah object (misal Many2one dengan struktur berbeda atau relasi lain)
    if (typeof value === "object" && value !== null) {
      // Coba cari property 'name' atau 'display_name'
      if (value.name) return value.name;
      if (value.display_name) return value.display_name;
      // Fallback ke JSON string (tapi hati2 kepanjangan)
      return JSON.stringify(value);
    }

    // Boolean: tampilkan Yes/No atau true/false
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // Date/Datetime: jika format ISO, bisa diformat
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      // optional: format tanggal lokal
      return value;
    }

    // Default: toString
    return String(value);
  }
}
